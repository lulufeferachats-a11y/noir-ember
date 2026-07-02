/**
 * Single place to configure which restaurant tenant this deployment serves.
 * To white-label this app for another client, change RESTAURANT_SLUG (or
 * better, set it via a build-time environment variable) - PARTIE 10.
 */
export const APP_CONFIG = {
  restaurantSlug: import.meta.env.VITE_RESTAURANT_SLUG || 'noir-and-ember',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
};
