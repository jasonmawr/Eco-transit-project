/**
 * EcoTransit API Client Utilities
 */
export declare function getApiBaseUrl(): string;
/**
 * Standardized fetch helper for EcoTransit APIs
 */
export declare function apiFetch(path: string, options?: RequestInit): Promise<any>;
