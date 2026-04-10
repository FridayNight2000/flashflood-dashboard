'use client';

import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';

import type { Map as LeafletMapInstance } from 'leaflet';
import { latLngBounds } from 'leaflet';
import { useCallback, useMemo, useState } from 'react';
import { AttributionControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import useSWR from 'swr';

import { useMapState } from '@/hooks/useMapState';
import { useStationSearch } from '@/hooks/useStationSearch';
import type { Station, StationsApiResponse } from '@/types';

import { MapInstanceWatcher, MapSizeWatcher, ZoomWatcher } from './components/MapEventWatchers';
import MapSearchbar from './components/MapSearchbar';
import StationMarkers from './components/StationMarkers';
import StationSidePanel from './components/StationSidePanel';
import { normalizeText, stationDisplayName } from './mapUtils';

const center: [number, number] = [36.2048, 138.2529];
const japanBounds: [[number, number], [number, number]] = [
  [20.0, 122.0],
  [46.5, 154.0],
];

// 作用：地图页的数据入口，负责从 `/api/stations` 一次性拉取全部站点数据，给 `LeafletMap` 和下游搜索/标注/侧边栏模块提供统一数据源。
// 输入：无显式参数；内部用足够大的 pageSize 保证一次请求拿完所有站点（当前总量约 1922 条）。
// 输出：返回 `Promise<Station[]>`，即全部站点的数组；请求失败时抛出异常，交给 SWR 统一处理错误状态。
// 为什么这样写：地图上的搜索、流域聚合和 marker 渲染都依赖全量站点，如果在多个组件里分别取数会造成状态分裂；
//   站点总量固定且有限，一次请求比分页循环更简单，少一次 RTT。
async function fetchAllStations(): Promise<Station[]> {
  const res = await fetch('/api/stations?page=1&pageSize=5000&hasData=1');
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const data = (await res.json()) as StationsApiResponse;
  return data.items;
}

// 作用：地图子系统的页面级协调组件，串联“数据获取 + 搜索索引 + 地图实例 + marker 渲染 + 右侧详情面板”这几条主流程。
// 输入：无 props；依赖 SWR、`useMapState`、`useStationSearch` 和 Leaflet 地图实例作为内部状态来源。
// 输出：返回地图页主界面的 React 节点，向下游组件分发站点数据、选中态、预览态、缩放态和交互回调。
// 为什么这样写：把地图页作为编排层，业务状态集中在这里，子组件只负责渲染和局部交互，能降低 `StationMarkers`、`MapSearchbar`、`StationSidePanel` 之间的耦合。
export default function LeafletMap() {
  const noMatchHint = 'No results matched';

  // fetch stations data
  const {
    data: stations = [], // 解构data, 重命名 stations ,默认值 [] 防止出现错误
    error: stationsError,
    isLoading,
  } = useSWR('stations:all', fetchAllStations, {
    revalidateOnFocus: false, // 切回tab 不重新运行fetch 函数
  });
  const error = stationsError ? 'Failed to load stations.' : null;

  const [basinTab, setBasinTab] = useState<{
    basinName: string;
    stationCount: number;
  } | null>(null);
  const [stationTab, setStationTab] = useState<Station | null>(null);
  const [activeTab, setActiveTab] = useState<'basin' | 'station' | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMapInstance | null>(null);

  //一个"站点数组"按流域分组成"流域 → 站点列表"的索引，方便 O(1) 查找。
  const basinGroups = useMemo(() => {
    const groups = new Map<string, Station[]>();
    stations.forEach((station) => {
      const name = station.basin_name?.trim();
      if (!name) {
        return;
      }
      const list = groups.get(name) ?? [];
      list.push(station);
      groups.set(name, list);
    });
    return groups;
  }, [stations]);

  // 对basinGroups 每个流域名生成一个对象，保留原始名和"标准化"后的名，
  const basinSearchIndex = useMemo(
    () =>
      Array.from(basinGroups.keys()).map((name) => ({
        name,
        normalizedName: normalizeText(name), // normalizeText 用于去除前后空白 以防万一
      })), // { name: " 吉野川 ", normalizedName: "吉野川" }
    [basinGroups],
  ); // basinSearchIndex (数组) ->传给 useStationSearch 用于搜索框的流域候选匹配

  // 将stations 变成一个station 搜索用 array
  const stationSearchIndex = useMemo(
    () =>
      stations.map((station) => ({
        station,
        names: [station.station_name, station.station_name2, station.station_name3]
          .map((name) => normalizeText(name))
          .filter(Boolean),
      })),
    [stations],
  );
  //   {
  //   station: { station_id: "...", station_name: "吉野川", ... },  // 原始站点对象
  //   names: ["よしのがわ", "yoshinogawa"]  // 标准化后的名称列表（已过滤空值）
  // }

  const {
    zoom,
    setZoom,
    selectedStationId,
    previewStationId,
    commitStationSelection,
    clearPreview,
    handlePreviewChange,
    handleActivateStationTab,
    handleCloseStationTab,
    handleCloseBasinTab,
  } = useMapState({
    mapInstance,
    basinTab,
    stationTab,
    activeTab,
    setBasinTab,
    setStationTab,
    setActiveTab,
  });

  const markerRadius = useMemo(() => {
    const radius = 1.2 * Math.pow(1.35, zoom - 4);
    return Math.min(10, Math.max(1.2, radius));
  }, [zoom]);

  const basinHighlightedStationIds = useMemo(() => {
    if (!basinTab || activeTab !== 'basin') {
      return [];
    }
    const basinStations = basinGroups.get(basinTab.basinName) ?? [];
    return basinStations.map((station) => station.station_id);
  }, [activeTab, basinGroups, basinTab]);

  // 作用：地图视角控制器，给搜索结果和流域选择提供统一的“飞到目标站点/站点集合”能力。
  // 输入：`targetStations: Station[]`，通常来自搜索命中结果或流域下的站点集合；同时依赖当前 `mapInstance`。
  // 输出：无返回值；副作用是调用 Leaflet 的 `flyTo` 或 `fitBounds` 改变地图中心和缩放级别。
  // 为什么这样写：单站点和多站点的视角策略不同，拆成一个稳定回调后，搜索 hook 不需要理解 Leaflet 细节，只需要告诉页面层“该看哪些站点”。
  const zoomToStations = useCallback(
    (targetStations: Station[]) => {
      if (!mapInstance || targetStations.length === 0) {
        return;
      }

      if (targetStations.length === 1) {
        const target = targetStations[0];
        mapInstance.flyTo([target.latitude as number, target.longitude as number], 11, {
          animate: true,
          duration: 1.0,
        });
        return;
      }

      const bounds = latLngBounds(
        targetStations.map(
          (station) =>
            [station.latitude as number, station.longitude as number] as [number, number],
        ),
      );
      mapInstance.fitBounds(bounds.pad(0.15), {
        animate: true,
        duration: 1.0,
      });
    },
    [mapInstance],
  );

  const {
    searchText,
    searchHintText,
    searchSuggestions,
    selectedSearchItem,
    handleSearchSubmit,
    handleSuggestionSelect,
    handleSearchTextChange,
  } = useStationSearch({
    stations,
    basinGroups,
    basinSearchIndex,
    stationSearchIndex,
    mapInstance,
    zoomToStations,
    commitStationSelection,
    clearPreview,
    setBasinTab,
    setActiveTab,
    noMatchHint,
    getDisplayName: stationDisplayName,
  });

  // 作用：在侧边栏或其他入口打开“流域详情 tab”，把当前界面切换到流域上下文，并同步清理站点预览态。
  // 输入：`basinName: string`，通常来自站点详情面板中的流域入口或搜索命中结果。
  // 输出：无返回值；副作用是更新 `basinTab`、`activeTab`，并关闭地图 popup。
  // 为什么这样写：流域 tab 的开启不仅是设置名称，还要同步重置 preview 和弹窗，否则界面上会同时残留站点 hover 态和旧 popup，状态会冲突。
  const handleOpenBasinTab = useCallback(
    (basinName: string) => {
      const trimmed = basinName.trim();
      if (!trimmed) {
        return;
      }
      const matched = basinGroups.get(trimmed) ?? [];
      setBasinTab({
        basinName: trimmed,
        stationCount: matched.length,
      });
      setActiveTab('basin');
      clearPreview();
      mapInstance?.closePopup();
    },
    [basinGroups, clearPreview, mapInstance],
  );

  // 作用：当流域 tab 已存在时，把右侧面板焦点切回流域视图。
  // 输入：无显式参数；依赖当前 `basinTab` 是否存在。
  // 输出：无返回值；副作用是更新 `activeTab` 为 `'basin'`。
  // 为什么这样写：激活已有 tab 和新建 tab 是两种不同语义，拆开后调用方不需要重复判断“是否已打开”，页面状态切换也更清晰。
  const handleActivateBasinTab = useCallback(() => {
    if (!basinTab) {
      return;
    }
    setActiveTab('basin');
  }, [basinTab]);

  // return UI
  return (
    <div className="relative w-full h-full map-shell">
      <MapSearchbar
        isLoading={isLoading}
        error={error}
        searchText={searchText}
        searchHint={searchHintText}
        suggestions={searchSuggestions}
        selectedItem={selectedSearchItem}
        onSearchTextChange={handleSearchTextChange}
        onSubmit={handleSearchSubmit}
        onSuggestionSelect={handleSuggestionSelect}
      />
      <MapContainer
        center={center}
        zoom={5.4}
        zoomControl={false}
        minZoom={5.4}
        maxZoom={12}
        maxBounds={japanBounds}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="w-full h-full overflow-hidden"
        attributionControl={false}
      >
        <MapSizeWatcher />
        <ZoomWatcher onZoomChange={setZoom} />
        <MapInstanceWatcher onMapReady={setMapInstance} />
        <ZoomControl position="bottomright" />
        <AttributionControl position="bottomleft" />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          noWrap
        />

        <StationMarkers
          stations={stations}
          markerRadius={markerRadius}
          activeTab={activeTab}
          selectedStationId={selectedStationId}
          previewStationId={previewStationId}
          basinHighlightedStationIds={basinHighlightedStationIds}
          onPreviewChange={handlePreviewChange}
          onCommitSelection={commitStationSelection}
          getDisplayName={stationDisplayName}
        />
      </MapContainer>
      <StationSidePanel
        activeTab={activeTab}
        basinTab={basinTab}
        stationTab={stationTab}
        onActivateBasinTab={handleActivateBasinTab}
        onOpenBasinTab={handleOpenBasinTab}
        onActivateStationTab={handleActivateStationTab}
        onCloseStationTab={handleCloseStationTab}
        onCloseBasinTab={handleCloseBasinTab}
        getDisplayName={stationDisplayName}
      />
    </div>
  );
}
