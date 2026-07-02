import type { ChatIntent } from '../types/chat.js';

/**
 * Lightweight keyword-based intent detection - PARTIE 5.
 * Deliberately simple and dependency-free so it runs instantly with no
 * external API calls. Swappable later for an LLM-based classifier behind
 * the same `detectIntent` signature.
 */
const INTENT_PATTERNS: Array<{ intent: ChatIntent; pattern: RegExp }> = [
  { intent: 'reservation', pattern: /\b(book|reserv|reservation|table for|dine|seat|dining|want to reserve|want to book)\b/i },
  { intent: 'hours', pattern: /\b(hour|open|close|when are you|schedule)\b/i },
  { intent: 'address', pattern: /\b(address|where (are|is)|location|find you|directions?|map|metro)\b/i },
  { intent: 'phone', pattern: /\b(phone|call you|number|contact|tel\.?)\b/i },
  { intent: 'vegetarian', pattern: /\b(vegetarian|veggie)\b/i },
  { intent: 'vegan', pattern: /\bvegan\b/i },
  { intent: 'allergies', pattern: /\b(allerg|intoleran|gluten|nut[- ]?free|dairy[- ]?free|shellfish)\b/i },
  { intent: 'dresscode', pattern: /\b(dress code|attire|what to wear|smart casual|formal)\b/i },
  { intent: 'parking', pattern: /\b(park(ing)?|valet)\b/i },
  { intent: 'terrace', pattern: /\b(terrace|outdoor|outside seating|garden|patio)\b/i },
  { intent: 'private', pattern: /\b(private (event|dining)|group booking|corporate|celebrat|birthday party|wedding)\b/i },
  { intent: 'wine', pattern: /\b(wine|sommelier|cellar|bottle list|champagne|bordeaux|burgundy)\b/i },
  { intent: 'cocktails', pattern: /\b(cocktail|mixolog|aperitif|bar menu)\b/i },
  { intent: 'desserts', pattern: /\b(dessert|sweet|chocolate|patisserie|pastry)\b/i },
  { intent: 'menu', pattern: /\b(menu|food|dish(es)?|cuisine|starter|main course|tasting menu)\b/i },
  { intent: 'prices', pattern: /\b(price|cost|expensive|how much|budget)\b/i },
  { intent: 'michelin', pattern: /\b(michelin|star(red)?|award|recognition)\b/i },
  { intent: 'chef', pattern: /\b(chef|kitchen team|who cooks)\b/i },
  { intent: 'thanks', pattern: /\b(thank|merci|much appreciated|great, thanks)\b/i },
  { intent: 'greeting', pattern: /\b(hello|hi|hey|good (morning|evening|afternoon)|bonjour)\b/i },
];

export function detectIntent(message: string): ChatIntent {
  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(message)) {
      return intent;
    }
  }
  return 'fallback';
}
