'use client';

import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import useSWR from 'swr';

import type {
  ActiveTab,
  BasinTabData,
  MonthlyFrequencyPoint,
  PeakDistributionPoint,
} from '@/app/map/types';
import type { Station, StationEventsApiResponse, StationMatchedPoint } from '@/types';

export type ChartPresetId = 'timeline_all' | 'seasonal_frequency' | 'peak_distribution';

type ChartPreset = {
  id: ChartPresetId;
  label: string;
};

type UseStationEventsParams = {
  activeTab: ActiveTab;
  basinTab: BasinTabData | null;
  stationTab: Station | null;
  getDisplayName: (station: Station) => string;
};

export const chartPresets: ChartPreset[] = [
  { id: 'timeline_all', label: 'Timeline' },
  { id: 'seasonal_frequency', label: 'Season' },
  { id: 'peak_distribution', label: 'Peaks' },
];

function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return value.toFixed(2);
}

function toDateOnly(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.slice(0, 10);
}

async function fetcher(url: string): Promise<StationEventsApiResponse> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as StationEventsApiResponse;
}

export function useStationEvents({
  activeTab,
  basinTab,
  stationTab,
  getDisplayName,
}: UseStationEventsParams) {
  const [peakDateRangeByTab, setPeakDateRangeByTab] = useState<
    Record<string, { start: string; end: string }>
  >({});
  const [selectedPresetByTab, setSelectedPresetByTab] = useState<
    Record<string, ChartPresetId | null>
  >({});
  const [isMetricsCopied, setIsMetricsCopied] = useState(false);

  const currentStation = activeTab === 'station' ? stationTab : null;
  const currentBasin = activeTab === 'basin' ? (basinTab?.basinName ?? null) : null;
  const currentBasinCount = activeTab === 'basin' ? (basinTab?.stationCount ?? 0) : 0;
  const activeTabKey = currentStation
    ? `s:${currentStation.station_id}`
    : currentBasin
      ? `b:${currentBasin}`
      : null;
  const currentTabDateRange = activeTabKey ? peakDateRangeByTab[activeTabKey] : null;
  const peakStartDate = currentTabDateRange?.start ?? '';
  const peakEndDate = currentTabDateRange?.end ?? '';
  const selectedPreset = activeTabKey ? (selectedPresetByTab[activeTabKey] ?? null) : null;
  const selectedPresetMeta = chartPresets.find((preset) => preset.id === selectedPreset) ?? null;
  const eventsBasePath = currentStation
    ? `/api/stations/${currentStation.station_id}/events`
    : currentBasin
      ? `/api/basins/${encodeURIComponent(currentBasin)}/events`
      : null;
  const summaryRequestUrl = eventsBasePath ? `${eventsBasePath}?includeRecent=0` : null;
  const {
    data: summaryData,
    error: summaryError,
    isLoading: isLoadingEvents,
  } = useSWR(summaryRequestUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const minPeakDate = toDateOnly(summaryData?.summary.minPeakTime ?? null);
  const maxPeakDate = toDateOnly(summaryData?.summary.maxPeakTime ?? null);
  const rangeStartDate = peakStartDate || minPeakDate;
  const rangeEndDate = peakEndDate || maxPeakDate;
  const hasDateFilterChanged = Boolean(
    (minPeakDate && rangeStartDate && rangeStartDate !== minPeakDate) ||
    (maxPeakDate && rangeEndDate && rangeEndDate !== maxPeakDate),
  );
  const shouldFetchRangeData = Boolean(selectedPreset) || hasDateFilterChanged;
  const rangeRequestUrl = useMemo(() => {
    if (!eventsBasePath || !rangeStartDate || !rangeEndDate || !shouldFetchRangeData) {
      return null;
    }

    const query = new URLSearchParams({
      includeRecent: '0',
      peakStart: rangeStartDate,
      peakEnd: rangeEndDate,
    });
    if (selectedPreset) {
      query.set('includeMatchedSeries', '1');
    }
    return `${eventsBasePath}?${query.toString()}`;
  }, [eventsBasePath, rangeStartDate, rangeEndDate, selectedPreset, shouldFetchRangeData]);
  const {
    data: rangeData,
    error: rangeError,
    isLoading: isLoadingRangeCount,
  } = useSWR(rangeRequestUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const eventSummary = rangeData?.summary ?? summaryData?.summary ?? null;
  const totalEvents = summaryData?.summary.matchedEvents ?? null;
  const rangeMatchedEvents = rangeData?.summary.matchedEvents ?? totalEvents;
  const matchedSeries = useMemo<StationMatchedPoint[]>(
    () => rangeData?.matchedSeries ?? [],
    [rangeData?.matchedSeries],
  );
  const chartPoints = matchedSeries;
  const monthlyFrequency = useMemo<MonthlyFrequencyPoint[]>(() => {
    const monthCounts = Array.from({ length: 12 }, (_, monthIndex) => ({
      month: monthIndex + 1,
      count: 0,
    }));

    for (const item of matchedSeries) {
      const timestamp = Date.parse(item.peak_time);
      if (!Number.isFinite(timestamp)) {
        continue;
      }
      const month = new Date(timestamp).getMonth();
      monthCounts[month].count += 1;
    }

    return monthCounts;
  }, [matchedSeries]);
  const peakDistribution = useMemo<PeakDistributionPoint[]>(() => {
    return matchedSeries
      .filter((item) => Number.isFinite(item.peak_value))
      .sort((a, b) => b.peak_value - a.peak_value)
      .map((item, index) => ({
        rank: index + 1,
        peak_value: item.peak_value,
      }));
  }, [matchedSeries]);

  const isOpen =
    (activeTab === 'station' && Boolean(stationTab)) ||
    (activeTab === 'basin' && Boolean(basinTab));

  const chartName = currentStation
    ? `station ${getDisplayName(currentStation)}`
    : `basin ${currentBasin ?? 'Unknown'}`;
  const chartStart = rangeStartDate ?? 'start';
  const chartEnd = rangeEndDate ?? 'end';
  const chartTitle =
    selectedPreset === 'seasonal_frequency'
      ? `${chartName} · Monthly Event Frequency · ${chartStart}–${chartEnd}`
      : selectedPreset === 'peak_distribution'
        ? `${chartName} · Peak Exceedance Curve · ${chartStart}–${chartEnd}`
        : `${chartName} · Event Timeline · ${chartStart}–${chartEnd}`;

  function clearTabPreset(tabKey: string | null) {
    if (!tabKey) {
      return;
    }
    setSelectedPresetByTab((prev) => {
      if (!(tabKey in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[tabKey];
      return next;
    });
  }

  function clearTabDateRange(tabKey: string | null) {
    if (!tabKey) {
      return;
    }
    setPeakDateRangeByTab((prev) => {
      if (!(tabKey in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[tabKey];
      return next;
    });
  }

  function setStartDate(next: string) {
    if (!activeTabKey) {
      return;
    }
    setPeakDateRangeByTab((prev) => {
      const current = prev[activeTabKey] ?? { start: '', end: '' };
      const nextEnd = rangeEndDate && next > rangeEndDate ? next : current.end;
      return {
        ...prev,
        [activeTabKey]: {
          start: next,
          end: nextEnd,
        },
      };
    });
  }

  function setEndDate(next: string) {
    if (!activeTabKey) {
      return;
    }
    setPeakDateRangeByTab((prev) => {
      const current = prev[activeTabKey] ?? { start: '', end: '' };
      const nextStart = rangeStartDate && next < rangeStartDate ? next : current.start;
      return {
        ...prev,
        [activeTabKey]: {
          start: nextStart,
          end: next,
        },
      };
    });
  }

  async function copyMetrics() {
    if (!eventSummary) {
      return;
    }

    const text = [
      `Max Peak: ${formatNumber(eventSummary.maxPeakValue)}`,
      `Avg Peak: ${formatNumber(eventSummary.avgPeakValue)}`,
      `Avg Rise Time: ${formatNumber(eventSummary.avgRiseTime)}`,
      `Avg Fall Time: ${formatNumber(eventSummary.avgFallTime)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setIsMetricsCopied(true);
    window.setTimeout(() => setIsMetricsCopied(false), 1200);
  }

  return {
    isOpen,
    currentStation,
    currentBasin,
    currentBasinCount,
    activeTabKey,
    eventsBasePath,
    selectedPreset,
    selectedPresetMeta,
    setSelectedPresetByTab: setSelectedPresetByTab as Dispatch<
      SetStateAction<Record<string, ChartPresetId | null>>
    >,
    clearTabPreset,
    clearTabDateRange,
    minPeakDate,
    maxPeakDate,
    rangeStartDate,
    rangeEndDate,
    setStartDate,
    setEndDate,
    summaryData,
    summaryError,
    rangeError,
    isLoadingEvents,
    isLoadingRangeCount,
    eventSummary,
    totalEvents,
    rangeMatchedEvents,
    matchedSeries,
    chartPoints,
    monthlyFrequency,
    peakDistribution,
    isMetricsCopied,
    copyMetrics,
    chartTitle,
  };
}
