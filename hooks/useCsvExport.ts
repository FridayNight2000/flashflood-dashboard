'use client';

import { useEffect, useRef, useState } from 'react';

import type { Station, StationEventsApiResponse, StationMatchedPoint } from '@/types';

type UseCsvExportParams = {
  activeTabKey: string | null;
  currentStation: Station | null;
  currentBasin: string | null;
  rangeStartDate: string | null;
  rangeEndDate: string | null;
  matchedSeries: StationMatchedPoint[];
  getDisplayName: (station: Station) => string;
};

function sanitizeFileNamePart(value: string): string {
  return value.replace(/[\\/:*?"<>|\s]+/g, '_');
}

export function useCsvExport({
  activeTabKey,
  currentStation,
  currentBasin,
  rangeStartDate,
  rangeEndDate,
  matchedSeries,
  getDisplayName,
}: UseCsvExportParams) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloadingEvents, setIsDownloadingEvents] = useState(false);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  async function downloadChartPng() {
    if ((!currentStation && !currentBasin) || !chartSvgRef.current || matchedSeries.length === 0) {
      return;
    }

    const svgEl = chartSvgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const blobUrl = URL.createObjectURL(svgBlob);

    try {
      const image = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load SVG data.'));
      });
      image.src = blobUrl;
      await loaded;

      const scale = 2;
      const width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 640;
      const height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 260;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      const a = document.createElement('a');
      const start = rangeStartDate ?? 'start';
      const end = rangeEndDate ?? 'end';
      a.href = canvas.toDataURL('image/png');

      const filePrefix = currentStation
        ? sanitizeFileNamePart(getDisplayName(currentStation))
        : `basin_${currentBasin}`;
      a.download = `${filePrefix}_event_timeline_${start}_${end}.png`;
      a.click();
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  async function downloadEventsXlsx() {
    if ((!currentStation && !currentBasin) || !rangeStartDate || !rangeEndDate) {
      return;
    }

    try {
      setIsDownloadingEvents(true);
      setDownloadError(null);

      const query = new URLSearchParams({
        includeRecent: '0',
        includeMatchedEvents: '1',
        peakStart: rangeStartDate,
        peakEnd: rangeEndDate,
      });

      const url = currentStation
        ? `/api/stations/${currentStation.station_id}/events?${query.toString()}`
        : `/api/basins/${encodeURIComponent(currentBasin!)}/events?${query.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as StationEventsApiResponse;
      const detailedRows = data.matchedEventsDetail ?? [];
      const isBasinExport = Boolean(currentBasin) && !currentStation;
      const isStationExport = Boolean(currentStation);
      const stationNameForExport = currentStation ? getDisplayName(currentStation) : null;
      const basinNameForExport = currentStation?.basin_name ?? currentBasin ?? null;
      const rows = (
        detailedRows.length > 0
          ? detailedRows
          : (data.matchedSeries ?? []).map((item) => ({
              id: item.id,
              station_id: currentStation?.station_id ?? null,
              basin_name: currentBasin,
              start_time: null,
              peak_time: item.peak_time,
              end_time: null,
              start_value: null,
              peak_value: item.peak_value,
              end_value: null,
              rise_time: null,
              fall_time: null,
              peak_time_str: item.peak_time_str,
            }))
      ).map((item, index) => {
        const baseRow = {
          index: index + 1,
          start_time: item.start_time,
          peak_time: item.peak_time,
          end_time: item.end_time,
          start_value: item.start_value,
          peak_value: item.peak_value,
          end_value: item.end_value,
          rise_time: item.rise_time,
          fall_time: item.fall_time,
        };

        if (isStationExport) {
          return {
            ...baseRow,
            station_name: stationNameForExport,
            basin_name: basinNameForExport,
          };
        }

        if (isBasinExport) {
          return {
            ...baseRow,
            station_id: item.station_id,
            basin_name: item.basin_name,
          };
        }

        return {
          ...baseRow,
          station_id: item.station_id,
          basin_name: item.basin_name,
        };
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('events');

      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        worksheet.columns = headers.map((header) => ({
          header,
          key: header,
        }));
        rows.forEach((row) => {
          worksheet.addRow(row);
        });
      }

      const workbookBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([workbookBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;

      const prefix = currentStation ? `station_${stationNameForExport}` : `basin_${currentBasin}`;
      anchor.download = `${sanitizeFileNamePart(prefix)}_${rangeStartDate}_to_${rangeEndDate}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setDownloadError('Failed to download matched events file.');
    } finally {
      setIsDownloadingEvents(false);
    }
  }

  function clearDownloadError() {
    setDownloadError(null);
  }

  useEffect(() => {
    if (!activeTabKey) {
      setDownloadError(null);
    }
  }, [activeTabKey]);

  return {
    chartSvgRef,
    isDownloadingEvents,
    downloadError,
    clearDownloadError,
    downloadEventsXlsx,
    downloadChartPng,
  };
}
