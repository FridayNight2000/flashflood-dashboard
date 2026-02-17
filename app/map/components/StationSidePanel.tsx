"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Station,
  StationMatchedPoint,
  StationEventsApiResponse,
  StationEventSummary,
} from "../../types/index";
import StationEventTimelineChart from "./StationEventTimelineChart";
import StationMonthlyFrequencyChart from "./StationMonthlyFrequencyChart";
import StationPeakDistributionChart from "./StationPeakDistributionChart";
import styles from "./StationSidePanel.module.css";

type BasinTabData = {
  basinName: string;
  stationCount: number;
};

type ChartPresetId =
  | "timeline_all"
  | "seasonal_frequency"
  | "peak_distribution";

const chartPresets: Array<{
  id: ChartPresetId;
  label: string;
}> = [
  {
    id: "timeline_all",
    label: "Timeline",
  },
  {
    id: "seasonal_frequency",
    label: "Season",
  },
  {
    id: "peak_distribution",
    label: "Peaks",
  },
];

type StationSidePanelProps = {
  activeTab: "basin" | "station" | null;
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
    return "-";
  }
  return value.toFixed(2);
}

function toDateOnly(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.slice(0, 10);
}

function sanitizeFileNamePart(value: string): string {
  return value.replace(/[\\/:*?"<>|\s]+/g, "_");
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
  // 修改备注: 缓存 station_id / basin_name 对应的聚合结果，避免重复请求
  const cacheRef = useRef<Record<string, StationEventsApiResponse>>({});
  const [eventSummary, setEventSummary] = useState<StationEventSummary | null>(
    null,
  );
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [peakStartDate, setPeakStartDate] = useState("");
  const [peakEndDate, setPeakEndDate] = useState("");
  const [rangeMatchedEvents, setRangeMatchedEvents] = useState<number | null>(
    null,
  );
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [isLoadingRangeCount, setIsLoadingRangeCount] = useState(false);
  const [selectedPresetByTab, setSelectedPresetByTab] = useState<
    Record<string, ChartPresetId | null>
  >({});
  const [matchedSeries, setMatchedSeries] = useState<StationMatchedPoint[]>([]);
  const [isMetricsCopied, setIsMetricsCopied] = useState(false);
  const [isDownloadingEvents, setIsDownloadingEvents] = useState(false);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const currentStation = activeTab === "station" ? stationTab : null;
  const currentBasin = activeTab === "basin" ? basinTab?.basinName ?? null : null;
  const currentBasinCount = activeTab === "basin" ? basinTab?.stationCount ?? 0 : 0;
  const activeTabKey = currentStation
    ? `s:${currentStation.station_id}`
    : currentBasin
      ? `b:${currentBasin}`
      : null;
  const selectedPreset = activeTabKey ? selectedPresetByTab[activeTabKey] ?? null : null;

  const selectedPresetMeta = chartPresets.find(
    (preset) => preset.id === selectedPreset,
  );
  const chartPoints = useMemo(() => matchedSeries, [matchedSeries]);
  const monthlyFrequency = useMemo(() => {
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
  const peakDistribution = useMemo(() => {
    return matchedSeries
      .filter((item) => Number.isFinite(item.peak_value))
      .sort((a, b) => b.peak_value - a.peak_value)
      .map((item, index) => ({
        rank: index + 1,
        peak_value: item.peak_value,
      }));
  }, [matchedSeries]);

  const isOpen =
    (activeTab === "station" && Boolean(stationTab)) ||
    (activeTab === "basin" && Boolean(basinTab));

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

  async function handleDownloadPng() {
    if ((!currentStation && !currentBasin) || !chartSvgRef.current || matchedSeries.length === 0) {
      return;
    }

    const svgEl = chartSvgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const blobUrl = URL.createObjectURL(svgBlob);

    try {
      const image = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to load SVG data."));
      });
      image.src = blobUrl;
      await loaded;

      const scale = 2;
      const width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 640;
      const height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 260;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      const a = document.createElement("a");
      const start = rangeStartDate ?? "start";
      const end = rangeEndDate ?? "end";
      a.href = canvas.toDataURL("image/png");

      const filePrefix = currentStation
        ? sanitizeFileNamePart(getDisplayName(currentStation))
        : `basin_${currentBasin}`;
      a.download = `${filePrefix}_event_timeline_${start}_${end}.png`;
      a.click();
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  async function handleDownloadEventsXlsx() {
    if ((!currentStation && !currentBasin) || !rangeStartDate || !rangeEndDate) {
      return;
    }

    try {
      setIsDownloadingEvents(true);
      setEventsError(null);

      const query = new URLSearchParams({
        includeRecent: "0",
        includeMatchedEvents: "1",
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
      const stationNameForExport = currentStation
        ? getDisplayName(currentStation)
        : null;
      const basinNameForExport = currentStation?.basin_name ?? currentBasin ?? null;
      const rows = (detailedRows.length > 0
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
          })))
      .map((item, index) => {
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

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "events");

      const workbookArray = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([workbookArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;

      const prefix = currentStation
        ? `station_${stationNameForExport}`
        : `basin_${currentBasin}`;
      anchor.download = `${sanitizeFileNamePart(prefix)}_${rangeStartDate}_to_${rangeEndDate}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setEventsError("Failed to download matched events file.");
    } finally {
      setIsDownloadingEvents(false);
    }
  }

  useEffect(() => {
    if (!currentStation && !currentBasin) {
      setEventSummary(null);
      setIsLoadingEvents(false);
      setEventsError(null);
      setPeakStartDate("");
      setPeakEndDate("");
      setRangeMatchedEvents(null);
      setTotalEvents(null);
      setIsLoadingRangeCount(false);
      setMatchedSeries([]);
      return;
    }

    const cacheKey = currentStation
      ? `s:${currentStation.station_id}`
      : `b:${currentBasin}`;

    const cached = cacheRef.current[cacheKey];
    if (cached) {
      setEventSummary(cached.summary);
      setRangeMatchedEvents(cached.summary.matchedEvents);
      setTotalEvents(cached.summary.matchedEvents);
      setIsLoadingEvents(false);
      setEventsError(null);
      setMatchedSeries([]);
      return;
    }
    setEventSummary(null);

    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setIsLoadingEvents(true);
        setEventsError(null);

        const url = currentStation
          ? `/api/stations/${currentStation.station_id}/events?includeRecent=0`
          : `/api/basins/${encodeURIComponent(currentBasin!)}/events?includeRecent=0`;

        const res = await fetch(url, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as StationEventsApiResponse;
        cacheRef.current[cacheKey] = data;
        setEventSummary(data.summary);
        setRangeMatchedEvents(data.summary.matchedEvents);
        setTotalEvents(data.summary.matchedEvents);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setEventsError("Failed to load event summary.");
          setEventSummary(null);
          setRangeMatchedEvents(null);
        }
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents();
    return () => controller.abort();
  }, [currentStation, currentBasin]);


  useEffect(() => {
    const minDate = toDateOnly(eventSummary?.minPeakTime ?? null);
    const maxDate = toDateOnly(eventSummary?.maxPeakTime ?? null);
    if (!minDate || !maxDate) {
      return;
    }
    setPeakStartDate(minDate);
    setPeakEndDate(maxDate);
  }, [eventSummary?.minPeakTime, eventSummary?.maxPeakTime]);

  const minPeakDate = toDateOnly(eventSummary?.minPeakTime ?? null);
  const maxPeakDate = toDateOnly(eventSummary?.maxPeakTime ?? null);
  const rangeStartDate = peakStartDate || minPeakDate;
  const rangeEndDate = peakEndDate || maxPeakDate;

  useEffect(() => {
    if ((!currentStation && !currentBasin) || !rangeStartDate || !rangeEndDate) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsLoadingRangeCount(true);
        const query = new URLSearchParams({
          includeRecent: "0",
          peakStart: rangeStartDate,
          peakEnd: rangeEndDate,
        });
        if (selectedPreset) {
          query.set("includeMatchedSeries", "1");
        }

        const url = currentStation
          ? `/api/stations/${currentStation.station_id}/events?${query.toString()}`
          : `/api/basins/${encodeURIComponent(currentBasin!)}/events?${query.toString()}`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = (await res.json()) as StationEventsApiResponse;
        setEventSummary(data.summary);
        setRangeMatchedEvents(data.summary.matchedEvents);
        setMatchedSeries(data.matchedSeries ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setRangeMatchedEvents(null);
          setMatchedSeries([]);
        }
      } finally {
        setIsLoadingRangeCount(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [currentStation, currentBasin, rangeStartDate, rangeEndDate, selectedPreset]);

  function renderEventsAnalysis() {
    async function handleCopyMetrics() {
      if (!eventSummary) {
        return;
      }

      const text = [
        `Max Peak: ${formatNumber(eventSummary.maxPeakValue)}`,
        `Avg Peak: ${formatNumber(eventSummary.avgPeakValue)}`,
        `Avg Rise Time: ${formatNumber(eventSummary.avgRiseTime)}`,
        `Avg Fall Time: ${formatNumber(eventSummary.avgFallTime)}`,
      ].join("\n");

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setIsMetricsCopied(true);
      window.setTimeout(() => setIsMetricsCopied(false), 1200);
    }

    return (
      <>
        <div className={styles.stationSideDivider} />
        {isLoadingEvents && <p>Loading event summary...</p>}
        {eventsError && <p>{eventsError}</p>}
        {eventSummary && (
          <>
            {minPeakDate && maxPeakDate && (
              <>
                <p><strong>Time Range</strong></p>
                <div className={styles.sidePanelDateRow}>
                  <input
                    id="peak-start-date"
                    className={styles.sidePanelDateInput}
                    type="date"
                    min={minPeakDate ?? undefined}
                    max={maxPeakDate ?? undefined}
                    value={rangeStartDate ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      setPeakStartDate(next);
                      if (rangeEndDate && next > rangeEndDate) {
                        setPeakEndDate(next);
                      }
                    }}
                  />
                  <input
                    id="peak-end-date"
                    className={styles.sidePanelDateInput}
                    type="date"
                    min={minPeakDate ?? undefined}
                    max={maxPeakDate ?? undefined}
                    value={rangeEndDate ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      setPeakEndDate(next);
                      if (rangeStartDate && next < rangeStartDate) {
                        setPeakStartDate(next);
                      }
                    }}
                  />
                </div>
                <div className={styles.filteredEventsRow}>
                  <div className={styles.filteredEventsLeft}>
                    <strong>Events:</strong>{" "}
                    <span>
                      {isLoadingRangeCount ? "Loading..." : (rangeMatchedEvents ?? "-")}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.inlineDownloadBtn}
                    onClick={() => void handleDownloadEventsXlsx()}
                    disabled={isLoadingRangeCount || isDownloadingEvents}
                  >
                    {isDownloadingEvents ? "Downloading..." : "Download"}
                  </button>
                </div>
              </>
            )}
            <section className={styles.metricsCard}>
              <button
                type="button"
                className={styles.metricsCopyBtn}
                aria-label="Copy metrics"
                title={isMetricsCopied ? "Copied" : "Copy metrics"}
                onClick={() => void handleCopyMetrics()}
              >
                {isMetricsCopied ? "✓" : "📋"}
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
              <p><strong>Preset charts</strong></p>
              <div className={styles.presetList}>
                {chartPresets.map((preset) => {
                  const isActive = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.presetOption} ${isActive ? styles.presetOptionActive : ""}`}
                      onClick={() => {
                        if (!activeTabKey) {
                          return;
                        }
                        setSelectedPresetByTab((prev) => {
                          const currentPreset = prev[activeTabKey] ?? null;
                          return {
                            ...prev,
                            [activeTabKey]:
                              currentPreset === preset.id ? null : preset.id,
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
    const chartName = currentStation
      ? `station ${getDisplayName(currentStation)}`
      : `basin ${currentBasin ?? "Unknown"}`;
    const chartStart = rangeStartDate ?? "start";
    const chartEnd = rangeEndDate ?? "end";
    const chartTitle =
      selectedPreset === "seasonal_frequency"
        ? `${chartName} · Monthly Event Frequency · ${chartStart}–${chartEnd}`
        : selectedPreset === "peak_distribution"
          ? `${chartName} · Peak Exceedance Curve · ${chartStart}–${chartEnd}`
          : `${chartName} · Event Timeline · ${chartStart}–${chartEnd}`;

    return (
      <section className={styles.chartColumn}>
        <div className={styles.chartCard}>
          {isLoadingRangeCount ? (
            <p>Loading chart...</p>
          ) : chartPoints.length > 0 ? (
            <button
              type="button"
              className={styles.chartDownloadTrigger}
              onClick={() => void handleDownloadPng()}
              aria-label="Download chart as PNG"
            >
              <div className={styles.chartCanvas}>
                {selectedPreset === "seasonal_frequency" ? (
                  <StationMonthlyFrequencyChart
                    ref={chartSvgRef}
                    points={monthlyFrequency}
                    title={chartTitle}
                  />
                ) : selectedPreset === "peak_distribution" ? (
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
      className={`${styles.stationSidePanel} ${isOpen ? styles.open : ""} ${
        selectedPreset ? styles.panelExpanded : ""
      }`}
    >
      {isOpen ? (
        <>
          <div className={styles.stationSidePanelHeader}>
            <div className={styles.tabStrip}>
              <div className={styles.tabList} role="tablist" aria-label="Panel tabs">
                {basinTab && (
                  <div
                    className={`${styles.browserTab} ${
                      activeTab === "basin" ? styles.browserTabActive : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.browserTabLabel}
                      role="tab"
                      aria-selected={activeTab === "basin"}
                      tabIndex={activeTab === "basin" ? 0 : -1}
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
                          clearTabPreset(
                            basinTab ? `b:${basinTab.basinName}` : null,
                          );
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
                      activeTab === "station" ? styles.browserTabActive : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.browserTabLabel}
                      role="tab"
                      aria-selected={activeTab === "station"}
                      tabIndex={activeTab === "station" ? 0 : -1}
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
                          clearTabPreset(
                            stationTab ? `s:${stationTab.station_id}` : null,
                          );
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
                        </button>
                        {" "}basin
                      </>
                    ) : (
                      "- basin"
                    )}{" "}
                    • {isLoadingEvents ? "Loading..." : (totalEvents ?? "-")} events
                  </p>

                  {renderEventsAnalysis()}
                      </>
                    );
                  })()}
                </section>
              ) : (
                <section className={styles.infoColumn}>
                  <p>
                    {currentBasinCount} <strong>stations</strong> • {isLoadingEvents ? "Loading..." : (totalEvents ?? "-")} <strong>events</strong>
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
