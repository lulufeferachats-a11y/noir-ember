import type { ChatIntent } from '../types/chat.js';
import type { Restaurant, RestaurantSettings } from '../db/schema.js';

/**
 * Builds a natural-language reply for a detected intent, drawing entirely
 * from the restaurant's `settings` jsonb - PARTIE 5 + PARTIE 10.
 * No restaurant-specific copy is hardcoded here, so this function works
 * unchanged for every tenant in the SaaS.
 */
export function buildIntentReply(intent: ChatIntent, restaurant: Restaurant): string {
  const settings = restaurant.settings as RestaurantSettings;

  switch (intent) {
    case 'greeting':
      return `Welcome to ${restaurant.name}. I'm your personal concierge - I can help with reservations, menu questions, hours, or anything else about your visit. How may I assist you?`;

    case 'hours': {
      const lines = settings.hours
        ?.map((h) => `${h.day}: ${h.closed ? 'Closed' : `${h.open} – ${h.close}`}`)
        .join('\n');
      return `Here are our opening hours:\n\n${lines}\n\nWould you like to reserve a table?`;
    }

    case 'address':
      return `We're located at ${restaurant.address}.${settings.parking ? ` ${settings.parking}` : ''} Would you like to make a reservation?`;

    case 'phone':
      return `You can reach us at ${restaurant.phone}. I can also handle your reservation right here in chat - shall we proceed?`;

    case 'menu': {
      if (!settings.menu?.length) {
        return `Our menu changes seasonally - I'd be happy to help you book a table to discover it. Shall we proceed?`;
      }
      const summary = settings.menu
        .map((cat) => `${cat.category}: ${cat.items.slice(0, 2).map((i) => i.name).join(', ')}...`)
        .join('\n');
      return `Here's a glimpse of our menu:\n\n${summary}\n\nWould you like to reserve a table to experience it?`;
    }

    case 'vegetarian':
      return settings.vegetarianInfo
        ? `${settings.vegetarianInfo} Shall I help you book a table?`
        : `We're happy to accommodate vegetarian preferences - please mention this when booking.`;

    case 'vegan':
      return settings.veganInfo
        ? `${settings.veganInfo} Would you like to make a reservation?`
        : `We're happy to accommodate vegan preferences - please mention this when booking.`;

    case 'allergies':
      return settings.allergyInfo
        ? `${settings.allergyInfo} Shall I arrange your reservation now?`
        : `Please mention any allergies when booking and our kitchen will take care of you.`;

    case 'dresscode':
      return settings.dressCode ?? `We recommend smart casual attire for your visit.`;

    case 'parking':
      return settings.parking
        ? `${settings.parking} May I help you reserve your table?`
        : `Please contact us directly for parking information.`;

    case 'terrace':
      return settings.terrace
        ? `${settings.terrace} Would you like to mention a seating preference when booking?`
        : `Please ask our team about terrace availability when you arrive.`;

    case 'private':
      return settings.privateEvents
        ? `${settings.privateEvents}`
        : `For private events, please contact us directly and our team will assist you.`;

    case 'wine':
      return settings.wineInfo
        ? `${settings.wineInfo} Shall I note a wine pairing preference for your reservation?`
        : `Our sommelier would be delighted to guide you through our wine list.`;

    case 'cocktails':
      return settings.cocktailInfo
        ? `${settings.cocktailInfo} Shall I arrange your visit?`
        : `Our bar team crafts a curated selection of signature cocktails.`;

    case 'desserts':
      return settings.dessertInfo
        ? `${settings.dessertInfo} Shall I reserve your table?`
        : `Our pastry team has a wonderful selection of desserts awaiting you.`;

    case 'prices':
      return `Pricing varies by dish and selection - our team can share full details when you arrive, or I can connect you directly: ${restaurant.phone}. Shall I help you make a reservation?`;

    case 'michelin':
      return settings.michelinInfo
        ? `${settings.michelinInfo} Shall I arrange your evening with us?`
        : `We take great pride in our culinary recognition. Would you like to reserve a table?`;

    case 'chef':
      return settings.chefInfo
        ? `${settings.chefInfo} Would you like to dine with us?`
        : `Our kitchen team is led by a passionate and experienced chef. Would you like to reserve a table?`;

    case 'thanks':
      return `It's our pleasure. Is there anything else I can help you with?`;

    case 'reservation':
      // Handled by the reservation flow controller, never rendered directly.
      return '';

    case 'fallback':
    default:
      return `Thank you for your question. Our team would be happy to assist you personally at ${restaurant.phone} or ${restaurant.email}. Or I can help you here - would you like to make a reservation, or is there something specific you'd like to know?`;
  }
}

/** Suggests relevant quick-reply chips after a given intent's answer. */
export function suggestQuickReplies(intent: ChatIntent): string[] {
  const alwaysOfferBooking: ChatIntent[] = [
    'hours', 'address', 'menu', 'vegetarian', 'vegan', 'allergies',
    'parking', 'wine', 'cocktails', 'desserts', 'michelin', 'chef',
  ];
  if (alwaysOfferBooking.includes(intent)) {
    return ['Make a reservation', 'Opening hours', 'Menu'];
  }
  if (intent === 'greeting') {
    return ['Book a table', 'Opening hours', 'Menu highlights'];
  }
  return [];
}
