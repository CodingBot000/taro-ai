const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sajutok.com'
    : 'http://localhost:8080';

const normalizedBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
