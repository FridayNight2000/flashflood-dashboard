/**
 * Task 3.1 — 编码探测 + 文件读取
 * 支持 UTF-8 / Shift-JIS / EUC-JP
 * 使用纯 JS 启发式探测，不依赖外部库
 */

/**
 * 简单探测 ArrayBuffer 的文字编码。
 * 优先级: UTF-8 BOM → UTF-8 (heuristic) → EUC-JP → Shift-JIS
 */
function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // 1. UTF-8 BOM (EF BB BF)
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'UTF-8';
  }

  // 2. 扫描前 4096 字节做启发式判断
  const sampleLen = Math.min(bytes.length, 4096);
  let utf8Score = 0;
  let shiftJisScore = 0;
  let eucJpScore = 0;
  let i = 0;

  while (i < sampleLen) {
    const b = bytes[i];

    // --- UTF-8 判断：连续字节以 10xxxxxx 跟随 ---
    if (b >= 0xc2 && b <= 0xdf && i + 1 < sampleLen) {
      const b1 = bytes[i + 1];
      if (b1 >= 0x80 && b1 <= 0xbf) { utf8Score += 2; i += 2; continue; }
    }
    if (b >= 0xe0 && b <= 0xef && i + 2 < sampleLen) {
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      if (b1 >= 0x80 && b1 <= 0xbf && b2 >= 0x80 && b2 <= 0xbf) {
        utf8Score += 3; i += 3; continue;
      }
    }

    // --- Shift-JIS 判断 ---
    const isShiftJisLead =
      (b >= 0x81 && b <= 0x9f) || (b >= 0xe0 && b <= 0xfc);
    if (isShiftJisLead && i + 1 < sampleLen) {
      const b1 = bytes[i + 1];
      if ((b1 >= 0x40 && b1 <= 0x7e) || (b1 >= 0x80 && b1 <= 0xfc)) {
        shiftJisScore += 2; i += 2; continue;
      }
    }

    // --- EUC-JP 判断 ---
    if (b >= 0xa1 && b <= 0xfe && i + 1 < sampleLen) {
      const b1 = bytes[i + 1];
      if (b1 >= 0xa1 && b1 <= 0xfe) { eucJpScore += 2; i += 2; continue; }
    }
    // EUC-JP 半角カタカナ (SS2)
    if (b === 0x8e && i + 1 < sampleLen) {
      const b1 = bytes[i + 1];
      if (b1 >= 0xa1 && b1 <= 0xdf) { eucJpScore += 2; i += 2; continue; }
    }

    i++;
  }

  if (utf8Score > 0 && utf8Score >= shiftJisScore && utf8Score >= eucJpScore) {
    return 'UTF-8';
  }
  if (eucJpScore > shiftJisScore) {
    return 'EUC-JP';
  }
  if (shiftJisScore > 0) {
    return 'Shift_JIS';
  }

  // 默认 UTF-8
  return 'UTF-8';
}

/**
 * 读取 File 对象，自动探测编码并返回解码后的字符串。
 */
export async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const encoding = detectEncoding(buffer);
  try {
    const decoder = new TextDecoder(encoding, { fatal: false });
    return decoder.decode(buffer);
  } catch {
    // fallback: UTF-8
    const decoder = new TextDecoder('UTF-8', { fatal: false });
    return decoder.decode(buffer);
  }
}
