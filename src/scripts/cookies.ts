export const LANG_COOKIE = 'df-lang';
export const THEME_COOKIE = 'df-theme';
const MAX_AGE = 60 * 60 * 24 * 365;

export function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeCookie(name: string, value: string): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
}
