import { apiRequest } from './apiClient';
import type { RestaurantConfig } from '../types';

export async function fetchRestaurantConfig(): Promise<RestaurantConfig> {
  const { data } = await apiRequest<{ data: RestaurantConfig }>('/restaurant');
  return data;
}
