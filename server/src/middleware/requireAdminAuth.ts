import type { Request, Response, NextFunction } from 'express';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const username = req.header('x-admin-username');
  const password = req.header('x-admin-password');

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    res.status(500).json({ error: 'Admin credentials are not configured on the server.' });
    return;
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    res.status(401).json({ error: 'Invalid admin credentials.' });
    return;
  }

  next();
}
