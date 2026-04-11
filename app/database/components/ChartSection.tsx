'use client';

import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useState } from 'react';

import type { ChartPresetId } from '@/hooks/useStationEvents';
import { chartPresets } from '@/hooks/useStationEvents';
import { cn } from '@/lib/utils';
import type { StationMatchedPoint } from '@/types';

import type { MonthlyFrequencyPoint, PeakDistributionPoint } from '../types';
import SearchLoadingIcon from './SearchLoadingIcon';
import StationEventTimelineChart from './StationEventTimelineChart';
import StationMonthlyFrequencyChart from './StationMonthlyFrequencyChart';
import StationPeakDistributionChart from './StationPeakDistributionChart';

const HOVER_DOWNLOAD_BUTTON_SIZE = 32;
const HOVER_DOWNLOAD_BUTTON_OFFSET = 12;
const HOVER_DOWNLOAD_BUTTON_MARGIN = 4;

type ChartSectionProps = {
  selectedPreset: ChartPresetId | null;
  activeTabKey: string | null;
  setSelectedPresetByTab: Dispatch<SetStateAction<Record<string, ChartPresetId | null>>>;
  chartPoints: StationMatchedPoint[];
  monthlyFrequency: MonthlyFrequencyPoint[];
  peakDistribution: PeakDistributionPoint[];
  chartTitle: string;
  chartSvgRef: RefObject<SVGSVGElement | null>;
  downloadChartPng: () => Promise<void>;
  isLoadingRangeCount: boolean;
};

export default function ChartSection({
  selectedPreset,
  activeTabKey,
  setSelectedPresetByTab,
  chartPoints,
  monthlyFrequency,
  peakDistribution,
  chartTitle,
  chartSvgRef,
  downloadChartPng,
  isLoadingRangeCount,
}: ChartSectionProps) {
  const [chartHoverPos, setChartHoverPos] = useState<{ x: number; y: number } | null>(null);

  if (!selectedPreset) {
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
                'flex items-center justify-center rounded-full border-0 px-4 py-1 text-center text-[0.8rem] whitespace-nowrap transition-all duration-150 active:scale-95 shadow-sm',
                isActive
                  ? 'pointer-events-none cursor-default bg-[#4288c9] text-white shadow-[#4288c9]/20'
                  : 'cursor-pointer bg-[oklch(0.9851_0_0)] text-slate-900 hover:bg-[oklch(0.9214_0.0248_257.65)] hover:shadow-md',
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
          <div className="mx-auto flex h-[440px] w-full max-w-[760px] items-center justify-center max-[900px]:h-[320px] min-[901px]:h-full">
            <SearchLoadingIcon className="h-10 w-10 text-slate-400" />
          </div>
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

              setChartHoverPos({ x: clampedX, y: clampedY });
            }}
            onMouseLeave={() => setChartHoverPos(null)}
          >
            {chartHoverPos && (
              <span
                className={cn(
                  'pointer-events-none absolute z-10 rounded-full border border-black/10 bg-white/65 px-2 py-[0.12rem] text-[0.62rem] font-semibold tracking-[0.08em] uppercase opacity-100 shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-opacity duration-150 text-black/70',
                )}
                style={{
                  left: chartHoverPos.x,
                  top: chartHoverPos.y - 36,
                  transform: 'translateX(-50%)',
                }}
              >
                download
              </span>
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
