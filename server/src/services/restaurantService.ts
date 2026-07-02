import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { restaurants } from '../db/schema.js';

export class RestaurantNotFoundError extends Error {
  constructor(slug: string) {
    super(`Restaurant "${slug}" not found or inactive`);
    this.name = 'RestaurantNotFoundError';
  }
}

/**
 * Loads a restaurant's full config by slug. This is the single lookup that
 * makes the SaaS model work: every other request (chatbot, reservations,
 * admin dashboard) is scoped to the restaurant resolved here.
 */
export async function getRestaurantBySlug(slug: string) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, slug));

  if (!restaurant || !restaurant.isActive) {
    throw new RestaurantNotFoundError(slug);
  }

  return restaurant;
}

export async function getRestaurantById(id: string) {
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
  if (!restaurant) {
    throw new Error(`Restaurant with id ${id} not found`);
  }
  return restaurant;
}
