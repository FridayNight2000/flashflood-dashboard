'use client';
//type import
import type { Map as LeafletMapInstance } from 'leaflet';
import { latLngBounds } from 'leaflet';
import { type SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { AttributionControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import useSWR from 'swr';

import type { Station, StationsApiResponse } from '../types/index';
import { MapInstanceWatcher, ZoomWatcher } from './components/MapEventWatchers';
import type { SearchSuggestion, SelectedSearchItem } from './components/MapToolbar';
//
import MapToolbar from './components/MapToolbar';
import StationMarkers from './components/StationMarkers';
import StationSidePanel from './components/StationSidePanel';
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
  // UI state initialization
  // Track current map zoom level (initially aligned with MapContainer zoom).
  const [zoom, setZoom] = useState(5.4);

  // Side panel tab state (Basin + single Station).
  const [basinTab, setBasinTab] = useState<{
    basinName: string;
    stationCount: number;
  } | null>(null);
  const [stationTab, setStationTab] = useState<Station | null>(null);
  const [activeTab, setActiveTab] = useState<'basin' | 'station' | null>(null);

  // Store map instance for post-search navigation.
  const [mapInstance, setMapInstance] = useState<LeafletMapInstance | null>(null);
  // Search input and helper hint text.
  const [searchText, setSearchText] = useState('');
  const [searchHint, setSearchHint] = useState<string>('');
  const [selectedSearchItem, setSelectedSearchItem] = useState<SelectedSearchItem | null>(null);
  // Dual map state: selected controls persistent side panel/main highlight; preview controls transient popup/secondary highlight.
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [previewStationId, setPreviewStationId] = useState<string | null>(null);

  // Group by basin_name for prioritized search matching.
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

  // Marker radius scales exponentially with zoom: smaller at low zoom, more visible when zoomed in.
  const markerRadius = useMemo(() => {
    const radius = 1.2 * Math.pow(1.35, zoom - 4);
    return Math.min(10, Math.max(1.2, radius));
  }, [zoom]);

  // Prefix suggestions for basin_name while typing.
  const basinSuggestions = useMemo(() => {
    const keyword = normalizeText(searchText);
    if (!keyword) {
      return [];
    }
    return basinSearchIndex
      .filter(({ normalizedName }) => normalizedName.startsWith(keyword))
      .map(({ name }) => name)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
  }, [basinSearchIndex, searchText]);

  // Prefix suggestions for station_name while typing.
  const stationNameSuggestions = useMemo(() => {
    const keyword = normalizeText(searchText);
    if (!keyword) {
      return [];
    }

    const unique = new Set<string>();
    stations.forEach((station) => {
      const name = station.station_name?.trim();
      if (!name) {
        return;
      }
      if (normalizeText(name).startsWith(keyword)) {
        unique.add(name);
      }
    });

    return Array.from(unique)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
  }, [stations, searchText]);

  // Merge basin/station suggestions for unified toolbar rendering.
  const searchSuggestions = useMemo(
    () => [
      ...basinSuggestions.map((value) => ({
        value,
        type: 'Basin' as const,
      })),
      ...stationNameSuggestions.map((value) => ({
        value,
        type: 'Station' as const,
      })),
    ],
    [basinSuggestions, stationNameSuggestions],
  );

  const searchHintText = useMemo(() => {
    if (searchHint && searchHint !== noMatchHint) {
      return searchHint;
    }

    if (!searchText.trim()) {
      return '';
    }

    if (searchSuggestions.length > 0) {
      return '';
    }

    return noMatchHint;
  }, [noMatchHint, searchHint, searchSuggestions.length, searchText]);

  const basinHighlightedStationIds = useMemo(() => {
    if (!basinTab || activeTab !== 'basin') {
      return [];
    }
    const basinStations = basinGroups.get(basinTab.basinName) ?? [];
    return basinStations.map((station) => station.station_id);
  }, [activeTab, basinGroups, basinTab]);

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

  const commitStationSelection = useCallback(
    (station: Station) => {
      setSelectedStationId(station.station_id);
      setStationTab(station);
      setPreviewStationId(null);
      mapInstance?.closePopup();
      setActiveTab('station');
    },
    [mapInstance],
  );

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

  // Search priority: basin_name -> river_name -> station_name/2/3.
  const performSearch = useCallback(
    (rawKeyword: string) => {
      const keyword = rawKeyword.trim();
      if (!keyword) {
        setSelectedSearchItem(null);
        setPreviewStationId(null);
        setSearchHint('Please enter a basin / station name.');
        return false;
      }
      if (!mapInstance) {
        setSelectedSearchItem(null);
        setPreviewStationId(null);
        setSearchHint('Map is not ready yet. Please try again shortly.');
        return false;
      }

      const normalizedKeyword = normalizeText(keyword);
      const basin =
        basinSearchIndex.find(({ normalizedName }) => normalizedName === normalizedKeyword)?.name ??
        basinSearchIndex.find(({ normalizedName }) => normalizedName.startsWith(normalizedKeyword))
          ?.name ??
        basinSearchIndex.find(({ normalizedName }) => normalizedName.includes(normalizedKeyword))
          ?.name;
      if (basin) {
        const matched = basinGroups.get(basin) ?? [];
        zoomToStations(matched);
        setSearchHint('');
        setPreviewStationId(null);
        setSelectedSearchItem({ label: basin, type: 'Basin' });
        setBasinTab({
          basinName: basin,
          stationCount: matched.length,
        });
        setActiveTab('basin');
        mapInstance.closePopup();
        return true;
      }

      const stationMatch = stationSearchIndex.find(({ names }) =>
        names.some((name) => name === normalizedKeyword || name.includes(normalizedKeyword)),
      )?.station;

      if (stationMatch) {
        zoomToStations([stationMatch]);
        setSearchHint('');
        setSelectedSearchItem({
          label: stationMatch.station_name || stationDisplayName(stationMatch),
          type: 'Station',
        });
        commitStationSelection(stationMatch);
        return true;
      }

      setSelectedSearchItem(null);
      setPreviewStationId(null);
      setSearchHint(noMatchHint);
      return false;
    },
    [
      basinGroups,
      basinSearchIndex,
      mapInstance,
      noMatchHint,
      stationSearchIndex,
      zoomToStations,
      commitStationSelection,
    ],
  );

  // Submit search on Enter.
  const handleSearchSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      performSearch(searchText);
    },
    [performSearch, searchText],
  );

  // Auto-fill and execute search when selecting a suggestion.
  const handleSuggestionSelect = useCallback(
    (item: SearchSuggestion) => {
      setSearchText(item.value);
      setSelectedSearchItem({ label: item.value, type: item.type });
      performSearch(item.value);
    },
    [performSearch],
  );

  const handleSearchTextChange = useCallback(
    (value: string) => {
      setSearchText(value);
      setSelectedSearchItem(null);
      if (searchHint) {
        setSearchHint('');
      }
    },
    [searchHint],
  );

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
      setPreviewStationId(null);
      mapInstance?.closePopup();
    },
    [basinGroups, mapInstance],
  );

  const handleActivateBasinTab = useCallback(() => {
    if (!basinTab) {
      return;
    }
    setActiveTab('basin');
  }, [basinTab]);

  const handleActivateStationTab = useCallback(() => {
    if (!stationTab) {
      return;
    }
    setActiveTab('station');
    setSelectedStationId(stationTab.station_id);
  }, [stationTab]);

  const handleCloseStationTab = useCallback(() => {
    setStationTab(null);
    setSelectedStationId(null);
    setPreviewStationId(null);
    if (basinTab) {
      setActiveTab('basin');
    } else {
      setActiveTab(null);
    }
    mapInstance?.closePopup();
  }, [basinTab, mapInstance]);

  const handleCloseBasinTab = useCallback(() => {
    const nextStationTab = stationTab;
    setBasinTab(null);
    setPreviewStationId(null);
    if (activeTab === 'basin') {
      if (nextStationTab) {
        setActiveTab('station');
        setSelectedStationId(nextStationTab.station_id);
      } else {
        setActiveTab(null);
        setSelectedStationId(null);
        mapInstance?.closePopup();
      }
    }
  }, [activeTab, mapInstance, stationTab]);

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
        {/* Watch zoom changes to drive marker radius updates. */}
        <ZoomWatcher onZoomChange={setZoom} />
        {/* Expose map instance to enable automatic post-search navigation. */}
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
          onPreviewChange={setPreviewStationId}
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
