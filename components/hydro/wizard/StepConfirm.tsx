'use client';

import { useState } from 'react';

import StationHeader from '@/components/hydro/ui/StationHeader';
import TimeRangePicker from '@/components/hydro/ui/TimeRangePicker';
import { useWizardDispatch, useWizardStore } from '@/lib/hydro/context';

const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
function formatMonthEN(d: Date) {
  return formatter.format(d);
}

export default function StepConfirm() {
  const dispatch = useWizardDispatch();
  const stationId = useWizardStore((state) => state.stationId);
  const scannedFiles = useWizardStore((state) => state.scannedFiles);
  const selectedRange = useWizardStore((state) => state.selectedRange);
  const dateRange = useWizardStore((state) => state.dateRange);
  const [showConfirm, setShowConfirm] = useState(false);

  const validFiles = scannedFiles.filter((f) => f.parseError === null);
  const errorFiles = scannedFiles.filter((f) => f.parseError !== null);

  const targetRange = selectedRange || dateRange;
  const rangeText = targetRange
    ? `${formatMonthEN(targetRange.start)} – ${formatMonthEN(targetRange.end)}`
    : '';

  return (
    <div>
      <StationHeader stationId={stationId}>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">
            <strong className="font-semibold text-gray-900">{scannedFiles.length}</strong> files
            scanned
          </span>

          <span className="text-gray-300">·</span>

          <span className="text-emerald-600">
            <strong className="font-semibold">{validFiles.length}</strong> available
          </span>

          {errorFiles.length > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-red-500">
                <strong className="font-semibold">{errorFiles.length}</strong> errors
              </span>
            </>
          )}
        </div>
      </StationHeader>

      {/* Processing config card */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-linear-to-b from-blue-50 to-white px-6 py-8">
          <TimeRangePicker />
        </div>
      </div>

      {/* Cleaning rules note */}
      <div className="px-5 pt-5 pb-5">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">Cleaning Rules</p>
        <ul className="grid list-disc grid-cols-1 gap-x-6 gap-y-1.5 pl-5 text-xs text-gray-500 sm:grid-cols-2">
          <li>Missing or invalid readings → NaN</li>
          <li>Water level normalized to mm</li>
          <li>Timestamps converted to ISO 8601</li>
          <li>Encoding normalized to UTF-8</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          className="cursor-pointer rounded-md bg-white px-6 py-2 text-gray-700 shadow-md transition hover:bg-gray-50"
        >
          Back
        </button>
        <button
          disabled={validFiles.length === 0}
          onClick={() => setShowConfirm(true)}
          className="flex-1 cursor-pointer rounded-md bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-blue-700"
        >
          Clean
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-5 pt-6">
              <h3 className="text-center text-lg font-bold text-gray-900">Start processing?</h3>
              {targetRange && (
                <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-center text-sm text-gray-700">
                  <span className="font-medium">{stationId}</span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="font-medium">{rangeText}</span>
                </div>
              )}
              <p className="mt-2 text-center text-xs leading-relaxed text-gray-500">
                Station and time range cannot be changed after this step.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 bg-gray-50 px-5 py-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  if (!selectedRange && dateRange) {
                    dispatch({ type: 'SET_SELECTED_RANGE', payload: dateRange });
                  }
                  dispatch({ type: 'LOCK_SETTINGS' });
                  dispatch({ type: 'SET_STEP', payload: 3 });
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
