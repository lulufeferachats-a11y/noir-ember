import { Router } from 'express';
import {
  createReservation,
  listReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationStats,
} from '../services/reservationService.js';
import {
  createReservationSchema,
  updateReservationSchema,
  reservationIdParamSchema,
  listReservationsQuerySchema,
} from '../types/validation.js';

const router = Router();

/**
 * POST /reservations
 * Creates a reservation. Used by both the chatbot and any future manual
 * booking form.
 */
router.post('/', async (req, res, next) => {
  try {
    const input = createReservationSchema.parse(req.body);
    const restaurantId = req.restaurant!.id;
    const reservation = await createReservation(restaurantId, input);
    res.status(201).json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reservations
 * Lists reservations for the current restaurant, with optional filtering
 * by status/date and pagination. Powers the admin dashboard table.
 */
router.get('/', async (req, res, next) => {
  try {
    const query = listReservationsQuerySchema.parse(req.query);
    const restaurantId = req.restaurant!.id;
    const result = await listReservations(restaurantId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reservations/stats
 * Aggregate counts by status - used for the admin dashboard summary cards.
 * Declared before /:id so it isn't swallowed by the id route.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const restaurantId = req.restaurant!.id;
    const stats = await getReservationStats(restaurantId);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /reservations/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = reservationIdParamSchema.parse(req.params);
    const restaurantId = req.restaurant!.id;
    const reservation = await getReservationById(restaurantId, id);
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /reservations/:id
 * Partial update - used by the admin dashboard to confirm/cancel/edit.
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = reservationIdParamSchema.parse(req.params);
    const input = updateReservationSchema.parse(req.body);
    const restaurantId = req.restaurant!.id;
    const reservation = await updateReservation(restaurantId, id, input);
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /reservations/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = reservationIdParamSchema.parse(req.params);
    const restaurantId = req.restaurant!.id;
    await deleteReservation(restaurantId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
