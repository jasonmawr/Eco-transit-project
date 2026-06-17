/**
 * EcoTransit API Client Utilities
 */

export function getApiBaseUrl(): string {
  // 1. Check if the environment variable is explicitly defined (prioritize BASE_URL)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.trim();
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.trim();
  }

  // 2. Fallback for local development when running in the browser as a safeguard
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    // If NEXT_PUBLIC_API_BASE_URL is missing but we are on localhost, still default to local Express port 3001
    // to guarantee backend communication if next.config rewrites are not loaded.
    return 'http://localhost:3001';
  }

  // 3. Relative URL fallback for production deploy (e.g., Vercel rewrites proxying /api/*)
  return '';
}

/**
 * Standardized fetch helper for EcoTransit APIs
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  };

  const res = await fetch(url, defaultOptions);
  
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${res.status}`);
  }

  return res.json();
}

