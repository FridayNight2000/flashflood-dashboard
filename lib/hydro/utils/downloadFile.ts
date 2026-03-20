/**
 * Trigger a browser file download.
 * @param content   File content string
 * @param filename  Download filename
 * @param mimeType  MIME type string
 * @param bom       Whether to prepend UTF-8 BOM (useful for CSV opened in Excel)
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
  bom = false,
): void {
  const blob = new Blob([bom ? '\uFEFF' + content : content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
