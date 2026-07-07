export type Language = 'en' | 'fr';

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

export interface ConversationMemory {
  customerName?: string;
  phone?: string;
  email?: string;
}

export interface ConversationState {
  sessionId: string;
  restaurantId: string;
  reservationActive: boolean;
  language: Language | null;
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