/**
 * TXT line-by-line parser + flag handling
 *
 * Real file format (comma-separated):
 *   1998/01/01,01:00,-9999.99,$    -> flag=$  -> waterLevel=null
 *   1998/01/01,07:00,3.41,         -> no flag -> waterLevel=3.41
 *   2002/06/30,12:00,-             -> flag=-  -> waterLevel=null
 *   2002/07/01,12:00,1.55,*        -> flag=*  -> waterLevel=1.55 (kept)
 *   1998/01/01,24:00,-9999.99,$    -> 24:00   -> next day 00:00
 */

/** Flags that set waterLevel=null */
const SKIP_FLAGS = new Set(['$', '#', '-']);
/** Tentative flag: keep the numeric value */
const TENTATIVE_FLAG = '*';

/** Data lines must start with a 4-digit date */
const DATA_LINE_RE = /^\d{4}\/\d{2}\/\d{2},/;

export interface ParsedLine {
  timestamp: Date;
  waterLevel: number | null;
  qualityFlag: string;  // '' | '*' | '$' | '#' | '-'
  rawLine: string;
  lineNumber: number;
}

export interface ParseError {
  lineNumber: number;
  raw: string;
  reason: string;
}

export interface ParseResult {
  lines: ParsedLine[];
  errors: ParseError[];
  skippedLines: number;
}

/**
 * Merge date string "YYYY/MM/DD" and time string "HH:MM" into a Date.
 * Special: 24:00 -> next day 00:00.
 */
function parseTimestamp(dateStr: string, timeStr: string): Date | null {
  const dateParts = dateStr.split('/');
  if (dateParts.length !== 3) return null;
  const [y, mo, d] = dateParts.map(Number);

  const timeParts = timeStr.trim().split(':');
  if (timeParts.length !== 2) return null;
  const [h, m] = timeParts.map(Number);

  if (isNaN(y) || isNaN(mo) || isNaN(d) || isNaN(h) || isNaN(m)) return null;

  let date: Date;
  if (h === 24) {
    date = new Date(y, mo - 1, d + 1, 0, m, 0, 0);
  } else {
    date = new Date(y, mo - 1, d, h, m, 0, 0);
  }

  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Parse an entire text file content.
 * Returns parsed lines, error lines, and count of skipped non-data lines.
 */
export function parseTextFile(text: string): ParseResult {
  const rawLines = text.split(/\r?\n/);
  const lines: ParsedLine[] = [];
  const errors: ParseError[] = [];
  let skippedLines = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Skip blank lines
    if (trimmed === '') {
      skippedLines++;
      continue;
    }

    // Skip non-data lines (headers, comments, etc.)
    if (!DATA_LINE_RE.test(trimmed)) {
      skippedLines++;
      continue;
    }

    const parts = trimmed.split(',');
    if (parts.length < 2) {
      errors.push({ lineNumber: i + 1, raw: rawLine, reason: '列数不足' });
      continue;
    }

    const dateStr = parts[0].trim();
    const timeStr = parts[1].trim();

    const timestamp = parseTimestamp(dateStr, timeStr);
    if (!timestamp) {
      errors.push({ lineNumber: i + 1, raw: rawLine, reason: '时间戳解析失败' });
      continue;
    }

    // Determine flag from the last non-empty part
    const nonEmptyParts = parts.map(p => p.trim()).filter(p => p !== '');
    const lastPart = nonEmptyParts[nonEmptyParts.length - 1] ?? '';

    let qualityFlag = '';
    let waterLevel: number | null = null;

    if (SKIP_FLAGS.has(lastPart)) {
      qualityFlag = lastPart;
      waterLevel = null;
    } else if (lastPart === TENTATIVE_FLAG) {
      qualityFlag = TENTATIVE_FLAG;
      const valueStr = nonEmptyParts.length >= 2 ? nonEmptyParts[nonEmptyParts.length - 2] : '';
      const val = parseFloat(valueStr);
      if (isNaN(val)) {
        errors.push({ lineNumber: i + 1, raw: rawLine, reason: `暫定値行数值解析失败: "${valueStr}"` });
        continue;
      }
      waterLevel = val;
    } else {
      const val = parseFloat(lastPart);
      if (isNaN(val)) {
        errors.push({ lineNumber: i + 1, raw: rawLine, reason: `数值解析失败: "${lastPart}"` });
        continue;
      }
      qualityFlag = '';
      waterLevel = val;
    }

    lines.push({
      timestamp,
      waterLevel,
      qualityFlag,
      rawLine,
      lineNumber: i + 1,
    });
  }

  return { lines, errors, skippedLines };
}
