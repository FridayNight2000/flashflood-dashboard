'use client';

import type { Map as LeafletMapInstance } from 'leaflet';
import {
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { normalizeText } from '@/app/map/mapUtils';
import type {
  ActiveTab,
  BasinTabData,
  SearchSuggestion,
  SelectedSearchItem,
} from '@/app/map/types';
import type { Station } from '@/types';

type BasinSearchIndexItem = {
  name: string;
  normalizedName: string;
};

type StationSearchIndexItem = {
  station: Station;
  names: string[];
};

type UseStationSearchParams = {
  stations: Station[];
  basinGroups: Map<string, Station[]>;
  basinSearchIndex: BasinSearchIndexItem[];
  stationSearchIndex: StationSearchIndexItem[];
  mapInstance: LeafletMapInstance | null;
  zoomToStations: (targetStations: Station[]) => void;
  commitStationSelection: (station: Station) => void;
  clearPreview: () => void;
  setBasinTab: Dispatch<SetStateAction<BasinTabData | null>>;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
  noMatchHint: string;
  getDisplayName: (station: Station) => string;
};

export function useStationSearch({
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
  getDisplayName,
}: UseStationSearchParams) {
  const [searchText, setSearchText] = useState('');
  const [searchHint, setSearchHint] = useState<string>('');
  const [selectedSearchItem, setSelectedSearchItem] = useState<SelectedSearchItem | null>(null);

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

  const performSearch = useCallback(
    (rawKeyword: string) => {
      const keyword = rawKeyword.trim();
      if (!keyword) {
        setSelectedSearchItem(null);
        clearPreview();
        setSearchHint('Please enter a basin / station name.');
        return false;
      }
      if (!mapInstance) {
        setSelectedSearchItem(null);
        clearPreview();
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
        clearPreview();
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
          label: stationMatch.station_name || getDisplayName(stationMatch),
          type: 'Station',
        });
        commitStationSelection(stationMatch);
        return true;
      }

      setSelectedSearchItem(null);
      clearPreview();
      setSearchHint(noMatchHint);
      return false;
    },
    [
      basinGroups,
      basinSearchIndex,
      clearPreview,
      commitStationSelection,
      getDisplayName,
      mapInstance,
      noMatchHint,
      setActiveTab,
      setBasinTab,
      stationSearchIndex,
      zoomToStations,
    ],
  );

  const handleSearchSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      performSearch(searchText);
    },
    [performSearch, searchText],
  );

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

  return {
    searchText,
    searchHintText,
    searchSuggestions,
    selectedSearchItem,
    handleSearchSubmit,
    handleSuggestionSelect,
    handleSearchTextChange,
    performSearch,
  };
}
