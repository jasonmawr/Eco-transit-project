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

  // 2. Default fallback for local development (both client and SSR)
  return 'http://localhost:3001';
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
    let errorMessage = res.status === 429
      ? 'Vui lòng đợi 60 giây trước khi yêu cầu gửi lại email xác thực.'
      : `API error: ${res.status}`;
    try {
      const text = await res.text();
      console.log(`[apiFetch Debug] status=${res.status} body="${text}"`);
      try {
        const errorBody = JSON.parse(text);
        if (errorBody && errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (e: any) {
        console.log(`[apiFetch Debug] JSON parse error:`, e.message);
        if (text) {
          errorMessage = text;
        }
      }
    } catch (err: any) {
      console.log(`[apiFetch Debug] text read error:`, err.message);
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

