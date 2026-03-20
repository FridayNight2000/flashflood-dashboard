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

export function MapSizeWatcher() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frameId = 0;

    const syncSize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    syncSize();

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}
