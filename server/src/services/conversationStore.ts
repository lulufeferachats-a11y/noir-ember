import type { ConversationState } from '../types/chat.js';

/**
 * In-memory conversation store, keyed by sessionId.
 * Fine for a single-instance deployment; swap for Redis (or a `chat_sessions`
 * table) if the server ever scales horizontally, without changing the
 * conversationController's public interface.
 */
const sessions = new Map<string, ConversationState>();

export function getOrCreateSession(sessionId: string, restaurantId: string): ConversationState {
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const fresh: ConversationState = {
    sessionId,
    restaurantId,
    reservationActive: false,
    currentStep: null,
    draft: {},
    memory: {},
  };
  sessions.set(sessionId, fresh);
  return fresh;
}

export function saveSession(state: ConversationState): void {
  sessions.set(state.sessionId, state);
}

export function resetReservationFlow(state: ConversationState): void {
  state.reservationActive = false;
  state.currentStep = null;
  state.draft = {};
}
