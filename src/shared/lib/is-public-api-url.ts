export function isPublicApiUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/cv/preview');
}
