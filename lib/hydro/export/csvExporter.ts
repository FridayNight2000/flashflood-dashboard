/**
 * CSV export (cleaned + detrended)
 *
 * Output format:
 *   Timestamp,WaterLevel
 *   1998-01-01 01:00,
 *   1998-01-01 07:00,3.41
 */

import type { DetrendedRecord, HydroRecord } from '../types';
import { downloadTextFile } from '../utils/downloadFile';
import { formatTimestamp, formatYYYYMM } from '../utils/formatDate';

export function buildCleanedCsv(records: HydroRecord[]): string {
  const lines: string[] = ['Timestamp,WaterLevel'];
  for (const r of records) {
    const ts = formatTimestamp(r.dateTime);
    const wl = r.waterLevel !== null ? String(r.waterLevel) : '';
    lines.push(`${ts},${wl}`);
  }
  return lines.join('\r\n');
}

export function downloadCleanedCsv(
  records: HydroRecord[],
  stationId: string,
  range: { start: Date; end: Date },
): void {
  const csv = buildCleanedCsv(records);
  const filename = `${stationId}_cleaned_${formatYYYYMM(range.start)}_${formatYYYYMM(range.end)}.csv`;
  downloadTextFile(csv, filename, 'text/csv;charset=utf-8;', true);
}

export function buildDetrendedCsv(records: DetrendedRecord[]): string {
  const lines: string[] = ['Timestamp,WaterLevel,Detrended,Baseline'];
  for (const r of records) {
    const ts = formatTimestamp(r.dateTime);
    const wl = r.waterLevel !== null ? String(r.waterLevel) : '';
    const detrended = r.detrended !== null ? String(r.detrended) : '';
    const baseline = r.baseline !== null ? String(r.baseline) : '';
    lines.push(`${ts},${wl},${detrended},${baseline}`);
  }
  return lines.join('\r\n');
}

export function downloadDetrendedCsv(
  records: DetrendedRecord[],
  stationId: string,
  range: { start: Date; end: Date },
): void {
  const csv = buildDetrendedCsv(records);
  const filename = `${stationId}_detrended_${formatYYYYMM(range.start)}_${formatYYYYMM(range.end)}.csv`;
  downloadTextFile(csv, filename, 'text/csv;charset=utf-8;', true);
}
