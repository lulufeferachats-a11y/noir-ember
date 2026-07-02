import { useCallback, useRef, useState } from 'react';
import { sendChatMessage } from '../services/chatService';
import { getOrCreateSessionId } from '../utils/session';
import type { ChatMessage } from '../types';

interface UseChatbotResult {
  messages: ChatMessage[];
  quickReplies: string[];
  isTyping: boolean;
  isOpen: boolean;
  hasStarted: boolean;
  toggleChat: () => void;
  openChat: () => void;
  sendMessage: (text: string) => Promise<void>;
}

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Encapsulates all chatbot UI state: message history, typing indicator,
 * quick replies, and open/closed state - PARTIE 9 (UX) + PARTIE 1 (flow).
 */
export function useChatbot(restaurantName: string): UseChatbotResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hasStarted = useRef(false);
  const sessionId = useRef(getOrCreateSessionId());

  const pushMessage = useCallback((sender: ChatMessage['sender'], text: string) => {
    setMessages((prev) => [...prev, { id: makeId(), sender, text, timestamp: Date.now() }]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      pushMessage('user', trimmed);
      setQuickReplies([]);
      setIsTyping(true);

      try {
        const response = await sendChatMessage(sessionId.current, trimmed);
        setIsTyping(false);
        pushMessage('bot', response.reply);
        setQuickReplies(response.quickReplies ?? []);
      } catch {
        setIsTyping(false);
        pushMessage('bot', 'I apologize, something went wrong on my end. Please try again, or call us directly.');
      }
    },
    [pushMessage]
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    if (!hasStarted.current) {
      hasStarted.current = true;
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        pushMessage(
          'bot',
          `Welcome to ${restaurantName}.\n\nI'm your personal concierge, here to help with reservations, menu questions, or anything else about your visit.\n\nHow may I assist you?`
        );
        setQuickReplies(['Book a table', 'Opening hours', 'Menu highlights']);
      }, 600);
    }
  }, [pushMessage, restaurantName]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) openChat();
      return next;
    });
  }, [openChat]);

  return { messages, quickReplies, isTyping, isOpen, hasStarted: hasStarted.current, toggleChat, openChat, sendMessage };
}
