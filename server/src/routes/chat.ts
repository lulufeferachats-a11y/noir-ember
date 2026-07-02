import { Router } from 'express';
import { z } from 'zod';
import { getOrCreateSession, saveSession } from '../services/conversationStore.js';
import { handleChatMessage } from '../services/conversationController.js';

const router = Router();

const chatRequestSchema = z.object({
  sessionId: z.string().min(1).max(100),
  message: z.string().trim().min(1, 'Message cannot be empty').max(500, 'Message is too long'),
});

/**
 * POST /chat
 * Single endpoint that drives the entire chatbot experience: intent
 * detection, FAQ answers, and the multi-step reservation flow, scoped to
 * the current restaurant tenant and the caller's conversation session.
 */
router.post('/', async (req, res, next) => {
  try {
    const { sessionId, message } = chatRequestSchema.parse(req.body);
    const restaurant = req.restaurant!;

    const state = getOrCreateSession(sessionId, restaurant.id);
    const response = await handleChatMessage(state, message, restaurant);
    saveSession(state);

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
