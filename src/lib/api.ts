const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.heartsignal.cloud'
    : 'http://localhost:8080';

const normalizedBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export function buildApiUrl(path: string) {
  console.log('Building API URL with base:', normalizedBaseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
  