import type { HydroRecord } from '@/lib/hydro/types';

export type SuggestedDetrendStrategy = 'skip' | 'local' | 'full';

export interface DetrendSuggestion {
  strategy: SuggestedDetrendStrategy;
  reason: string;
  dataSpanMonths: number;
}

export function suggestDetrendStrategy(dataSpanMonths: number): DetrendSuggestion {
  if (dataSpanMonths < 6) {
    return {
      strategy: 'skip',
      reason: 'Short data span — background drift is minimal, so detrending is not needed.',
      dataSpanMonths,
    };
  }

  if (dataSpanMonths < 24) {
    return {
      strategy: 'local',
      reason: 'Multi-season span — a shorter baseline is applied to reveal local fluctuations.',
      dataSpanMonths,
    };
  }

  return {
    strategy: 'full',
    reason: 'Spans over 2 years — a longer baseline is applied to highlight short-term changes.',
    dataSpanMonths,
  };
}

export function getDataSpanMonths(records: HydroRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  const timestamps = records
    .map((record) => record.dateTime?.getTime())
    .filter((value): value is number => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    return 0;
  }

  const start = new Date(timestamps[0]);
  const end = new Date(timestamps[timestamps.length - 1]);

  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}
