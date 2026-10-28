export const API_URL = 'http://localhost:8080';

export function profileImageUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (/^(https?:|data:|blob:)/.test(path)) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
