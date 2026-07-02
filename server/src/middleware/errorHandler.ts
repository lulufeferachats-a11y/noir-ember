import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ReservationNotFoundError } from '../services/reservationService.js';

/**
 * Centralized error handler - PARTIE 11 (Sécurité / gestion des erreurs).
 * Keeps route handlers free of repetitive try/catch boilerplate while
 * guaranteeing clean, consistent HTTP error responses.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof ReservationNotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
