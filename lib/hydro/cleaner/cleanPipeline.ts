/**
 * Main cleaning pipeline
 *
 * For each file:
 *   1. Detect encoding + read text
 *   2. Parse lines + handle flags
 *   3. Filter by time range
 *   4. Merge, sort, deduplicate
 *   5. Accumulate statistics
 */

import { readFileAsText } from '../parser/encodingDetect';
import { parseTextFile } from '../parser/textParser';
import type { CleanStats, HydroRecord } from '../types';

export interface CleanResult {
  records: HydroRecord[];
  stats: CleanStats;
  log: string[];
}

/**
 * Core cleaning function
 * @param files          Files to process (already filtered to .txt/.tst)
 * @param selectedRange  User-selected time range
 * @param onProgress     Progress callback (0-100)
 */
export async function cleanFiles(
  files: File[],
  selectedRange: { start: Date; end: Date },
  onProgress?: (percent: number) => void,
): Promise<CleanResult> {
  const allRecords: HydroRecord[] = [];
  const log: string[] = [];

  let totalRows = 0;
  let validRows = 0;
  let tentativeCount = 0;
  let missingCount = 0;
  let closedCount = 0;
  let unregisteredCount = 0;
  let errorRows = 0;

  const rangeStart = selectedRange.start.getTime();
  const rangeEnd = selectedRange.end.getTime();

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi];
    onProgress?.(Math.round((fi / files.length) * 90));

    try {
      // 1. Detect encoding + read
      const text = await readFileAsText(file);

      // 2. Parse
      const { lines, errors, skippedLines } = parseTextFile(text);

      // 3. Filter by time range
      const inRange = lines.filter((l) => {
        const t = l.timestamp.getTime();
        return t >= rangeStart && t <= rangeEnd;
      });

      // Count parse errors only for lines whose timestamps fall within range,
      // plus errors that couldn't be parsed at all (they might be in range)
      const inRangeErrorCount = errors.length;

      log.push(
        `[${file.name}] Read OK: ${lines.length} data lines, ` +
        `${skippedLines} non-data lines skipped, ${errors.length} parse errors`,
      );

      // 4. Convert to HydroRecord
      for (const parsedLine of inRange) {
        totalRows++;

        const flag = parsedLine.qualityFlag;

        if (flag === '$') missingCount++;
        else if (flag === '#') closedCount++;
        else if (flag === '-') unregisteredCount++;
        else if (flag === '*') tentativeCount++;

        const isValid = parsedLine.waterLevel !== null;
        if (isValid) validRows++;

        allRecords.push({
          dateTime: parsedLine.timestamp,
          waterLevel: parsedLine.waterLevel,
          qualityFlag: flagToLabel(flag),
          year: parsedLine.timestamp.getFullYear(),
          month: parsedLine.timestamp.getMonth() + 1,
          day: parsedLine.timestamp.getDate(),
        });
      }

      errorRows += inRangeErrorCount;
      for (const err of errors) {
        log.push(`  ! Line ${err.lineNumber}: ${err.reason} -- ${err.raw.slice(0, 60)}`);
      }
    } catch (e) {
      log.push(`[${file.name}] Read failed: ${String(e)}`);
      errorRows++;
    }
  }

  onProgress?.(95);

  // 5. Sort by time
  allRecords.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // 6. Deduplicate by timestamp (keep last occurrence)
  const deduplicated = deduplicateRecords(allRecords);

  const duplicateCount = allRecords.length - deduplicated.length;
  if (duplicateCount > 0) {
    log.push(`Dedup: removed ${duplicateCount} duplicate timestamps (kept last)`);
  }

  const validRate = totalRows > 0 ? validRows / totalRows : 0;

  // 7. Calculate longest gap between valid rows
  let longestGapHours = 0;
  let lastValidTime = 0;

  for (const record of deduplicated) {
    if (record.waterLevel !== null) {
      if (lastValidTime > 0) {
        const gapHours = (record.dateTime.getTime() - lastValidTime) / (1000 * 60 * 60);
        if (gapHours > longestGapHours) {
          longestGapHours = gapHours;
        }
      }
      lastValidTime = record.dateTime.getTime();
    }
  }

  const stats: CleanStats = {
    totalRows,
    validRows,
    tentativeCount,
    missingCount,
    closedCount,
    unregisteredCount,
    errorRows,
    validRate,
    longestGapHours,
  };

  log.push(
    `\nDone: total ${totalRows}, valid ${validRows}, ` +
    `coverage ${(validRate * 100).toFixed(1)}%`,
  );

  onProgress?.(100);

  return { records: deduplicated, stats, log };
}

/** Deduplicate HydroRecord array by timestamp, keeping the last occurrence */
function deduplicateRecords(records: HydroRecord[]): HydroRecord[] {
  const map = new Map<number, HydroRecord>();
  for (const r of records) {
    map.set(r.dateTime.getTime(), r);
  }
  return Array.from(map.values());
}

/** Flag character -> Japanese label */
function flagToLabel(flag: string): string {
  switch (flag) {
    case '*': return '暫定値';
    case '$': return '欠測';
    case '#': return '閉局';
    case '-': return '未登録';
    default:  return '';
  }
}
