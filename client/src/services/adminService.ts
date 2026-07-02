import { apiRequest } from './apiClient';
import type { Reservation, ReservationStats, ReservationStatus } from '../types';

export interface AdminCredentials {
  username: string;
  password: string;
}

export async function adminLogin(credentials: AdminCredentials): Promise<boolean> {
  try {
    await apiRequest<{ success: true }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchReservations(
  credentials: AdminCredentials,
  filters: { status?: ReservationStatus } = {}
): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  const query = params.toString() ? `?${params.toString()}` : '';

  const { data } = await apiRequest<{ data: Reservation[] }>(`/reservations${query}`, {
    adminAuth: credentials,
  });
  return data;
}

export async function fetchReservationStats(credentials: AdminCredentials): Promise<ReservationStats> {
  const { data } = await apiRequest<{ data: ReservationStats }>('/reservations/stats', {
    adminAuth: credentials,
  });
  return data;
}

export async function updateReservation(
  credentials: AdminCredentials,
  id: number,
  updates: Partial<Pick<Reservation, 'customerName' | 'guests' | 'reservationDate' | 'reservationTime' | 'phone' | 'email' | 'notes' | 'status'>>
): Promise<Reservation> {
  const { data } = await apiRequest<{ data: Reservation }>(`/reservations/${id}`, {
    method: 'PATCH',
    adminAuth: credentials,
    body: JSON.stringify(updates),
  });
  return data;
}

export async function deleteReservation(credentials: AdminCredentials, id: number): Promise<void> {
  await apiRequest<void>(`/reservations/${id}`, {
    method: 'DELETE',
    adminAuth: credentials,
  });
}
