'use client';

import './StationMarkers.css';

import { memo, useMemo } from 'react';
import { CircleMarker, Pane, Popup } from 'react-leaflet';

import type { Station } from '@/types';

type StationMarkersProps = {
  stations: Station[];
  markerRadius: number;
  activeTab: 'basin' | 'station' | null;
  selectedStationId: string | null;
  previewStationId: string | null;
  basinHighlightedStationIds: string[];
  onPreviewChange: (stationId: string | null) => void;
  onCommitSelection: (station: Station) => void;
  getDisplayName: (station: Station) => string;
};

// 作用：地图渲染层里的站点标注组件，负责把页面层传下来的站点状态映射成 Leaflet marker、popup 和高亮层级。
// 输入：站点列表、marker 半径、当前激活 tab、选中/预览站点 id、流域高亮集合，以及预览/提交选择的回调函数。
// 输出：返回一组 `Pane + CircleMarker + Popup` React 节点；用户交互后通过回调把状态变化回传给 `LeafletMap`。
// 为什么这样写：站点视觉状态来自页面层统一管理，这个组件只做“状态到地图元素”的投影；再用 `memo` 包裹，可以减少地图上大量 marker 的重复渲染成本。
function StationMarkers({
  stations,
  markerRadius,
  activeTab,
  selectedStationId,
  previewStationId,
  basinHighlightedStationIds,
  onPreviewChange,
  onCommitSelection,
  getDisplayName,
}: StationMarkersProps) {
  const basinHighlightedSet = useMemo(
    () => new Set(basinHighlightedStationIds),
    [basinHighlightedStationIds],
  );

  return (
    <>
      <Pane
        name="station-base"
        style={{ zIndex: 610 }}
      />
      <Pane
        name="station-preview"
        style={{ zIndex: 620 }}
      />
      <Pane
        name="station-selected"
        style={{ zIndex: 630 }}
      />

      {/* 普通站点 (610)  ←  被压在最底层，半透明
      ↓
      预览站点 (620)  ←  hover/popup 时浮出来
      ↓
      选中站点 (630)  ←  始终在最顶层，带脉冲动画 */}

      {stations.map((station) => {
        const stationId = station.station_id;
        const isSelected = activeTab === 'station' && selectedStationId === stationId;
        const isPreview = !isSelected && previewStationId === stationId;
        const isBasinHighlighted =
          activeTab === 'basin' && !isSelected && !isPreview && basinHighlightedSet.has(stationId);

        const pane = isSelected
          ? 'station-selected'
          : isPreview
            ? 'station-preview'
            : 'station-base';

        const fillColor = isSelected
          ? '#F85552'
          : isPreview
            ? '#F7A34B'
            : isBasinHighlighted
              ? '#4A9ECE'
              : '#3A94C5';

        const strokeColor = isSelected
          ? '#C12624'
          : isPreview
            ? '#C6741A'
            : isBasinHighlighted
              ? '#2F7EA8'
              : '#6B7B85';

        const fillOpacity = isSelected ? 1 : isPreview ? 0.95 : isBasinHighlighted ? 0.85 : 0.4;

        const weight = isSelected ? 2 : isPreview ? 1.5 : isBasinHighlighted ? 1 : 0.6;

        return (
          <CircleMarker
            key={stationId}
            center={[station.latitude as number, station.longitude as number]}
            radius={markerRadius}
            pane={pane}
            pathOptions={{
              fillColor,
              color: strokeColor,
              stroke: true,
              opacity: 1,
              weight,
              fillOpacity,
              className: isSelected ? 'selected-pulse' : undefined,
            }}
            eventHandlers={{
              popupopen: () => onPreviewChange(stationId),
              popupclose: () => onPreviewChange(null),
            }}
          >
            <Popup>
              <div>
                <div className="mb-1.5 text-slate-900 font-bold">{getDisplayName(station)}</div>
                <div>ID: {station.station_id}</div>
                <div>Basin: {station.basin_name || '-'}</div>
                <button
                  type="button"
                  className="mt-2 border-0 bg-transparent p-0 text-[#0f5487] font-bold underline cursor-pointer hover:text-[#0a4068] focus-visible:outline-2 focus-visible:outline-[#7fb1d1] focus-visible:outline-offset-2"
                  onClick={() => onCommitSelection(station)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default memo(StationMarkers);
