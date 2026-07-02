import { useEffect, useRef, useState } from 'react';
import styles from './Chatbot.module.css';
import { ChatMessage } from './ChatMessage';
import { useChatbot } from '../hooks/useChatbot';

interface ChatbotProps {
  restaurantName: string;
  isOpen: boolean;
  onToggle: () => void;
  onSendRef?: (send: (text: string) => void) => void;
}

export function Chatbot({ restaurantName, isOpen, onToggle, onSendRef }: ChatbotProps) {
  const { messages, quickReplies, isTyping, sendMessage } = useChatbot(restaurantName);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    onSendRef?.(sendMessage);
  }, [onSendRef, sendMessage]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <>
      <button className={styles.trigger} onClick={onToggle} aria-label="Open chat">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <div className={`${styles.bubble} ${isOpen ? styles.open : ''}`} role="dialog" aria-label="Chat with us" aria-hidden={!isOpen}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{restaurantName.replace(/[a-z &]/gi, '').slice(0, 2) || 'N&'}</div>
            <div className={styles.headerInfo}>
              <h4>{restaurantName}</h4>
              <p>Concierge · Always available</p>
            </div>
          </div>
          <button className={styles.close} onClick={onToggle} aria-label="Close chat">✕</button>
        </div>

        <div className={styles.messages}>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isTyping && (
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {quickReplies.length > 0 && (
          <div className={styles.quickReplies}>
            {quickReplies.map((qr) => (
              <button key={qr} className={styles.qrBtn} onClick={() => sendMessage(qr)}>
                {qr}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Ask anything…"
            value={inputValue}
            maxLength={500}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.send} onClick={handleSubmit} aria-label="Send message">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
