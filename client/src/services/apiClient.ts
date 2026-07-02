import { APP_CONFIG } from '../config/app';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  adminAuth?: { username: string; password: string };
}

/**
 * Thin fetch wrapper that attaches the restaurant tenant header on every
 * request, parses JSON, and normalizes errors - keeps every service file
 * free of repeated boilerplate.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { adminAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-restaurant-slug': APP_CONFIG.restaurantSlug,
    ...(headers as Record<string, string>),
  };

  if (adminAuth) {
    finalHeaders['x-admin-username'] = adminAuth.username;
    finalHeaders['x-admin-password'] = adminAuth.password;
  }

  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, body.error || 'Something went wrong. Please try again.');
  }

  return body as T;
}
