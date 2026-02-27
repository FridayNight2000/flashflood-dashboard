'use client';

import type { ActiveTab, BasinTabData } from '@/app/map/types';
import { useCsvExport } from '@/hooks/useCsvExport';
import { chartPresets, useStationEvents } from '@/hooks/useStationEvents';
import type { Station } from '@/types';

import StationEventTimelineChart from './StationEventTimelineChart';
import StationMonthlyFrequencyChart from './StationMonthlyFrequencyChart';
import StationPeakDistributionChart from './StationPeakDistributionChart';
import styles from './StationSidePanel.module.css';

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

  const { chartSvgRef, isDownloadingEvents, downloadError, downloadEventsXlsx, downloadChartPng } =
    useCsvExport({
      activeTabKey,
      currentStation,
      currentBasin,
      rangeStartDate,
      rangeEndDate,
      matchedSeries,
      getDisplayName,
    });

  function renderEventsAnalysis() {
    return (
      <>
        <div className={styles.stationSideDivider} />
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
                <p>
                  <strong>Time Range</strong>
                </p>
                <div className={styles.sidePanelDateRow}>
                  <input
                    id="peak-start-date"
                    className={styles.sidePanelDateInput}
                    type="date"
                    min={minPeakDate ?? undefined}
                    max={maxPeakDate ?? undefined}
                    value={rangeStartDate ?? ''}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                    }}
                  />
                  <input
                    id="peak-end-date"
                    className={styles.sidePanelDateInput}
                    type="date"
                    min={minPeakDate ?? undefined}
                    max={maxPeakDate ?? undefined}
                    value={rangeEndDate ?? ''}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                    }}
                  />
                </div>
                <div className={styles.filteredEventsRow}>
                  <div className={styles.filteredEventsLeft}>
                    <strong>Events:</strong>{' '}
                    <span>{isLoadingRangeCount ? 'Loading...' : (rangeMatchedEvents ?? '-')}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.inlineDownloadBtn}
                    onClick={() => void downloadEventsXlsx()}
                    disabled={isLoadingRangeCount || isDownloadingEvents}
                  >
                    {isDownloadingEvents ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              </>
            )}
            <section className={styles.metricsCard}>
              <button
                type="button"
                className={styles.metricsCopyBtn}
                aria-label="Copy metrics"
                title={isMetricsCopied ? 'Copied' : 'Copy metrics'}
                onClick={() => void copyMetrics()}
              >
                {isMetricsCopied ? '✓' : '📋'}
              </button>

              <div className={styles.metricsGrid}>
                <div className={styles.metricsItem}>
                  <strong>Max Peak</strong>
                  <span>{formatNumber(eventSummary.maxPeakValue)}</span>
                </div>
                <div className={styles.metricsItem}>
                  <strong>Avg Peak</strong>
                  <span>{formatNumber(eventSummary.avgPeakValue)}</span>
                </div>
                <div className={styles.metricsItem}>
                  <strong>Avg Rise Time</strong>
                  <span>{formatNumber(eventSummary.avgRiseTime)}</span>
                </div>
                <div className={styles.metricsItem}>
                  <strong>Avg Fall Time</strong>
                  <span>{formatNumber(eventSummary.avgFallTime)}</span>
                </div>
              </div>
            </section>
            <section className={styles.presetSection}>
              <p>
                <strong>Preset charts</strong>
              </p>
              <div className={styles.presetList}>
                {chartPresets.map((preset) => {
                  const isActive = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.presetOption} ${isActive ? styles.presetOptionActive : ''}`}
                      onClick={() => {
                        if (!activeTabKey) {
                          return;
                        }
                        setSelectedPresetByTab((prev) => {
                          const currentPreset = prev[activeTabKey] ?? null;
                          return {
                            ...prev,
                            [activeTabKey]: currentPreset === preset.id ? null : preset.id,
                          };
                        });
                      }}
                    >
                      <span className={styles.presetOptionLabel}>{preset.label}</span>
                    </button>
                  );
                })}
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
      <section className={styles.chartColumn}>
        <div className={styles.chartCard}>
          {isLoadingRangeCount ? (
            <p>Loading chart...</p>
          ) : chartPoints.length > 0 ? (
            <button
              type="button"
              className={styles.chartDownloadTrigger}
              onClick={() => void downloadChartPng()}
              aria-label="Download chart as PNG"
            >
              <div className={styles.chartCanvas}>
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
            </button>
          ) : (
            <p>No matched events in selected range.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <aside
      className={`${styles.stationSidePanel} ${isOpen ? styles.open : ''} ${
        selectedPreset ? styles.panelExpanded : ''
      }`}
    >
      {isOpen ? (
        <>
          <div className={styles.stationSidePanelHeader}>
            <div className={styles.tabStrip}>
              <div
                className={styles.tabList}
                role="tablist"
                aria-label="Panel tabs"
              >
                {basinTab && (
                  <div
                    className={`${styles.browserTab} ${
                      activeTab === 'basin' ? styles.browserTabActive : ''
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.browserTabLabel}
                      role="tab"
                      aria-selected={activeTab === 'basin'}
                      tabIndex={activeTab === 'basin' ? 0 : -1}
                      onClick={onActivateBasinTab}
                    >
                      Basin: {basinTab.basinName}
                    </button>
                    <div className={styles.browserTabCloseSlot}>
                      <button
                        type="button"
                        className={styles.browserTabClose}
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
                    className={`${styles.browserTab} ${
                      activeTab === 'station' ? styles.browserTabActive : ''
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.browserTabLabel}
                      role="tab"
                      aria-selected={activeTab === 'station'}
                      tabIndex={activeTab === 'station' ? 0 : -1}
                      onClick={onActivateStationTab}
                    >
                      Station: {getDisplayName(stationTab)}
                    </button>
                    <div className={styles.browserTabCloseSlot}>
                      <button
                        type="button"
                        className={styles.browserTabClose}
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

          <div className={styles.stationSidePanelBody}>
            <div className={styles.contentSplit}>
              {currentStation ? (
                <section className={styles.infoColumn}>
                  {(() => {
                    const basinName = currentStation.basin_name;

                    return (
                      <>
                        <p>
                          {basinName ? (
                            <>
                              <button
                                type="button"
                                className={styles.basinInlineLink}
                                onClick={() => onOpenBasinTab(basinName)}
                              >
                                {basinName}
                              </button>{' '}
                              basin
                            </>
                          ) : (
                            '- basin'
                          )}{' '}
                          • {isLoadingEvents ? 'Loading...' : (totalEvents ?? '-')} events
                        </p>

                        {renderEventsAnalysis()}
                      </>
                    );
                  })()}
                </section>
              ) : (
                <section className={styles.infoColumn}>
                  <p>
                    {currentBasinCount} <strong>stations</strong> •{' '}
                    {isLoadingEvents ? 'Loading...' : (totalEvents ?? '-')} <strong>events</strong>
                  </p>
                  {renderEventsAnalysis()}
                </section>
              )}

              {renderChartSection()}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.stationSidePanelEmpty}>
          Click a station or search a basin to view details.
        </div>
      )}
    </aside>
  );
}
