import { useCallback, useEffect, useState } from 'react';
import { fetchRestaurantConfig } from '../services/restaurantService';
import type { RestaurantConfig } from '../types';

interface UseRestaurantResult {
  restaurant: RestaurantConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRestaurant(): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
  }, [tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { restaurant, loading, error, refetch };
}