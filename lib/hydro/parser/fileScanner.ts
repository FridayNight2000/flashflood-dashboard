import type { ScannedFile } from '../types';

// 只匹配 YYYYMMDD_YYYYMMDD.txt 格式
const DATE_RANGE_RE = /^(\d{4})(\d{2})(\d{2})_(\d{4})(\d{2})(\d{2})\.txt$/i;

function parseYMD(y: string, m: string, d: string): Date | null {
  const year = parseInt(y, 10);
  const month = parseInt(m, 10) - 1; // JS months are 0-indexed
  const day = parseInt(d, 10);
  const date = new Date(year, month, day);
  // Validate: ensure the date didn't overflow (e.g. month 13)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * 扫描文件列表，解析文件名中的双日期。
 * - 只保留 .txt 文件
 * - 文件名必须符合 YYYYMMDD_YYYYMMDD.txt 格式
 * - 不符合的记录 parseError，不丢弃
 * - 返回结果按 startDate 升序排列，解析失败的排在末尾
 */
export function scanFiles(files: File[]): ScannedFile[] {
  const txtFiles = files.filter((f) => /\.txt$/i.test(f.name));

  const scanned: ScannedFile[] = txtFiles.map((file) => {
    const match = DATE_RANGE_RE.exec(file.name);
    if (!match) {
      return {
        file,
        fileName: file.name,
        startDate: null,
        endDate: null,
        parseError: `文件名格式不符合 YYYYMMDD_YYYYMMDD.txt`,
      };
    }

    const [, y1, m1, d1, y2, m2, d2] = match;
    const startDate = parseYMD(y1, m1, d1);
    const endDate = parseYMD(y2, m2, d2);

    if (!startDate || !endDate) {
      return {
        file,
        fileName: file.name,
        startDate: null,
        endDate: null,
        parseError: `文件名包含无效日期`,
      };
    }

    if (startDate > endDate) {
      return {
        file,
        fileName: file.name,
        startDate: null,
        endDate: null,
        parseError: `起始日期晚于结束日期`,
      };
    }

    return {
      file,
      fileName: file.name,
      startDate,
      endDate,
      parseError: null,
    };
  });

  // 成功解析的按 startDate 升序，失败的放末尾
  return scanned.sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.getTime() - b.startDate.getTime();
    if (a.startDate) return -1;
    if (b.startDate) return 1;
    return 0;
  });
}

/**
 * 从扫描结果中提取整体日期范围。
 * 只考虑成功解析的文件（parseError === null）。
 * 返回所有文件中最早的 startDate 和最晚的 endDate。
 */
export function getDateRange(
  scanned: ScannedFile[],
): { start: Date; end: Date } | null {
  const valid = scanned.filter(
    (f): f is ScannedFile & { startDate: Date; endDate: Date } =>
      f.startDate !== null && f.endDate !== null,
  );

  if (valid.length === 0) return null;

  const start = valid.reduce(
    (min, f) => (f.startDate < min ? f.startDate : min),
    valid[0].startDate,
  );
  const end = valid.reduce(
    (max, f) => (f.endDate > max ? f.endDate : max),
    valid[0].endDate,
  );

  return { start, end };
}
