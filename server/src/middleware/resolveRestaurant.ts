import type { Request, Response, NextFunction } from 'express';
import { getRestaurantBySlug, RestaurantNotFoundError } from '../services/restaurantService.js';
import type { Restaurant } from '../db/schema.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      restaurant?: Restaurant;
    }
  }
}

/**
 * Resolves the current restaurant tenant from the `x-restaurant-slug` header
 * (falling back to the RESTAURANT_SLUG env var for single-tenant deployments)
 * and attaches it to `req.restaurant`. Every reservation/chatbot route relies
 * on this to stay scoped to the correct restaurant - this is what makes the
 * same codebase sellable to multiple restaurants (PARTIE 10).
 */
export async function resolveRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = (req.header('x-restaurant-slug') || process.env.RESTAURANT_SLUG || '').trim();

    if (!slug) {
      return res.status(400).json({ error: 'Missing restaurant identifier (x-restaurant-slug header).' });
    }

    const restaurant = await getRestaurantBySlug(slug);
    req.restaurant = restaurant;
    next();
  } catch (err) {
    if (err instanceof RestaurantNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}
