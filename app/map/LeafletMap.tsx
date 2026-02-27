'use client';

import 'leaflet/dist/leaflet.css';

import type { Map as LeafletMapInstance } from 'leaflet';
import { latLngBounds } from 'leaflet';
import { useCallback, useMemo, useState } from 'react';
import { AttributionControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import useSWR from 'swr';

import { MapInstanceWatcher, ZoomWatcher } from '@/components/map/MapEventWatchers';
import MapToolbar from '@/components/map/MapToolbar';
import StationMarkers from '@/components/map/StationMarkers';
import StationSidePanel from '@/components/map/StationSidePanel';
import { useMapState } from '@/hooks/useMapState';
import { useStationSearch } from '@/hooks/useStationSearch';
import type { Station, StationsApiResponse } from '@/types';

import styles from './LeafletMap.module.css';
import { normalizeText, stationDisplayName } from './mapUtils';

const center: [number, number] = [36.2048, 138.2529];
const japanBounds: [[number, number], [number, number]] = [
  [20.0, 122.0],
  [46.5, 154.0],
];

async function fetchAllStations(): Promise<Station[]> {
  const merged: Station[] = [];

  const firstRes = await fetch('/api/stations?page=1&pageSize=1000&hasData=1');
  if (!firstRes.ok) {
    throw new Error(`Request failed with status ${firstRes.status}`);
  }

  const firstPageData = (await firstRes.json()) as StationsApiResponse;
  merged.push(...firstPageData.items);

  const totalPages = firstPageData.pagination.totalPages || 1;
  if (totalPages > 1) {
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
    const remainingResponses = await Promise.all(
      remainingPages.map((page) => fetch(`/api/stations?page=${page}&pageSize=1000&hasData=1`)),
    );

    const remainingPagesData = await Promise.all(
      remainingResponses.map(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return (await res.json()) as StationsApiResponse;
      }),
    );

    remainingPagesData.forEach((data) => {
      merged.push(...data.items);
    });
  }

  return merged;
}

export default function LeafletMap() {
  const noMatchHint = 'No results matched. Try a more complete name.';
  const {
    data: stations = [],
    error: stationsError,
    isLoading,
  } = useSWR('stations:all', fetchAllStations, {
    revalidateOnFocus: false,
  });
  const error = stationsError ? 'Failed to load stations.' : null;

  const [basinTab, setBasinTab] = useState<{
    basinName: string;
    stationCount: number;
  } | null>(null);
  const [stationTab, setStationTab] = useState<Station | null>(null);
  const [activeTab, setActiveTab] = useState<'basin' | 'station' | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMapInstance | null>(null);

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

  const basinSearchIndex = useMemo(
    () =>
      Array.from(basinGroups.keys()).map((name) => ({
        name,
        normalizedName: normalizeText(name),
      })),
    [basinGroups],
  );

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

  const handleActivateBasinTab = useCallback(() => {
    if (!basinTab) {
      return;
    }
    setActiveTab('basin');
  }, [basinTab]);

  return (
    <div className={styles.mapShell}>
      <MapToolbar
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
        className={styles.leafletCanvas}
        attributionControl={false}
      >
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
