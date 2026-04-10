'use client';

import { useState } from 'react';

import { useCsvExport } from '@/hooks/useCsvExport';
import { chartPresets, useStationEvents } from '@/hooks/useStationEvents';
import { cn } from '@/lib/utils';
import type { Station } from '@/types';

import type { ActiveTab, BasinTabData } from '../types';
import StationEventTimelineChart from './StationEventTimelineChart';
import StationMonthlyFrequencyChart from './StationMonthlyFrequencyChart';
import StationPeakDistributionChart from './StationPeakDistributionChart';
import { Download } from 'lucide-react';

type StationSidePanelProps = {
  activeTab: ActiveTab;
  basinTab: BasinTabData | null;
  stationTab: Station | null;
  onActivateBasinTab: () => void;
  onOpenBasinTab: (basinName: string) => void;
  onActivateStationTab: () => void;
  onCloseBasinTab: () => void;
  onCloseStationTab: () => void;
  getDisplayName: (station: Station) => string;
};

const HOVER_DOWNLOAD_BUTTON_SIZE = 32;
const HOVER_DOWNLOAD_BUTTON_OFFSET = 12;
const HOVER_DOWNLOAD_BUTTON_MARGIN = 4;

function BasinBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 16.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM5.5 10a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm-13-6.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Zm6.5 0a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StationBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
      viewBox="0 0 432 432"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M213 109q44 0 75.5 31.5T320 216t-31.5 75.5T213 323t-75-31.5t-31-75.5t31-75.5t75-31.5zm.5-106q88.5 0 151 62.5T427 216t-62.5 150.5t-151 62.5t-151-62.5T0 216T62.5 65.5T213.5 3zm0 384q70.5 0 120.5-50t50-121t-50-121t-120.5-50T93 95T43 216t50 121t120.5 50z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChartsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 6H6V3h1M5 6H4V1h1M3 6H2V4h1M0 8V0h1v7h7v1"
        fill="currentColor"
      />
    </svg>
  );
}

function CollapseChartsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.08 4.08L20 12l-7.92 7.92l-1.41-1.42l5.5-5.5H2v-2h14.17l-5.5-5.5l1.41-1.42M20 12v10h2V2h-2v10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return value.toFixed(2);
}

