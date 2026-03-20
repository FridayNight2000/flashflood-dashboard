'use client';

import { useState } from 'react';

import { useWizardContext } from '@/lib/hydro/context';

function toMonthValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fromMonthValue(s: string): Date {
  const [y, m] = s.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export default function TimeRangePicker() {
  const { state, dispatch } = useWizardContext();
  const { dateRange } = state;

  // Derive initial values directly from dateRange (no effect needed)
  const initialStart = dateRange ? toMonthValue(dateRange.start) : '';
  const initialEnd = dateRange ? toMonthValue(dateRange.end) : '';

  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [error, setError] = useState<string | null>(null);

  if (!dateRange) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-400">
        无可用日期范围
      </div>
    );
  }

  const minMonth = toMonthValue(dateRange.start);
  const maxMonth = toMonthValue(dateRange.end);

  function handleChange(newStart: string, newEnd: string) {
    setStart(newStart);
    setEnd(newEnd);
    if (!newStart || !newEnd) return;
    const s = fromMonthValue(newStart);
    const e = fromMonthValue(newEnd);
    if (s > e) {
      setError('From month cannot be later than To month');
      return;
    }
    setError(null);
    dispatch({ type: 'SET_SELECTED_RANGE', payload: { start: s, end: e } });
  }

  return (
    <div className="space-y-4">
      {/* Title + scanned range reference */}
      {/* <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-700">时间段</p>
      </div> */}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500">From</label>
          <input
            type="month"
            value={start}
            min={minMonth}
            max={maxMonth}
            onChange={(e) => handleChange(e.target.value, end)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <span className="mb-2.5 text-gray-400">→</span>

        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500">To</label>
          <input
            type="month"
            value={end}
            min={minMonth}
            max={maxMonth}
            onChange={(e) => handleChange(start, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
