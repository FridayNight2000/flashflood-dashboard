'use client';

import { useCsvExport } from '@/hooks/useCsvExport';
import { chartPresets, useStationEvents } from '@/hooks/useStationEvents';
import { cn } from '@/lib/utils';
import type { Station } from '@/types';

import type { ActiveTab, BasinTabData } from '../types';
import ChartSection from './ChartSection';
import DateRangeBar from './DateRangeBar';
import MetricsCardGrid from './MetricsCardGrid';
import PanelTabBar from './PanelTabBar';
import SearchLoadingIcon from './SearchLoadingIcon';

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

  function handleCloseBasinTab() {
    clearTabPreset(basinTab ? `b:${basinTab.basinName}` : null);
    clearTabDateRange(basinTab ? `b:${basinTab.basinName}` : null);
    onCloseBasinTab();
  }

  function handleCloseStationTab() {
    clearTabPreset(stationTab ? `s:${stationTab.station_id}` : null);
    clearTabDateRange(stationTab ? `s:${stationTab.station_id}` : null);
    onCloseStationTab();
  }

  function handleToggleChart() {
    if (!activeTabKey) return;
    if (isChartExpanded) {
      clearTabPreset(activeTabKey);
      return;
    }
    setSelectedPresetByTab((prev) => ({
      ...prev,
      [activeTabKey]: prev[activeTabKey] || chartPresets[0].id,
    }));
  }

  const basinName = currentStation?.basin_name;
  const summaryLine = currentStation
    ? null
    : `${currentBasinCount} stations • ${totalEvents ?? '-'} events • ${coveredYearsCount ?? '-'} years`;

  function renderEventsAnalysis() {
    if (isLoadingEvents) {
      return (
        <div className="mt-[0.25rem] flex min-h-[181px] items-center justify-center">
          <SearchLoadingIcon className="h-12 w-12 text-slate-400" />
        </div>
      );
    }

    return (
      <>
        {(downloadError || summaryError || rangeError) && (
          <p>
            {downloadError ??
              (summaryError ? 'Failed to load event summary.' : 'Failed to load data.')}
          </p>
        )}
        {eventSummary && (
          <>
            <DateRangeBar
              minPeakDate={minPeakDate}
              maxPeakDate={maxPeakDate}
              rangeStartDate={rangeStartDate}
              rangeEndDate={rangeEndDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            <MetricsCardGrid
              eventSummary={eventSummary}
              isMetricsCopied={isMetricsCopied}
              copyMetrics={copyMetrics}
              rangeMatchedEvents={rangeMatchedEvents}
              isLoadingRangeCount={isLoadingRangeCount}
              isDownloadingEvents={isDownloadingEvents}
              downloadEventsXlsx={downloadEventsXlsx}
              isChartExpanded={isChartExpanded}
              onToggleChart={handleToggleChart}
            />
          </>
        )}
      </>
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
          <PanelTabBar
            activeTab={activeTab}
            basinTab={basinTab}
            stationTab={stationTab}
            onActivateBasinTab={onActivateBasinTab}
            onActivateStationTab={onActivateStationTab}
            onCloseBasinTab={handleCloseBasinTab}
            onCloseStationTab={handleCloseStationTab}
            getDisplayName={getDisplayName}
          />

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
              <section
                className={
                  'min-w-0 min-[901px]:max-h-none min-[901px]:min-w-0 min-[901px]:overflow-visible min-[901px]:pr-[2px]'
                }
              >
                {isLoadingEvents ? (
                  <div className="mb-[0.55rem] h-[1.2825rem]" aria-hidden="true" />
                ) : currentStation ? (
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
                    • {totalEvents ?? '-'} events • {coveredYearsCount ?? '-'} years
                  </p>
                ) : (
                  <p>{summaryLine}</p>
                )}
                {renderEventsAnalysis()}
              </section>

              <ChartSection
                selectedPreset={selectedPreset}
                activeTabKey={activeTabKey}
                setSelectedPresetByTab={setSelectedPresetByTab}
                chartPoints={chartPoints}
                monthlyFrequency={monthlyFrequency}
                peakDistribution={peakDistribution}
                chartTitle={chartTitle}
                chartSvgRef={chartSvgRef}
                downloadChartPng={downloadChartPng}
                isLoadingRangeCount={isLoadingRangeCount}
              />
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
