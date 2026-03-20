import type { DetrendedRecord, HydroRecord } from '@/lib/hydro/types';

export interface DetrendResult {
  records: DetrendedRecord[];
  windowSize: number;
}

function normalizeWindowSize(size: number): number {
  const atLeastThree = Math.max(3, Math.floor(size));
  return atLeastThree % 2 === 0 ? atLeastThree + 1 : atLeastThree;
}

/** Binary search for insertion index in a sorted array */
function lowerBound(sorted: number[], val: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < val) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Sliding-window rolling median.
 * Maintains a sorted array with binary insertion/removal — O(n * w) total
 * instead of the naive O(n * w * log(w)) that re-sorts every window.
 */
export function rollingMedian(
  values: (number | null)[],
  windowSize: number,
): (number | null)[] {
  const n = values.length;
  if (n === 0) return [];

  const w = normalizeWindowSize(windowSize);
  const half = Math.floor(w / 2);
  const result: (number | null)[] = new Array(n);

  // Sorted array of non-null values in the current window
  const sorted: number[] = [];

  function insert(val: number) {
    sorted.splice(lowerBound(sorted, val), 0, val);
  }

  function remove(val: number) {
    const idx = lowerBound(sorted, val);
    if (idx < sorted.length && sorted[idx] === val) {
      sorted.splice(idx, 1);
    }
  }

  function getMedian(): number | null {
    const len = sorted.length;
    if (len === 0) return null;
    const mid = Math.floor(len / 2);
    return len % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // Build the initial window for index 0: [0, min(n-1, half)]
  for (let j = 0, end = Math.min(n - 1, half); j <= end; j++) {
    if (values[j] !== null) insert(values[j]!);
  }
  result[0] = getMedian();

  for (let i = 1; i < n; i++) {
    // The previous window was [max(0, i-1-half), min(n-1, i-1+half)]
    // The new window is      [max(0, i-half),   min(n-1, i+half)]

    // Remove the element leaving the left edge
    const prevStart = Math.max(0, (i - 1) - half);
    const newStart = Math.max(0, i - half);
    if (newStart > prevStart) {
      const leaving = values[prevStart];
      if (leaving !== null) remove(leaving);
    }

    // Add the element entering the right edge
    const prevEnd = Math.min(n - 1, (i - 1) + half);
    const newEnd = Math.min(n - 1, i + half);
    if (newEnd > prevEnd) {
      const entering = values[newEnd];
      if (entering !== null) insert(entering);
    }

    result[i] = getMedian();
  }

  return result;
}

export function getDetrendWindowSize(
  records: HydroRecord[],
  strategy: 'skip' | 'local' | 'full',
): number {
  if (strategy === 'skip') {
    return 0;
  }

  if (strategy === 'local') {
    return 720;
  }

  return normalizeWindowSize(records.length / 3);
}

export function applyDetrend(
  records: HydroRecord[],
  strategy: 'skip' | 'local' | 'full',
): DetrendResult {
  if (strategy === 'skip') {
    return {
      windowSize: 0,
      records: records.map((record) => ({
        ...record,
        detrended: record.waterLevel,
        baseline: null,
      })),
    };
  }

  const windowSize = getDetrendWindowSize(records, strategy);
  const baselines = rollingMedian(
    records.map((record) => record.waterLevel),
    windowSize,
  );

  return {
    windowSize,
    records: records.map((record, index) => {
      const baseline = baselines[index];

      return {
        ...record,
        baseline,
        detrended:
          record.waterLevel !== null && baseline !== null ? record.waterLevel - baseline : null,
      };
    }),
  };
}
