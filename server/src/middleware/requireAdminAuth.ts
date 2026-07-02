import type { Request, Response, NextFunction } from 'express';

/**
 * Minimal shared-secret auth for the admin dashboard routes.
 * Sufficient for a single-restaurant MVP; swap for per-staff accounts +
 * JWT/session auth before onboarding multiple restaurant clients in production.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const username = req.header('x-admin-username');
  const password = req.header('x-admin-password');

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return res.status(500).json({ error: 'Admin credentials are not configured on the server.' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  next();
}
