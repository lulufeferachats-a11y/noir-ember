import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy server/.env.example to server/.env and configure your PostgreSQL connection.'
  );
}

// `max: 1` keeps the pool small for local dev / serverless; raise it for production traffic.
const queryClient = postgres(connectionString, { max: 10 });

export const db = drizzle(queryClient, { schema });

export type DbClient = typeof db;
