import { useCallback, useState } from 'react';
import {
  adminLogin,
  deleteReservation as deleteReservationApi,
  fetchReservations,
  fetchReservationStats,
  updateReservation as updateReservationApi,
  type AdminCredentials,
} from '../services/adminService';
import type { Reservation, ReservationStats, ReservationStatus } from '../types';

interface UseAdminResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  reservations: Reservation[];
  stats: ReservationStats | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: (status?: ReservationStatus) => Promise<void>;
  updateStatus: (id: number, status: ReservationStatus) => Promise<void>;
  saveReservation: (id: number, updates: Partial<Reservation>) => Promise<void>;
  removeReservation: (id: number) => Promise<void>;
}

/** Centralizes admin auth state and reservation CRUD for the dashboard. */
export function useAdmin(): UseAdminResult {
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);

  const refresh = useCallback(
    async (status?: ReservationStatus) => {
      if (!credentials) return;
      setIsLoading(true);
      setError(null);
      try {
        const [res, statResult] = await Promise.all([
          fetchReservations(credentials, status ? { status } : {}),
          fetchReservationStats(credentials),
        ]);
        setReservations(res);
        setStats(statResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations.');
      } finally {
        setIsLoading(false);
      }
    },
    [credentials]
  );

  const login = useCallback(async (username: string, password: string) => {
    const ok = await adminLogin({ username, password });
    if (ok) {
      setCredentials({ username, password });
    } else {
      setError('Invalid credentials.');
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
    setReservations([]);
    setStats(null);
  }, []);

  const updateStatus = useCallback(
    async (id: number, status: ReservationStatus) => {
      if (!credentials) return;
      await updateReservationApi(credentials, id, { status });
      await refresh();
    },
    [credentials, refresh]
  );

  const saveReservation = useCallback(
    async (id: number, updates: Partial<Reservation>) => {
      if (!credentials) return;
      await updateReservationApi(credentials, id, updates);
      await refresh();
    },
    [credentials, refresh]
  );

  const removeReservation = useCallback(
    async (id: number) => {
      if (!credentials) return;
      await deleteReservationApi(credentials, id);
      await refresh();
    },
    [credentials, refresh]
  );

  return {
    isAuthenticated: credentials !== null,
    isLoading,
    error,
    reservations,
    stats,
    login,
    logout,
    refresh,
    updateStatus,
    saveReservation,
    removeReservation,
  };
}
