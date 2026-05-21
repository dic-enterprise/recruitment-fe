/** Extensions browsers can render inline without a separate viewer (must match api-contract.md). */
const BROWSER_PREVIEW_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'txt',
]);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

/** Public preview URL — no Bearer token; browser opens directly. */
export function getCvPreviewUrl(candidateId: string | number): string {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/candidates/${candidateId}/cv/preview`;
}

export function isCvBrowserPreviewable(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return BROWSER_PREVIEW_EXTENSIONS.has(ext);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
