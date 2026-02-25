'use client';

// Added React hooks for station API loading, search state, and map interactions.
import type { Map as LeafletMapInstance } from 'leaflet';
import { latLngBounds } from 'leaflet';
import { type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';

import type { Station, StationsApiResponse } from '../types/index';
import { MapInstanceWatcher, ZoomWatcher } from './components/MapEventWatchers';
import type { SearchSuggestion, SelectedSearchItem } from './components/MapToolbar';
import MapToolbar from './components/MapToolbar';
import StationMarkers from './components/StationMarkers';
import StationSidePanel from './components/StationSidePanel';
import styles from './LeafletMap.module.css';
import { findBestGroupName, normalizeText, stationDisplayName } from './mapUtils';

const center: [number, number] = [36.2048, 138.2529];
const japanBounds: [[number, number], [number, number]] = [
  [20.0, 122.0],
  [47.5, 154.0],
];

export default function LeafletMap() {
  const noMatchHint = 'No results matched. Try a more complete name.';
  // UI state initialization
  const [stations, setStations] = useState<Station[]>([]); // receives station-info data
  const [isLoading, setIsLoading] = useState(true);
  // Track current map zoom level (initially aligned with MapContainer zoom).
  const [zoom, setZoom] = useState(5);

  const [error, setError] = useState<string | null>(null);

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

  //REVIEW - 1. station info  data fetching
  useEffect(() => {
    // NOTE: Use AbortController to stop in-flight fetch calls on unmount and avoid memory leaks.
    const controller = new AbortController();

    async function fetchAllStations() {
      try {
        setIsLoading(true);
        setError(null);

        let page = 1;
        let totalPages = 1;
        const merged: Station[] = [];

        while (page <= totalPages) {
          const res = await fetch(`/api/stations?page=${page}&pageSize=1000&hasData=1`, {
            signal: controller.signal,
          });

          if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
          }

          const data = (await res.json()) as StationsApiResponse;
          merged.push(...data.items);
          totalPages = data.pagination.totalPages || 1;
          page += 1;
        }
        setStations(merged);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load stations.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllStations();
    return () => controller.abort();
  }, []);

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
    return Array.from(basinGroups.keys())
      .filter((name) => normalizeText(name).startsWith(keyword))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
  }, [basinGroups, searchText]);

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

  useEffect(() => {
    const keyword = searchText.trim();
    if (!keyword) {
      setSearchHint((prev) => (prev === noMatchHint ? '' : prev));
      return;
    }

    if (searchSuggestions.length > 0) {
      setSearchHint((prev) => (prev === noMatchHint ? '' : prev));
      return;
    }

    setSearchHint((prev) => (prev === noMatchHint ? prev : noMatchHint));
  }, [noMatchHint, searchSuggestions, searchText]);

  const basinHighlightedStationIds = useMemo(() => {
    if (!basinTab || activeTab !== 'basin') {
      return [];
    }
    const basinStations = basinGroups.get(basinTab.basinName) ?? [];
    return basinStations.map((station) => station.station_id);
  }, [activeTab, basinGroups, basinTab]);

  function commitStationSelection(station: Station) {
    setSelectedStationId(station.station_id);
    setStationTab(station);
    setPreviewStationId(null);
    mapInstance?.closePopup();
    setActiveTab('station');
  }

  function zoomToStations(targetStations: Station[]) {
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
        (station) => [station.latitude as number, station.longitude as number] as [number, number],
      ),
    );
    mapInstance.fitBounds(bounds.pad(0.15), {
      animate: true,
      duration: 1.0,
    });
  }

  // Search priority: basin_name -> river_name -> station_name/2/3.
  function performSearch(rawKeyword: string) {
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

    const basin = findBestGroupName(basinGroups, keyword);
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

    const normalizedKeyword = normalizeText(keyword);
    const stationMatch = stations.find((station) => {
      const candidates = [station.station_name, station.station_name2, station.station_name3]
        .map((name) => normalizeText(name))
        .filter(Boolean);
      return candidates.some(
        (name) => name === normalizedKeyword || name.includes(normalizedKeyword),
      );
    });

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
  }

  // Submit search on Enter.
  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    performSearch(searchText);
  }

  // Auto-fill and execute search when selecting a suggestion.
  function handleSuggestionSelect(item: SearchSuggestion) {
    setSearchText(item.value);
    setSelectedSearchItem({ label: item.value, type: item.type });
    performSearch(item.value);
  }

  function handleOpenBasinTab(basinName: string) {
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
  }

  return (
    <div className={styles.mapShell}>
      <MapToolbar
        isLoading={isLoading}
        error={error}
        searchText={searchText}
        searchHint={searchHint}
        suggestions={searchSuggestions}
        selectedItem={selectedSearchItem}
        onSearchTextChange={(value) => {
          setSearchText(value);
          setSelectedSearchItem(null);
          if (searchHint) {
            setSearchHint('');
          }
        }}
        onSubmit={handleSearchSubmit}
        onSuggestionSelect={handleSuggestionSelect}
      />
      <MapContainer
        center={center}
        zoom={5}
        zoomControl={false}
        minZoom={4}
        maxZoom={12}
        maxBounds={japanBounds}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className={styles.leafletCanvas}
        attributionControl
      >
        {/* Watch zoom changes to drive marker radius updates. */}
        <ZoomWatcher onZoomChange={setZoom} />
        {/* Expose map instance to enable automatic post-search navigation. */}
        <MapInstanceWatcher onMapReady={setMapInstance} />
        <ZoomControl position="bottomright" />

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
          onCommitSelection={(station) => commitStationSelection(station)}
          getDisplayName={stationDisplayName}
        />
      </MapContainer>
      <StationSidePanel
        activeTab={activeTab}
        basinTab={basinTab}
        stationTab={stationTab}
        onActivateBasinTab={() => {
          if (!basinTab) {
            return;
          }
          setActiveTab('basin');
        }}
        onOpenBasinTab={handleOpenBasinTab}
        onActivateStationTab={() => {
          if (!stationTab) {
            return;
          }
          setActiveTab('station');
          setSelectedStationId(stationTab.station_id);
        }}
        onCloseStationTab={() => {
          setStationTab(null);
          setSelectedStationId(null);
          setPreviewStationId(null);
          if (basinTab) {
            setActiveTab('basin');
          } else {
            setActiveTab(null);
          }
          mapInstance?.closePopup();
        }}
        onCloseBasinTab={() => {
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
        }}
        getDisplayName={stationDisplayName}
      />
    </div>
  );
}
