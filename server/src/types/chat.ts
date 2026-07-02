export type ChatIntent =
  | 'greeting'
  | 'reservation'
  | 'hours'
  | 'address'
  | 'phone'
  | 'menu'
  | 'vegetarian'
  | 'vegan'
  | 'allergies'
  | 'dresscode'
  | 'parking'
  | 'terrace'
  | 'private'
  | 'wine'
  | 'cocktails'
  | 'desserts'
  | 'prices'
  | 'michelin'
  | 'chef'
  | 'thanks'
  | 'fallback';

/** A single field collected during the reservation flow. */
export type ReservationFieldKey =
  | 'guests'
  | 'reservationDate'
  | 'reservationTime'
  | 'customerName'
  | 'phone'
  | 'email'
  | 'notes';

export interface ReservationDraft {
  guests?: number;
  reservationDate?: string;
  reservationTime?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

/**
 * Memory the chatbot retains across a single conversation - PARTIE 6.
 * Lets returning guests skip re-entering their name, phone, or email
 * if they start a second reservation in the same session.
 */
export interface ConversationMemory {
  customerName?: string;
  phone?: string;
  email?: string;
}

export interface ConversationState {
  sessionId: string;
  restaurantId: string;
  reservationActive: boolean;
  currentStep: ReservationFieldKey | null;
  draft: ReservationDraft;
  memory: ConversationMemory;
}

export interface ChatRequestBody {
  sessionId: string;
  message: string;
}

export interface ChatResponseBody {
  reply: string;
  quickReplies?: string[];
  reservationCompleted?: {
    id: number;
    customerName: string;
    guests: number;
    reservationDate: string;
    reservationTime: string;
  };
}
