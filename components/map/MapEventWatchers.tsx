"use client";

import type { Map as LeafletMapInstance } from "leaflet";
import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

type ZoomWatcherProps = {
  onZoomChange: (zoom: number) => void;
};

export function ZoomWatcher({ onZoomChange }: ZoomWatcherProps) {
  useMapEvents({
    zoomend(event) {
      onZoomChange(event.target.getZoom());
    },
  });
  return null;
}

type MapInstanceWatcherProps = {
  onMapReady: (map: LeafletMapInstance) => void;
};

export function MapInstanceWatcher({ onMapReady }: MapInstanceWatcherProps) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}
