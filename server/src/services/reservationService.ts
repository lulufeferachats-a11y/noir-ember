import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { reservations, type NewReservation } from '../db/schema.js';
import type { CreateReservationInput, UpdateReservationInput, ListReservationsQuery } from '../types/validation.js';

/**
 * Reservation service - all database access for reservations goes through
 * here so routes stay thin and the logic is reusable (e.g. from the chatbot
 * service, from a future admin API, from tests).
 */
export class ReservationNotFoundError extends Error {
  constructor(id: number) {
    super(`Reservation #${id} not found`);
    this.name = 'ReservationNotFoundError';
  }
}

export async function createReservation(restaurantId: string, input: CreateReservationInput) {
  const payload: NewReservation = {
    restaurantId,
    customerName: input.customerName,
    guests: input.guests,
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    phone: input.phone,
    email: input.email || null,
    notes: input.notes || null,
    source: input.source ?? 'chatbot',
  };

  const [created] = await db.insert(reservations).values(payload).returning();
  return created;
}

export async function listReservations(restaurantId: string, query: ListReservationsQuery) {
  const conditions = [eq(reservations.restaurantId, restaurantId)];

  if (query.status) {
    conditions.push(eq(reservations.status, query.status));
  }
  if (query.date) {
    conditions.push(eq(reservations.reservationDate, query.date));
  }

  const offset = (query.page - 1) * query.limit;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(reservations)
      .where(and(...conditions))
      .orderBy(desc(reservations.createdAt))
      .limit(query.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reservations)
      .where(and(...conditions)),
  ]);

  return {
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: totalResult[0]?.count ?? 0,
      totalPages: Math.ceil((totalResult[0]?.count ?? 0) / query.limit),
    },
  };
}

export async function getReservationById(restaurantId: string, id: number) {
  const [row] = await db
    .select()
    .from(reservations)
    .where(and(eq(reservations.id, id), eq(reservations.restaurantId, restaurantId)));

  if (!row) {
    throw new ReservationNotFoundError(id);
  }

  return row;
}

export async function updateReservation(restaurantId: string, id: number, input: UpdateReservationInput) {
  // Confirm it exists (and belongs to this restaurant) before attempting the update.
  await getReservationById(restaurantId, id);

  const updatePayload: Partial<NewReservation> = {
    ...(input.customerName !== undefined && { customerName: input.customerName }),
    ...(input.guests !== undefined && { guests: input.guests }),
    ...(input.reservationDate !== undefined && { reservationDate: input.reservationDate }),
    ...(input.reservationTime !== undefined && { reservationTime: input.reservationTime }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.email !== undefined && { email: input.email || null }),
    ...(input.notes !== undefined && { notes: input.notes || null }),
    ...(input.status !== undefined && { status: input.status }),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(reservations)
    .set(updatePayload)
    .where(and(eq(reservations.id, id), eq(reservations.restaurantId, restaurantId)))
    .returning();

  return updated;
}

export async function deleteReservation(restaurantId: string, id: number) {
  await getReservationById(restaurantId, id);

  await db
    .delete(reservations)
    .where(and(eq(reservations.id, id), eq(reservations.restaurantId, restaurantId)));
}
export async function checkAvailability(
  restaurantId: string,
  date: string,
  time: string,
  requestedGuests: number,
  maxCapacity: number,
  slotMinutes: number
): Promise<{ available: true } | { available: false; guestsBooked: number; maxCapacity: number }> {
  const [h, m] = time.split(':').map(Number);
  const slotStart = h * 60 + m - slotMinutes;
  const slotEnd = h * 60 + m + slotMinutes;

  const toTime = (totalMinutes: number) => {
    const clamped = Math.max(0, Math.min(1439, totalMinutes));
    return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
  };

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${reservations.guests}), 0)::int` })
    .from(reservations)
    .where(
      and(
        eq(reservations.restaurantId, restaurantId),
        eq(reservations.reservationDate, date),
        sql`${reservations.reservationTime} >= ${toTime(slotStart)}::time`,
        sql`${reservations.reservationTime} <= ${toTime(slotEnd)}::time`,
        sql`${reservations.status} != 'cancelled'`
      )
    );

  const guestsBooked = result[0]?.total ?? 0;

  if (guestsBooked + requestedGuests > maxCapacity) {
    return { available: false, guestsBooked, maxCapacity };
  }

  return { available: true };
}
export async function getReservationStats(restaurantId: string) {
  const rows = await db
    .select({
      status: reservations.status,
      count: sql<number>`count(*)::int`,
    })
    .from(reservations)
    .where(eq(reservations.restaurantId, restaurantId))
    .groupBy(reservations.status);

  const stats = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}
