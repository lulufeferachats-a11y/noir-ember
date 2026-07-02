const SESSION_KEY = 'noir-ember-chat-session';

/**
 * Returns a stable per-tab session id for the chatbot, generating one on
 * first use. Stored in-memory + sessionStorage so a page refresh keeps the
 * same conversation context server-side - PARTIE 6.
 */
export function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}
