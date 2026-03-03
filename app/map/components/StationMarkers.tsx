'use client';

import { memo, useMemo } from 'react';
import { CircleMarker, Pane, Popup } from 'react-leaflet';

import type { Station } from '@/types';

import styles from './StationMarkers.module.css';

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
              className: isSelected ? styles.selectedPulse : undefined,
            }}
            eventHandlers={{
              popupopen: () => onPreviewChange(stationId),
              popupclose: () => onPreviewChange(null),
            }}
          >
            <Popup>
              <div>
                <div className={styles.popupStationName}>{getDisplayName(station)}</div>
                <div>ID: {station.station_id}</div>
                <div>Basin: {station.basin_name || '-'}</div>
                <button
                  type="button"
                  className={styles.popupViewDetailsBtn}
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
