'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import StationHeader from '@/components/hydro/ui/StationHeader';
import { cleanFiles } from '@/lib/hydro/cleaner/cleanPipeline';
import { useWizardContext } from '@/lib/hydro/context';
import { downloadCleanedCsv } from '@/lib/hydro/export/csvExporter';
import { formatYearMonth } from '@/lib/hydro/utils/formatDate';

function StatCard({
  label,
  value,
  sub,
  color = 'text-gray-900',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-blue-100 bg-white p-4 text-center shadow-sm">
      <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="mt-0.5 text-xs font-medium text-gray-500">{label}</span>
      {sub && <span className="mt-1 text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function StepCleanResult() {
  const { state, dispatch } = useWizardContext();
  const { stationId, uploadedFiles, selectedRange, cleanedData, cleanStats } = state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const runClean = useCallback(async () => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!selectedRange || uploadedFiles.length === 0) {
      setError('Missing time range or files. Please go back and reconfigure.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const targetFiles = uploadedFiles.filter((f) => /\.(txt|tst)$/i.test(f.name));

    try {
      const result = await cleanFiles(targetFiles, selectedRange, (pct) => {
        setProgress(pct);
      });

      dispatch({ type: 'SET_CLEANED_DATA', payload: result.records });
      dispatch({ type: 'SET_CLEAN_STATS', payload: result.stats });
    } catch (e) {
      setError(`Cleaning failed: ${String(e)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedRange, uploadedFiles, dispatch]);

  useEffect(() => {
    if (cleanStats === null) {
      runClean();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <StationHeader stationId={stationId}>
        {selectedRange && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              {formatYearMonth(selectedRange.start)} - {formatYearMonth(selectedRange.end)}
            </span>
          </div>
        )}
      </StationHeader>

      {(isProcessing || cleanStats) && (
        <div className="flex flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="space-y-3 bg-linear-to-b from-blue-50 to-white p-5">
            {isProcessing ? (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Cleaning data...
                </div>
                <ProgressBar value={progress} />
                <p className="text-right text-xs text-blue-500">{progress}%</p>
              </>
            ) : (
              cleanStats && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cleaning Complete
                  </span>
                </div>
              )
            )}
          </div>

          {!isProcessing && cleanStats && (
            <div className="p-5 pt-0">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Rows"
                  value={cleanStats.totalRows.toLocaleString()}
                  color="text-gray-900"
                />
                <StatCard
                  label="Valid Rows"
                  value={cleanStats.validRows.toLocaleString()}
                  color="text-emerald-600"
                />
                <StatCard
                  label="Coverage"
                  value={`${(cleanStats.validRate * 100).toFixed(1)}%`}
                  color={
                    cleanStats.validRate >= 0.9
                      ? 'text-emerald-600'
                      : cleanStats.validRate >= 0.7
                        ? 'text-amber-500'
                        : 'text-red-500'
                  }
                />
                <StatCard
                  label="Longest Gap"
                  value={
                    cleanStats.longestGapHours >= 48
                      ? `${(cleanStats.longestGapHours / 24).toFixed(1)} days`
                      : `${Math.round(cleanStats.longestGapHours)} hrs`
                  }
                  color={
                    cleanStats.longestGapHours >= 720
                      ? 'text-red-500'
                      : cleanStats.longestGapHours >= 168
                        ? 'text-amber-500'
                        : 'text-gray-900'
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Detrend explanation */}
      <div className="px-5 pt-5">
        <h4 className="mb-2 text-sm font-bold text-slate-700">Why detrend?</h4>
        <p className="text-sm leading-relaxed text-slate-500">
          Raw water level data often contains slow background drift from sensor aging, land
          subsidence, or seasonal cycles. Detrending removes this drift, making short-term spikes
          stand out more clearly.
        </p>
      </div>

      {!isProcessing && cleanStats && (
        <div className="mt-5 flex justify-center px-5 pb-5">
          <div className="flex gap-3">
            <div className="group relative flex">
              <button
                onClick={() => {
                  if (cleanedData.length > 0 && selectedRange) {
                    downloadCleanedCsv(cleanedData, stationId, selectedRange);
                  }
                }}
                disabled={cleanedData.length === 0}
                className="flex h-10 w-12 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              {cleanedData.length > 0 && (
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Download cleaned CSV
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
              disabled={cleanedData.length === 0}
              className="flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 font-medium text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Detrend
            </button>
          </div>
        </div>
      )}

      {!isProcessing && !cleanStats && !error && (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Initializing...
        </div>
      )}
    </div>
  );
}
