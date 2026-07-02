import { z } from 'zod';

/**
 * Validation schemas for the reservations API - PARTIE 11 (Sécurité).
 * Every field is validated and bounded to reject empty, malformed, or
 * abusive input before it ever reaches the database.
 */

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date');

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Time must be in HH:MM format');

const phoneString = z
  .string()
  .trim()
  .min(6, 'Phone number is too short')
  .max(30, 'Phone number is too long')
  .regex(/^[\d\s+()-]+$/, 'Phone number contains invalid characters');

export const createReservationSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  guests: z.coerce.number().int().min(1, 'At least 1 guest is required').max(50, 'For groups over 50, please contact us directly'),
  reservationDate: dateString,
  reservationTime: timeString,
  phone: phoneString,
  email: z.string().trim().email('Invalid email address').max(150).optional().or(z.literal('')),
  notes: z.string().trim().max(500, 'Notes must be under 500 characters').optional().or(z.literal('')),
  source: z.enum(['chatbot', 'manual', 'phone', 'walk-in']).optional().default('chatbot'),
});

export const updateReservationSchema = createReservationSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});

export const reservationIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid reservation id'),
});

export const listReservationsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  date: dateString.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;
