const RESOURCE_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
const DIFFICULTY = /^(EASY|MEDIUM|HARD)$/;

export function normalizeResourceCode(code: string | undefined): string | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return RESOURCE_CODE.test(normalized) ? normalized : null;
}

export function isValidDifficulty(value: string | undefined): value is 'EASY' | 'MEDIUM' | 'HARD' {
  return !!value && DIFFICULTY.test(value);
}

export function buildAppUrl(path: string): string {
  const origin = window.location.origin;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${cleanPath}`;
}

export function assertSameOriginUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      throw new Error('External URLs are not allowed');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}
