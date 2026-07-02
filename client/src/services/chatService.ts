import { apiRequest } from './apiClient';
import type { ChatResponse } from '../types';

export async function sendChatMessage(sessionId: string, message: string): Promise<ChatResponse> {
  return apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
  });
}
