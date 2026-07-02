import styles from './ChatMessage.module.css';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderText(text: string) {
  // Minimal markdown: **bold** only, line breaks preserved.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const time = new Date(message.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`${styles.msg} ${message.sender === 'user' ? styles.user : styles.bot}`}>
      <div className={styles.bubble}>{renderText(message.text)}</div>
      <div className={styles.time}>{time}</div>
    </div>
  );
}
