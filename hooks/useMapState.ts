'use client';

import type { Map as LeafletMapInstance } from 'leaflet';
import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

import type { ActiveTab, BasinTabData } from '@/app/map/types';
import type { Station } from '@/types';

type UseMapStateParams = {
  mapInstance: LeafletMapInstance | null;
  basinTab: BasinTabData | null;
  stationTab: Station | null;
  activeTab: ActiveTab;
  setBasinTab: Dispatch<SetStateAction<BasinTabData | null>>;
  setStationTab: Dispatch<SetStateAction<Station | null>>;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
};

export function useMapState({
  mapInstance,
  basinTab,
  stationTab,
  activeTab,
  setBasinTab,
  setStationTab,
  setActiveTab,
}: UseMapStateParams) {
  const [zoom, setZoom] = useState(5.4);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [previewStationId, setPreviewStationId] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewStationId(null);
  }, []);

  const handlePreviewChange = useCallback((stationId: string | null) => {
    setPreviewStationId(stationId);
  }, []);

  const commitStationSelection = useCallback(
    (station: Station) => {
      setSelectedStationId(station.station_id);
      setStationTab(station);
      setPreviewStationId(null);
      mapInstance?.closePopup();
      setActiveTab('station');
    },
    [mapInstance, setActiveTab, setStationTab],
  );

  const handleActivateStationTab = useCallback(() => {
    if (!stationTab) {
      return;
    }
    setActiveTab('station');
    setSelectedStationId(stationTab.station_id);
  }, [setActiveTab, stationTab]);

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
  }, [basinTab, mapInstance, setActiveTab, setStationTab]);

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
  }, [activeTab, mapInstance, setActiveTab, setBasinTab, stationTab]);

  return {
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
  };
}