export default function StationSidePanel({
  activeTab,
  basinTab,
  stationTab,
  onActivateBasinTab,
  onOpenBasinTab,
  onActivateStationTab,
  onCloseBasinTab,
  onCloseStationTab,
  getDisplayName,
}: StationSidePanelProps) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const {
    isOpen,
    currentStation,
    currentBasin,
    currentBasinCount,
    activeTabKey,
    selectedPreset,
    selectedPresetMeta,
    setSelectedPresetByTab,
    clearTabPreset,
    clearTabDateRange,
    minPeakDate,
    maxPeakDate,
    rangeStartDate,
    rangeEndDate,
    setStartDate,
    setEndDate,
    summaryError,
    rangeError,
    isLoadingEvents,
    isLoadingRangeCount,
    eventSummary,
    totalEvents,
    rangeMatchedEvents,
    coveredYearsCount,
    matchedSeries,
    chartPoints,
    monthlyFrequency,
    peakDistribution,
    isMetricsCopied,
    copyMetrics,
    chartTitle,
  } = useStationEvents({
    activeTab,
    basinTab,
    stationTab,
    getDisplayName,
  });

  const { chartSvgRef, downloadError, downloadChartPng, downloadEventsXlsx, isDownloadingEvents } =
    useCsvExport({
    activeTabKey,
    currentStation,
    currentBasin,
    rangeStartDate,
    rangeEndDate,
    matchedSeries,
    getDisplayName,
  });

  const isChartExpanded = Boolean(selectedPresetMeta);

  function renderEventsAnalysis() {
    return (
      <>
        {isLoadingEvents && <p>Loading event summary...</p>}
        {(downloadError || summaryError || rangeError) && (
          <p>
            {downloadError ??
              (summaryError ? 'Failed to load event summary.' : 'Failed to load data.')}
          </p>
        )}
        {eventSummary && (
          <>
            {minPeakDate && maxPeakDate && (
              <>
                <div
                  className={
                    'mt-[0.3rem] mb-[0.6rem] flex w-full flex-wrap items-center justify-between rounded-[10px] border border-black/8 bg-[#4288c9] px-[0.55rem] py-[0.28rem] text-[0.82rem] text-white shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                  }
                >
                  <span>Select range within</span>
                  <div className="flex flex-wrap items-center">
                    <label
                      htmlFor="peak-start-date"
                      className="mx-[0.22rem] flex items-center"
                    >
                      <input
                        id="peak-start-date"
                        className={
                          'w-[5.4rem] max-w-full appearance-none rounded-lg border-0 bg-transparent px-[0.25rem] py-[0.25rem] text-[0.82rem] font-semibold text-white outline-none focus:ring-0 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden'
                        }
                        type="date"
                        min={minPeakDate ?? undefined}
                        max={maxPeakDate ?? undefined}
                        value={rangeStartDate ?? ''}
                        aria-label="Peak start date"
                        onChange={(event) => {
                          setStartDate(event.target.value);
                        }}
                      />
                    </label>
                    <span className="text-white/80">-</span>
                    <label
                      htmlFor="peak-end-date"
                      className="mx-[0.22rem] flex items-center"
                    >
                      <input
                        id="peak-end-date"
                        className={
                          'w-[5.4rem] max-w-full appearance-none rounded-lg border-0 bg-transparent px-[0.25rem] py-[0.25rem] text-[0.82rem] font-semibold text-white outline-none focus:ring-0 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden'
                        }
                        type="date"
                        min={minPeakDate ?? undefined}
                        max={maxPeakDate ?? undefined}
                        value={rangeEndDate ?? ''}
                        aria-label="Peak end date"
                        onChange={(event) => {
                          setEndDate(event.target.value);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
            <section className={'mt-[0.25rem] rounded-[10px] bg-white'}>
              <div
                className={
                  'grid grid-cols-2 gap-x-[0.6rem] gap-y-[0.45rem] min-[901px]:grid-cols-3 min-[901px]:grid-rows-2'
                }
              >
                <button
                  type="button"
                  className="relative col-span-2 grid grid-cols-2 gap-x-[0.6rem] gap-y-[0.45rem] rounded-[10px] border border-gray-300 bg-[#ee9d6e] p-[0.6rem] text-left shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-transform duration-100 hover:-translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fb1d1] min-[901px]:row-span-2"
                  aria-label="Copy four metric cards"
                  onMouseMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    setHoverPos({
                      x: event.clientX - bounds.left + 12,
                      y: event.clientY - bounds.top + 12,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoverPos(null);
                  }}
                  onClick={() => {
                    void copyMetrics();
                  }}
                >
                  {hoverPos && (
                    <span
                      className={cn(
                        'pointer-events-none absolute z-10 rounded-full border border-black/10 bg-white/65 px-2 py-[0.12rem] text-[0.62rem] font-semibold tracking-[0.08em] uppercase opacity-100 shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-opacity duration-150',
                        isMetricsCopied ? 'text-black/80' : 'text-black/70',
                      )}
                      style={{
                        left: hoverPos.x,
                        top: hoverPos.y - 36,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {isMetricsCopied ? 'copied' : 'copy'}
                    </span>
                  )}
                  <div
                    className={
                      'flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-[0.45rem] rounded-[8px] border border-black/8 bg-white/12 p-[0.6rem] shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                    }
                  >
                    <strong
                      className={
                        'text-center text-[0.8rem] leading-[1.15] tracking-[0.06em] text-black/80'
                      }
                    >
                      Max Peak
                    </strong>
                    <span
                      className={
                        'block w-full text-center text-[1.52rem] leading-none font-semibold text-black'
                      }
                    >
                      {formatNumber(eventSummary.maxPeakValue)}
                    </span>
                  </div>
                  <div
                    className={
                      'flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-[0.45rem] rounded-[8px] border border-black/8 bg-white/12 p-[0.6rem] shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                    }
                  >
                    <strong
                      className={
                        'text-center text-[0.8rem] leading-[1.15] tracking-[0.06em] text-black/80'
                      }
                    >
                      Avg Peak
                    </strong>
                    <span
                      className={
                        'block w-full text-center text-[1.52rem] leading-none font-semibold text-black'
                      }
                    >
                      {formatNumber(eventSummary.avgPeakValue)}
                    </span>
                  </div>
                  <div
                    className={
                      'flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-[0.45rem] rounded-[8px] border border-black/8 bg-white/12 p-[0.6rem] shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                    }
                  >
                    <strong
                      className={
                        'text-center text-[0.8rem] leading-[1.15] tracking-[0.06em] text-black/80'
                      }
                    >
                      Avg Fall
                    </strong>
                    <span
                      className={
                        'block w-full text-center text-[1.52rem] leading-none font-semibold text-black'
                      }
                    >
                      {formatNumber(eventSummary.avgFallTime)}
                    </span>
                  </div>
                  <div
                    className={
                      'flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-[0.45rem] rounded-[8px] border border-black/8 bg-white/12 p-[0.6rem] shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                    }
                  >
                    <strong
                      className={
                        'text-center text-[0.8rem] leading-[1.15] tracking-[0.06em] text-black/80'
                      }
                    >
                      Avg Rise
                    </strong>
                    <span
                      className={
                        'block w-full text-center text-[1.52rem] leading-none font-semibold text-black'
                      }
                    >
                      {formatNumber(eventSummary.avgRiseTime)}
                    </span>
                  </div>
                </button>
                <div
                  className={
                    'relative flex min-h-[88px] min-w-0 flex-col items-center justify-center gap-[0.45rem] rounded-[10px] border border-black/8 bg-[#AFBEA5] p-[0.6rem] shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)]'
                  }
                >
                  <strong
                    className={
                      'text-center text-[0.8rem] leading-[1.15] tracking-[0.06em] text-black/80'
                    }
                  >
                    In Range
                  </strong>
                  <button
                    type="button"
                    className={cn(
                      'block w-full cursor-pointer text-center text-[1.52rem] leading-none font-semibold text-black focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fb1d1]',
                      !isLoadingRangeCount &&
                        !isDownloadingEvents &&
                        'hover:underline focus-visible:underline',
                    )}
                    onClick={() => {
                      void downloadEventsXlsx();
                    }}
                  >
                    {isLoadingRangeCount || isDownloadingEvents ? (
                      '...'
                    ) : (
                      (rangeMatchedEvents ?? '-')
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className={cn(
                    'flex min-h-[88px] min-w-0 cursor-pointer items-center justify-center rounded-[10px] border border-black/8 bg-[oklch(0.9851_0_0)] p-[0.6rem] text-center text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.65)] transition-colors hover:bg-[oklch(0.9214_0.0248_257.65)]',
                    isChartExpanded ? 'text-[1.7rem] leading-none' : 'text-slate-900',
                  )}
                  aria-label={isChartExpanded ? 'Collapse preset charts' : 'Expand preset charts'}
                  onClick={() => {
                    if (!activeTabKey) return;

                    if (isChartExpanded) {
                      clearTabPreset(activeTabKey);
                      return;
                    }

                    setSelectedPresetByTab((prev) => ({
                      ...prev,
                      [activeTabKey]: prev[activeTabKey] || chartPresets[0].id,
                    }));
                  }}
                >
                  {isChartExpanded ? <CollapseChartsIcon /> : <ChartsIcon />}
                </button>
              </div>
            </section>
          </>
        )}
      </>
    );
  }

  function renderChartSection() {
    if (!selectedPresetMeta) {
      return null;
    }

    return (
      <section
        className={
          'mt-[0.8rem] min-[901px]:mt-0 min-[901px]:flex min-[901px]:flex-col min-[901px]:justify-center'
        }
      >
        <div
          className={
            'mb-1 flex justify-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          }
        >
          {chartPresets.map((preset) => {
            const isActive = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  'flex items-center justify-center rounded-full border px-4 py-1 text-center text-[0.8rem] whitespace-nowrap transition-colors',
                  isActive
                    ? 'pointer-events-none cursor-default border-[oklch(0.5144_0.1605_267.44)] bg-[oklch(0.5144_0.1605_267.44)] text-white'
                    : 'cursor-pointer border-gray-300 bg-[oklch(0.9851_0_0)] text-slate-900 hover:bg-[oklch(0.9214_0.0248_257.65)]',
                )}
                onClick={() => {
                  if (!activeTabKey) return;
                  setSelectedPresetByTab((prev) => ({
                    ...prev,
                    [activeTabKey]: preset.id,
                  }));
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div
          className={
            'relative rounded-[10px] bg-white p-[0.55rem] min-[901px]:h-full min-[901px]:min-h-0 min-[901px]:w-full'
          }
        >
          {isLoadingRangeCount ? (
            <p>Loading chart...</p>
          ) : chartPoints.length > 0 ? (
            <div
              className={
                'relative m-0 flex w-full cursor-pointer justify-center overflow-hidden border-0 bg-transparent p-0 text-left'
              }
              onClick={() => {
                void downloadChartPng();
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nextX = e.clientX - rect.left + HOVER_DOWNLOAD_BUTTON_OFFSET;
                const nextY = e.clientY - rect.top + HOVER_DOWNLOAD_BUTTON_OFFSET;
                const maxX = Math.max(
                  HOVER_DOWNLOAD_BUTTON_MARGIN,
                  rect.width - HOVER_DOWNLOAD_BUTTON_SIZE - HOVER_DOWNLOAD_BUTTON_MARGIN,
                );
                const maxY = Math.max(
                  HOVER_DOWNLOAD_BUTTON_MARGIN,
                  rect.height - HOVER_DOWNLOAD_BUTTON_SIZE - HOVER_DOWNLOAD_BUTTON_MARGIN,
                );
                const clampedX = Math.min(Math.max(nextX, HOVER_DOWNLOAD_BUTTON_MARGIN), maxX);
                const clampedY = Math.min(Math.max(nextY, HOVER_DOWNLOAD_BUTTON_MARGIN), maxY);

                setHoverPos({ x: clampedX, y: clampedY });
              }}
              onMouseLeave={() => setHoverPos(null)}
            >
              {hoverPos && (
                <button
                  type="button"
                  className={
                    'pointer-events-auto absolute z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition-transform duration-75 active:scale-95'
                  }
                  style={{
                    left: hoverPos.x,
                    top: hoverPos.y,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    void downloadChartPng();
                  }}
                  aria-label="Download chart as PNG"
                  title="Download chart as PNG"
                >
                  <Download size={14} />
                </button>
              )}
              <div
                className={
                  'mx-auto h-[440px] w-full max-w-[760px] max-[900px]:h-[320px] min-[901px]:h-full'
                }
              >
                {selectedPreset === 'seasonal_frequency' ? (
                  <StationMonthlyFrequencyChart
                    ref={chartSvgRef}
                    points={monthlyFrequency}
                    title={chartTitle}
                  />
                ) : selectedPreset === 'peak_distribution' ? (
                  <StationPeakDistributionChart
                    ref={chartSvgRef}
                    points={peakDistribution}
                    title={chartTitle}
                  />
                ) : (
                  <StationEventTimelineChart
                    ref={chartSvgRef}
                    points={chartPoints}
                    title={chartTitle}
                  />
                )}
              </div>
            </div>
          ) : (
            <p>No matched events in selected range.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <aside
      className={cn(
        'absolute right-3 z-[1000] hidden overflow-hidden rounded-2xl bg-white font-sans shadow-[0_12px_24px_rgba(0,0,0,0.2)]',
        'top-3 w-[min(360px,calc(100vw-2rem))]',
        'max-[900px]:top-auto max-[900px]:right-3 max-[900px]:bottom-3 max-[900px]:left-3 max-[900px]:max-h-[42%] max-[900px]:w-auto',
        isOpen && 'block',
        selectedPreset && 'w-[min(980px,calc(100vw-2rem))] max-[900px]:w-auto',
      )}
    >
      {isOpen ? (
        <>
          <div className={'bg-[oklch(0.97_0_0)] px-[0.6rem] pt-2 pb-0'}>
            <div className={'relative'}>
              <div
                className={
                  'flex snap-x snap-proximity items-end gap-[0.22rem] overflow-x-auto overflow-y-hidden px-[0.15rem] pb-0 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                }
                role="tablist"
                aria-label="Panel tabs"
              >
                {basinTab && (
                  <div
                    className={cn(
                      'relative z-10 inline-flex max-w-[min(270px,58vw)] min-w-0 flex-none translate-y-[1px] snap-start items-center rounded-t-xl max-[900px]:max-w-[min(230px,64vw)]',
                      activeTab === 'basin' && 'z-30 translate-y-0 bg-white',
                    )}
                  >
                    <button
                      type="button"
                      id="tab-basin"
                      className={cn(
                        'flex max-w-full min-w-0 flex-1 items-center gap-2 overflow-hidden border-0 bg-transparent py-[0.42rem] pr-[0.4rem] pl-[0.66rem] text-left text-[0.84rem] leading-[1.2] text-ellipsis whitespace-nowrap text-slate-900',
                        'max-[900px]:pl-[0.56rem] max-[900px]:text-[0.82rem]',
                        activeTab !== 'basin' && 'cursor-pointer',
                        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]',
                      )}
                      role="tab"
                      aria-selected={activeTab === 'basin'}
                      aria-controls="tabpanel-basin"
                      tabIndex={activeTab === 'basin' ? 0 : -1}
                      onClick={onActivateBasinTab}
                    >
                      <BasinBadgeIcon />
                      <span className="truncate">{basinTab.basinName}</span>
                    </button>
                    <div className={'flex flex-none items-center pr-[0.22rem]'}>
                      <button
                        type="button"
                        className={
                          'h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-[0.96rem] leading-none font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]'
                        }
                        aria-label="Close basin tab"
                        onClick={() => {
                          clearTabPreset(basinTab ? `b:${basinTab.basinName}` : null);
                          clearTabDateRange(basinTab ? `b:${basinTab.basinName}` : null);
                          onCloseBasinTab();
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {stationTab && (
                  <div
                    className={cn(
                      'relative z-10 inline-flex max-w-[min(270px,58vw)] min-w-0 flex-none translate-y-[1px] snap-start items-center rounded-t-xl max-[900px]:max-w-[min(230px,64vw)]',
                      activeTab === 'station' && 'z-30 translate-y-0 bg-white',
                    )}
                  >
                    <button
                      type="button"
                      id="tab-station"
                      className={cn(
                        'flex max-w-full min-w-0 flex-1 items-center gap-2 overflow-hidden border-0 bg-transparent py-[0.42rem] pr-[0.4rem] pl-[0.66rem] text-left text-[0.84rem] leading-[1.2] text-ellipsis whitespace-nowrap text-slate-900',
                        'max-[900px]:pl-[0.56rem] max-[900px]:text-[0.82rem]',
                        activeTab !== 'station' && 'cursor-pointer',
                        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]',
                      )}
                      role="tab"
                      aria-selected={activeTab === 'station'}
                      aria-controls="tabpanel-station"
                      tabIndex={activeTab === 'station' ? 0 : -1}
                      onClick={onActivateStationTab}
                    >
                      <StationBadgeIcon />
                      <span className="truncate">{getDisplayName(stationTab)}</span>
                    </button>
                    <div className={'flex flex-none items-center pr-[0.22rem]'}>
                      <button
                        type="button"
                        className={
                          'h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-[0.96rem] leading-none font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fb1d1]'
                        }
                        aria-label="Close station tab"
                        onClick={() => {
                          clearTabPreset(stationTab ? `s:${stationTab.station_id}` : null);
                          clearTabDateRange(stationTab ? `s:${stationTab.station_id}` : null);
                          onCloseStationTab();
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={
              'max-h-[calc(100%-60px)] overflow-x-hidden overflow-y-auto px-4 py-[0.85rem] [&_p]:m-0 [&_p]:mb-[0.55rem] [&_p]:text-[0.95rem] [&_p]:leading-[1.35]'
            }
            role="tabpanel"
            id={activeTab === 'basin' ? 'tabpanel-basin' : 'tabpanel-station'}
            aria-labelledby={activeTab === 'basin' ? 'tab-basin' : 'tab-station'}
          >
            <div
              className={cn(
                'block',
                selectedPreset &&
                  'min-[901px]:grid min-[901px]:grid-cols-[340px_minmax(0,1fr)] min-[901px]:items-stretch min-[901px]:gap-3',
              )}
            >
              {currentStation ? (
                <section
                  className={
                    'min-w-0 min-[901px]:max-h-none min-[901px]:min-w-0 min-[901px]:overflow-visible min-[901px]:pr-[2px]'
                  }
                >
                  {(() => {
                    const basinName = currentStation.basin_name;

                    return (
                      <>
                        <p>
                          {basinName ? (
                            <>
                              <button
                                type="button"
                                className={
                                  'font-inherit cursor-pointer border-0 bg-transparent p-0 font-normal text-[#5E5A52] hover:text-[#dc2626] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fb1d1]'
                                }
                                onClick={() => onOpenBasinTab(basinName)}
                              >
                                {basinName}
                              </button>{' '}
                              basin
                            </>
                          ) : (
                            '- basin'
                          )}{' '}
                          • {isLoadingEvents ? 'Loading...' : (totalEvents ?? '-')} events •{' '}
                          {isLoadingEvents ? 'Loading...' : (coveredYearsCount ?? '-')} years
                        </p>
                        {renderEventsAnalysis()}
                      </>
                    );
                  })()}
                </section>
              ) : (
                <section
                  className={
                    'min-w-0 min-[901px]:max-h-none min-[901px]:min-w-0 min-[901px]:overflow-visible min-[901px]:pr-[2px]'
                  }
                >
                  <p>
                    {currentBasinCount} stations •{' '}
                    {isLoadingEvents ? 'Loading...' : (totalEvents ?? '-')} events{' '}
                    • {isLoadingEvents ? 'Loading...' : (coveredYearsCount ?? '-')} years
                  </p>
                  {renderEventsAnalysis()}
                </section>
              )}

              {renderChartSection()}
            </div>
          </div>
        </>
      ) : (
        <div className={'p-4 text-[0.95rem] text-slate-600'}>
          Click a station or search a basin to view details.
        </div>
      )}
    </aside>
  );
}
