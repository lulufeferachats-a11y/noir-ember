export interface RestaurantHour {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  tags?: string[];
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface RestaurantSettings {
  hours: RestaurantHour[];
  parking?: string;
  terrace?: string;
  dressCode?: string;
  privateEvents?: string;
  vegetarianInfo?: string;
  veganInfo?: string;
  allergyInfo?: string;
  wineInfo?: string;
  cocktailInfo?: string;
  dessertInfo?: string;
  michelinInfo?: string;
  chefInfo?: string;
  faq?: FaqEntry[];
  menu?: MenuCategory[];
}

export interface RestaurantConfig {
  slug: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  settings: RestaurantSettings;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: ReservationStatus;
  source: string;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface ChatResponse {
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
