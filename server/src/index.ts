import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { resolveRestaurant } from './middleware/resolveRestaurant.js';
import { requireAdminAuth } from './middleware/requireAdminAuth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import restaurantRoutes from './routes/restaurant.js';
import reservationRoutes from './routes/reservations.js';
import chatRoutes from './routes/chat.js';
import adminAuthRoutes from './routes/adminAuth.js';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Global middleware ---
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

// Basic protection against abusive traffic on public-facing routes - PARTIE 11.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Health check (no tenant resolution needed) ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Admin auth is tenant-agnostic for now (single shared admin secret) ---
app.use('/api/admin', adminAuthRoutes);

// --- All other API routes are scoped to a restaurant tenant ---
app.use('/api/restaurant', resolveRestaurant, restaurantRoutes);
app.use('/api/chat', resolveRestaurant, chatRoutes);
// Admin-only: list/view/update/delete reservations (the chatbot creates
// reservations through the chat service directly, not through this route).
app.use('/api/reservations', resolveRestaurant, requireAdminAuth, reservationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Noir & Ember API listening on port ${PORT}`);
});
