'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { StationEventSummary } from '@/types';

import { ChartsIcon, CollapseChartsIcon } from './PanelIcons';

type MetricsCardGridProps = {
  eventSummary: StationEventSummary;
  isMetricsCopied: boolean;
  copyMetrics: () => Promise<void>;
  rangeMatchedEvents: number | null;
  isLoadingRangeCount: boolean;
  isDownloadingEvents: boolean;
  downloadEventsXlsx: () => Promise<void>;
  isChartExpanded: boolean;
  onToggleChart: () => void;
};

function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return value.toFixed(2);
}

const metricCards: {
  key: keyof Pick<
    StationEventSummary,
    'maxPeakValue' | 'avgPeakValue' | 'avgFallTime' | 'avgRiseTime'
  >;
  label: string;
}[] = [
  { key: 'maxPeakValue', label: 'MAX PEAK' },
  { key: 'avgPeakValue', label: 'AVG PEAK' },
  { key: 'avgFallTime', label: 'AVG FALL' },
  { key: 'avgRiseTime', label: 'AVG RISE' },
];

const glassMetricCardClassName =
  'min-w-0 border border-black/8 shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.38)] backdrop-blur-[6px]';

export default function MetricsCardGrid({
  eventSummary,
  isMetricsCopied,
  copyMetrics,
  rangeMatchedEvents,
  isLoadingRangeCount,
  isDownloadingEvents,
  downloadEventsXlsx,
  isChartExpanded,
  onToggleChart,
}: MetricsCardGridProps) {
  const [copyHoverPos, setCopyHoverPos] = useState<{ x: number; y: number } | null>(null);

  return (
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
            setCopyHoverPos({
              x: event.clientX - bounds.left + 12,
              y: event.clientY - bounds.top + 12,
            });
          }}
          onMouseLeave={() => {
            setCopyHoverPos(null);
          }}
          onClick={() => {
            void copyMetrics();
          }}
        >
          {copyHoverPos && (
            <span
              className={cn(
                'pointer-events-none absolute z-10 rounded-full border border-black/10 bg-white/65 px-2 py-[0.12rem] text-[0.62rem] font-semibold tracking-[0.08em] uppercase opacity-100 shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-opacity duration-150',
                isMetricsCopied ? 'text-black/80' : 'text-black/70',
              )}
              style={{
                left: copyHoverPos.x,
                top: copyHoverPos.y - 36,
                transform: 'translateX(-50%)',
              }}
            >
              {isMetricsCopied ? 'copied' : 'copy'}
            </span>
          )}
          {metricCards.map((card) => (
            <div
              key={card.key}
              className={cn(
                glassMetricCardClassName,
                'flex min-h-[88px] flex-col items-center justify-center gap-[0.45rem] rounded-[8px] bg-white/12 p-[0.6rem]',
              )}
            >
              <strong
                className={
                  'text-center text-[0.6rem] leading-[1.15] font-(--font-geist-mono) tracking-[0.06em] text-black/80'
                }
              >
                {card.label}
              </strong>
              <span
                className={
                  'block w-full text-center text-[1.52rem] leading-none font-semibold text-black'
                }
              >
                {formatNumber(eventSummary[card.key])}
              </span>
            </div>
          ))}
        </button>
        <div
          className={cn(
            glassMetricCardClassName,
            'relative flex min-h-[88px] flex-col items-center justify-center gap-[0.45rem] overflow-hidden rounded-[10px] bg-[oklch(0.9851_0_0)] p-[0.6rem]',
          )}
        >
          <strong
            className={
              'relative z-10 ' +
              'text-center text-[0.6rem] leading-[1.15] font-(--font-geist-mono) tracking-[0.06em] text-slate-600'
            }
          >
            IN RANGE
          </strong>
          <button
            type="button"
            className={cn(
              'relative z-10 block w-full cursor-pointer text-center text-[1.52rem] leading-none font-semibold text-slate-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fb1d1]',
              !isLoadingRangeCount &&
                !isDownloadingEvents &&
                'hover:underline focus-visible:underline',
            )}
            onClick={() => {
              void downloadEventsXlsx();
            }}
          >
            {isLoadingRangeCount || isDownloadingEvents ? '...' : (rangeMatchedEvents ?? '-')}
          </button>
        </div>
        <button
          type="button"
          className={cn(
            'flex min-h-[88px] min-w-0 cursor-pointer items-center justify-center rounded-[10px] border border-black/8 bg-[oklch(0.9851_0_0)] p-[0.6rem] text-center text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.14),inset_0_-1px_0_rgba(255,255,255,0.65)] transition-colors hover:bg-[oklch(0.9214_0.0248_257.65)]',
            isChartExpanded ? 'text-[1.7rem] leading-none' : 'text-slate-900',
          )}
          aria-label={isChartExpanded ? 'Collapse preset charts' : 'Expand preset charts'}
          onClick={onToggleChart}
        >
          {isChartExpanded ? <CollapseChartsIcon /> : <ChartsIcon />}
        </button>
      </div>
    </section>
  );
}
