import type { Request, Response, NextFunction } from 'express';
import { getRestaurantBySlug, RestaurantNotFoundError } from '../services/restaurantService.js';
import type { Restaurant } from '../db/schema.js';

declare global {
  namespace Express {
    interface Request {
      restaurant?: Restaurant;
    }
  }
}

export async function resolveRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = (req.header('x-restaurant-slug') || process.env.RESTAURANT_SLUG || '').trim();

    if (!slug) {
      res.status(400).json({ error: 'Missing restaurant identifier (x-restaurant-slug header).' });
      return;
    }

    const restaurant = await getRestaurantBySlug(slug);
    req.restaurant = restaurant;
    next();
  } catch (err) {
    if (err instanceof RestaurantNotFoundError) {
      res.status(404).json({ error: (err as Error).message });
      return;
    }
    next(err);
  }
}
