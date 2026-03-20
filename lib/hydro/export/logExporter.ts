import type { CleanStats, DetrendedRecord } from '@/lib/hydro/types';
import { downloadTextFile } from '@/lib/hydro/utils/downloadFile';
import { formatDateTime, formatYearMonth, formatYYYYMM } from '@/lib/hydro/utils/formatDate';

export interface ProcessingLogInput {
  stationId: string;
  selectedRange: { start: Date; end: Date } | null;
  cleanStats: CleanStats | null;
  strategy: 'skip' | 'local' | 'full';
  windowSize: number;
  sourceCount: number;
  detrendedData: DetrendedRecord[];
}

export function generateProcessingLog(input: ProcessingLogInput): string {
  const {
    stationId,
    selectedRange,
    cleanStats,
    strategy,
    windowSize,
    sourceCount,
    detrendedData,
  } = input;

  const validDetrended = detrendedData.filter((record) => record.detrended !== null).length;
  const validBaseline = detrendedData.filter((record) => record.baseline !== null).length;
  const missingRows = detrendedData.filter((record) => record.waterLevel === null).length;

  return [
    'HydroPrep Processing Log',
    `GeneratedAt: ${formatDateTime(new Date())}`,
    `StationId: ${stationId || '-'}`,
    `SelectedRange: ${selectedRange ? `${formatYearMonth(selectedRange.start)} - ${formatYearMonth(selectedRange.end)}` : '-'}`,
    '',
    '[Cleaning]',
    `TotalRows: ${cleanStats?.totalRows ?? 0}`,
    `ValidRows: ${cleanStats?.validRows ?? 0}`,
    `TentativeRows: ${cleanStats?.tentativeCount ?? 0}`,
    `MissingRows: ${cleanStats?.missingCount ?? 0}`,
    `ClosedRows: ${cleanStats?.closedCount ?? 0}`,
    `UnregisteredRows: ${cleanStats?.unregisteredCount ?? 0}`,
    `ErrorRows: ${cleanStats?.errorRows ?? 0}`,
    `ValidRate: ${cleanStats ? cleanStats.validRate.toFixed(4) : '0.0000'}`,
    `LongestGapHours: ${cleanStats?.longestGapHours.toFixed(1) ?? 'NaN'}`,
    '',
    '[Detrend]',
    `Strategy: ${strategy}`,
    `WindowSize: ${windowSize}`,
    `SourceRecords: ${sourceCount}`,
    `DetrendedRecords: ${detrendedData.length}`,
    `ValidDetrended: ${validDetrended}`,
    `ValidBaseline: ${validBaseline}`,
    `NullWaterLevelRows: ${missingRows}`,
  ].join('\n');
}

export function downloadProcessingLog(
  input: ProcessingLogInput,
): void {
  const startStr = input.selectedRange ? formatYYYYMM(input.selectedRange.start) : 'unknown';
  const endStr = input.selectedRange ? formatYYYYMM(input.selectedRange.end) : 'unknown';
  const filename = `${input.stationId}_processing_${startStr}_${endStr}.log`;

  downloadTextFile(generateProcessingLog(input), filename, 'text/plain;charset=utf-8;');
}
