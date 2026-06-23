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

  let res: Response;
  try {
    res = await fetch(url, defaultOptions);
  } catch (netErr: any) {
    console.error('[apiFetch Network Error Diagnostics]:', netErr);
    throw new Error('Không thể kết nối lúc này. Vui lòng thử lại sau.');
  }
  
  if (!res.ok) {
    let responseBodyText = '';
    try {
      responseBodyText = await res.text();
    } catch (_) {}

    console.warn(`[apiFetch HTTP Error Diagnostics] status=${res.status} body="${responseBodyText}"`);

    // 1. Direct status mapping for security/expiry gates
    if (res.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    if (res.status === 403) {
      throw new Error('Bạn không có quyền thực hiện thao tác này.');
    }
    if (res.status === 429) {
      throw new Error('Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.');
    }

    // 2. Parse custom business messages (e.g. form verification errors) without technical leakage
    if (responseBodyText) {
      try {
        const errorBody = JSON.parse(responseBodyText);
        if (errorBody && errorBody.message && typeof errorBody.message === 'string') {
          // Reject technical messages containing developer jargon
          const isTechnical = /API|debug|database|sql|prisma|error|undefined|null|nan|status|exception|stack|route|uuid|invalid/i.test(errorBody.message);
          if (!isTechnical) {
            throw new Error(errorBody.message);
          }
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('JSON') && err.message !== 'Unexpected token') {
          throw err;
        }
      }
    }

    // 3. General public fallback
    throw new Error('Có sự cố tạm thời. Vui lòng thử lại sau.');
  }

  return res.json();
}

