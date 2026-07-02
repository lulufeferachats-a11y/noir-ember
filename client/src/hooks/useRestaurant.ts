import { useEffect, useState } from 'react';
import { fetchRestaurantConfig } from '../services/restaurantService';
import type { RestaurantConfig } from '../types';

interface UseRestaurantResult {
  restaurant: RestaurantConfig | null;
  loading: boolean;
  error: string | null;
}

/** Loads the current tenant's public config once on mount. */
export function useRestaurant(): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchRestaurantConfig()
      .then((data) => {
        if (!cancelled) setRestaurant(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load restaurant data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { restaurant, loading, error };
}
