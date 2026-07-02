import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  date,
  time,
  pgEnum,
  uuid,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Reservation status lifecycle.
 * pending    -> just created by the chatbot or a guest, awaiting staff confirmation
 * confirmed  -> staff confirmed the booking
 * cancelled  -> cancelled by staff or guest
 */
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'confirmed',
  'cancelled',
]);

/**
 * restaurants table.
 * Each row represents one tenant in the multi-restaurant SaaS.
 * All restaurant-specific content (name, hours, menu, branding) lives here
 * so the chatbot and UI never need code changes to onboard a new client -
 * see PARTIE 10 of the spec ("préparer le SaaS").
 */
export const restaurants = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 20 }).default('#C9A96E'),
  secondaryColor: varchar('secondary_color', { length: 20 }).default('#0A0A0A'),
  // Free-form structured content the chatbot draws from: hours, FAQ, menu highlights, policies.
  // Keeping this in jsonb means new restaurants can be onboarded with zero code changes.
  settings: jsonb('settings').$type<RestaurantSettings>().notNull().default({} as RestaurantSettings),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * reservations table — PARTIE 2 of the spec.
 * Scoped to a restaurant via restaurantId so the same schema serves every tenant.
 */
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  customerName: varchar('customer_name', { length: 150 }).notNull(),
  guests: integer('guests').notNull(),
  reservationDate: date('reservation_date').notNull(),
  reservationTime: time('reservation_time').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 150 }),
  notes: text('notes'),
  status: reservationStatusEnum('status').notNull().default('pending'),
  // Where the booking originated - useful analytics once the SaaS has multiple intake channels.
  source: varchar('source', { length: 30 }).notNull().default('chatbot'),
});

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [reservations.restaurantId],
    references: [restaurants.id],
  }),
}));

/**
 * Shape of the `settings` jsonb column on restaurants.
 * This is what lets the chatbot answer FAQ-style questions (hours, parking,
 * dress code, etc.) per-tenant without ever touching the chatbot's code -
 * see PARTIE 10.
 */
export interface RestaurantSettings {
  hours: {
    day: string; // e.g. "Monday" or "Tuesday–Thursday"
    open: string | null; // e.g. "19:00", null if closed
    close: string | null;
    closed: boolean;
  }[];
  parking?: string;
  terrace?: string;
  dressCode?: string;
  privateEvents?: string;
  vegetarianInfo?: string;
  veganInfo?: string;
  allergyInfo?: string;
  wineInfo?: string;
  cocktailInfo?: string;
  dessertInfo?: string;
  michelinInfo?: string;
  chefInfo?: string;
  faq?: { question: string; answer: string }[];
  maxCapacityPerSlot?: number;
  slotDurationMinutes?: number;
  menu?: {
    category: string;
    items: { name: string; description: string; price: string; tags?: string[] }[];
  }[];
}

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
