'use client';

import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

import StationHeader from '@/components/hydro/ui/StationHeader';
import { useWizardDispatch, useWizardStore } from '@/lib/hydro/context';
import { applyDetrend, getDetrendWindowSize } from '@/lib/hydro/detrend/rollingMedian';
import { getDataSpanMonths, suggestDetrendStrategy } from '@/lib/hydro/detrend/strategy';
import { downloadDetrendedCsv } from '@/lib/hydro/export/csvExporter';
import { formatYearMonth } from '@/lib/hydro/utils/formatDate';

const STRATEGY_LABEL: Record<'skip' | 'local' | 'full', string> = {
  skip: 'Skip',
  local: 'Local',
  full: 'Full',
};

export default function StepDetrend() {
  const dispatch = useWizardDispatch();
  const stationId = useWizardStore((state) => state.stationId);
  const selectedRange = useWizardStore((state) => state.selectedRange);
  const cleanedData = useWizardStore((state) => state.cleanedData);
  const detrendStrategy = useWizardStore((state) => state.detrendStrategy);
  const detrendedData = useWizardStore((state) => state.detrendedData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedStrategy, setLastProcessedStrategy] = useState<
    'skip' | 'local' | 'full' | null
  >(null);

  const dataSpanMonths = getDataSpanMonths(cleanedData);
  const suggestion = suggestDetrendStrategy(dataSpanMonths);

  const [dropdownStrategy, setDropdownStrategy] = useState<'skip' | 'local' | 'full'>(
    suggestion.strategy,
  );

  const appliedWindowSize = getDetrendWindowSize(cleanedData, detrendStrategy);
  const detrendedCount = detrendedData.filter((record) => record.detrended !== null).length;

  const isStrategyChanged =
    lastProcessedStrategy === null || lastProcessedStrategy !== dropdownStrategy;

  const handleStartProcess = async () => {
    if (cleanedData.length === 0) return;
    setIsProcessing(true);

    // Yield to let React paint the loading state before heavy computation
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    dispatch({ type: 'SET_DETREND_STRATEGY', payload: dropdownStrategy });
    const result = applyDetrend(cleanedData, dropdownStrategy);
    dispatch({ type: 'SET_DETRENDED_DATA', payload: result.records });
    setLastProcessedStrategy(dropdownStrategy);
    setIsProcessing(false);
  };

  return (
    <div>
      <StationHeader stationId={stationId}>
        {selectedRange && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {formatYearMonth(selectedRange.start)} - {formatYearMonth(selectedRange.end)}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <strong className="font-semibold text-gray-800">{suggestion.dataSpanMonths}</strong>{' '}
              months
            </span>
          </div>
        )}
      </StationHeader>

      <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-linear-to-b from-blue-50 to-white p-5">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Recommended Strategy
          </p>
          <div className="mt-3 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {STRATEGY_LABEL[suggestion.strategy]}
            </h2>
            <div className="h-5 w-px bg-gray-300"></div>
            <p className="text-sm text-gray-600">{suggestion.reason}</p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="detrend-strategy"
                className="text-sm font-medium text-gray-700"
              >
                Current strategy
              </label>
              <select
                id="detrend-strategy"
                value={dropdownStrategy}
                onChange={(event) => {
                  setDropdownStrategy(event.target.value as 'skip' | 'local' | 'full');
                }}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-blue-500"
              >
                <option value="skip">Skip — no baseline correction applied</option>
                <option value="local">Local — removes seasonal background variation</option>
                <option value="full">Full — removes multi-year background drift</option>
              </select>
            </div>

            <button
              onClick={handleStartProcess}
              disabled={isProcessing}
              className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-lg px-8 font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                isStrategyChanged
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              {isProcessing ? 'Processing...' : isStrategyChanged ? 'Run' : 'Rerun'}
            </button>
          </div>
        </div>
      </div>

      {detrendedData.length > 0 && (
        <div className="flex items-center gap-4 px-2 pt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <CheckCircle2 className="h-5 w-5 fill-emerald-600 text-white" />
            Done ·{' '}
            <strong className="ml-1 text-emerald-700">
              {STRATEGY_LABEL[detrendStrategy]} Detrend
            </strong>
          </span>
          <span className="h-4 w-px bg-gray-300"></span>
          <span>
            Baseline window:{' '}
            <strong className="font-semibold text-gray-900">
              {appliedWindowSize > 0 ? appliedWindowSize.toLocaleString() : 'SKIP'}
            </strong>
          </span>
          <span className="h-4 w-px bg-gray-300"></span>
          <span>
            Processed points:{' '}
            <strong className="font-semibold text-gray-900">
              {detrendedCount.toLocaleString()}
            </strong>
          </span>
        </div>
      )}

      <div className="mt-8 flex justify-center pb-5">
        <div className="flex gap-3 text-sm font-medium">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            New Station
          </button>

          <button
            onClick={() => {
              if (selectedRange && detrendedData.length > 0) {
                downloadDetrendedCsv(detrendedData, stationId, selectedRange);
              }
            }}
            disabled={!selectedRange || detrendedData.length === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 font-medium text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
