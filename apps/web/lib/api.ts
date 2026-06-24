/**
 * EcoTransit API Client Utilities
 */

export class ApiError extends Error {
  status?: number;
  code?: string;
  verificationEmailSent?: boolean;
  recoveryAvailable?: boolean;
  cooldownRemaining?: number;

  constructor(message: string, options?: { status?: number; code?: string; verificationEmailSent?: boolean; recoveryAvailable?: boolean; cooldownRemaining?: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.verificationEmailSent = options?.verificationEmailSent;
    this.recoveryAvailable = options?.recoveryAvailable;
    this.cooldownRemaining = options?.cooldownRemaining;
  }
}

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
    throw new ApiError('Không thể kết nối lúc này. Vui lòng thử lại sau.');
  }
  
  if (!res.ok) {
    let responseBodyText = '';
    try {
      responseBodyText = await res.text();
    } catch (_) {}

    let errorBody: any = null;
    if (responseBodyText) {
      try {
        errorBody = JSON.parse(responseBodyText);
      } catch (_) {}
    }

    // Suppress console diagnostics noise for expected unauthenticated GET /api/auth/me
    const isAuthMe = path === '/api/auth/me' || path === 'api/auth/me' || path === '/auth/me' || path === 'auth/me';
    const isProduction = process.env.NODE_ENV === 'production';
    const isExpectedAuthMailError = isProduction && (
      res.status === 429 ||
      (res.status === 401 && responseBodyText && (responseBodyText.includes('EMAIL_UNVERIFIED') || responseBodyText.includes('mật khẩu chưa đúng'))) ||
      (res.status === 503 && responseBodyText && (responseBodyText.includes('SMTP_NOT_CONFIGURED') || responseBodyText.includes('EMAIL_DELIVERY_UNAVAILABLE')))
    );
    if (!(res.status === 401 && isAuthMe) && !isExpectedAuthMailError) {
      console.warn(`[apiFetch HTTP Error Diagnostics] status=${res.status} body="${responseBodyText}"`);
    }

    // 1. Rate limit (429) is absolute priority to match public display contracts
    if (res.status === 429) {
      if (errorBody && errorBody.message && typeof errorBody.message === 'string') {
        const isTechnical = /API|debug|database|sql|prisma|error|undefined|null|nan|status|exception|stack|route|uuid|invalid/i.test(errorBody.message);
        if (!isTechnical) {
          throw new ApiError(errorBody.message, {
            status: 429,
            code: errorBody.code,
            verificationEmailSent: errorBody.verificationEmailSent,
            recoveryAvailable: errorBody.recoveryAvailable,
            cooldownRemaining: errorBody.cooldownRemaining,
          });
        }
      }
      throw new ApiError('Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.', { status: 429 });
    }

    // 2. Prioritize custom business/validation messages if they are not developer-facing technical messages
    if (errorBody && errorBody.message && typeof errorBody.message === 'string') {
      const isTechnical = /API|debug|database|sql|prisma|error|undefined|null|nan|status|exception|stack|route|uuid|invalid/i.test(errorBody.message);
      if (!isTechnical) {
        throw new ApiError(errorBody.message, {
          status: res.status,
          code: errorBody.code,
          verificationEmailSent: errorBody.verificationEmailSent,
          recoveryAvailable: errorBody.recoveryAvailable,
        });
      }
    }

    // 3. Direct status mapping for security/expiry gates
    if (res.status === 401) {
      throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', { status: 401 });
    }
    if (res.status === 403) {
      throw new ApiError('Bạn không có quyền thực hiện thao tác này.', { status: 403 });
    }

    // 4. General public fallback
    throw new ApiError('Có sự cố tạm thời. Vui lòng thử lại sau.');
  }

  return res.json();
}

