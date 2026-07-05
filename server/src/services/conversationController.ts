import type { Restaurant } from '../db/schema.js';
import type {
  ChatResponseBody,
  ConversationState,
  ReservationFieldKey,
} from '../types/chat.js';
import { detectIntent } from './intentDetection.js';
import { buildIntentReply, suggestQuickReplies } from './chatResponses.js';
import { parseNaturalDate, parseNaturalTime } from '../utils/naturalLanguageParsers.js';
import { createReservation, checkAvailability } from './reservationService.js';
import { createReservationSchema } from '../types/validation.js';
import { resetReservationFlow } from './conversationStore.js';

const RESERVATION_STEPS: Array<{
  key: ReservationFieldKey;
  optional: boolean;
  question: (state: ConversationState) => string;
  parse: (raw: string) => { value: string | number; error?: undefined } | { value?: undefined; error: string };
}> = [
  {
    key: 'guests',
    optional: false,
    question: () => 'How many guests will be joining you?',
    parse: (raw) => {
      const n = parseInt(raw.trim(), 10);
      if (Number.isNaN(n) || n < 1 || n > 50) {
        return { error: 'Please enter a valid number of guests (1 to 50).' };
      }
      return { value: n };
    },
  },
  {
    key: 'reservationDate',
    optional: false,
    question: () => 'What date would you like to reserve? (e.g. "February 15, 2025")',
    parse: (raw) => {
      const parsed = parseNaturalDate(raw);
      if (!parsed) return { error: 'I didn\'t catch that date. Try a format like "February 15, 2025" or "15/02/2025".' };
      return { value: parsed };
    },
  },
  {
    key: 'reservationTime',
    optional: false,
    question: () => 'What time would you prefer? (e.g. "7:30 PM")',
    parse: (raw) => {
      const parsed = parseNaturalTime(raw);
      if (!parsed) return { error: 'Could you share the time like "7:30 PM" or "20:00"?' };
      return { value: parsed };
    },
  },
  {
    key: 'customerName',
    optional: false,
    question: (state) => state.memory.customerName
      ? `Shall I use the name "${state.memory.customerName}" again, or would you like to use a different name?`
      : 'What name shall I put the reservation under?',
    parse: (raw) => {
      const v = raw.trim();
      if (v.length < 2) return { error: 'Please enter a valid name.' };
      return { value: v };
    },
  },
  {
    key: 'phone',
    optional: false,
    question: () => 'A phone number to confirm your reservation?',
    parse: (raw) => {
      const v = raw.trim();
      if (v.replace(/[\s\-()+]/g, '').length < 6) return { error: 'Please enter a valid phone number.' };
      return { value: v };
    },
  },
  {
    key: 'email',
    optional: true,
    question: () => 'And your email address? (optional - say "skip", "passer" or "aucun" to skip)',
    parse: (raw) => {
      const v = raw.trim();
      if (!v || /^(skip|passer|sauter|ignorer|non|aucun|rien|no)$/i.test(v)) return { value: '' };
      if (!/@/.test(v)) return { error: 'That doesn\'t look like a valid email. Try again, or say "skip" or "passer".' };
      return { value: v };
    },
  },
  {
    key: 'notes',
    optional: true,
    question: () => 'Any special requests? Dietary needs, celebrations, seating preference? (optional - say "skip", "passer" or "aucun" to continue)',
    parse: (raw) => {
      const v = raw.trim();
      if (/^(skip|passer|sauter|ignorer|non|aucun|rien|no)$/i.test(v)) return { value: '' };
      return { value: v.slice(0, 500) };
    },
  },
];

function findNextStep(state: ConversationState): typeof RESERVATION_STEPS[number] | null {
  for (const step of RESERVATION_STEPS) {
    const draftKey = step.key as keyof typeof state.draft;
    if (state.draft[draftKey] === undefined || state.draft[draftKey] === '') {
      if (step.optional && state.draft[draftKey] === '') continue;
      if (state.draft[draftKey] === undefined) return step;
    }
  }
  return null;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDisplayTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function startReservationFlow(state: ConversationState): string {
  state.reservationActive = true;
  state.draft = {};

  if (state.memory.customerName) state.draft.customerName = state.memory.customerName;
  if (state.memory.phone) state.draft.phone = state.memory.phone;
  if (state.memory.email) state.draft.email = state.memory.email;

  const next = findNextStep(state);
  state.currentStep = next?.key ?? 'guests';

  const intro = "Wonderful! I'll help you secure your table. Let's begin:";
  const question = next ? next.question(state) : '';
  return `${intro}\n\n${question}`;
}

async function advanceReservationFlow(
  state: ConversationState,
  message: string,
  restaurant: Restaurant
): Promise<ChatResponseBody> {
  const currentStepDef = RESERVATION_STEPS.find((s) => s.key === state.currentStep);
  if (!currentStepDef) {
    resetReservationFlow(state);
    return { reply: 'Let\'s start over - how many guests will be joining you?' };
  }

 const result = currentStepDef.parse(message);
  if ('error' in result) {
    const errorMsg: string = result.error !== undefined ? result.error : 'An error occurred.';
    return { reply: errorMsg };
  }

  (state.draft as Record<string, string | number>)[currentStepDef.key] = result.value;

  if (currentStepDef.key === 'customerName') state.memory.customerName = String(result.value);
  if (currentStepDef.key === 'phone') state.memory.phone = String(result.value);
  if (currentStepDef.key === 'email' && result.value) state.memory.email = String(result.value);

  // Vérification de capacité dès que l'heure est tapée
  if (currentStepDef.key === 'reservationTime' && state.draft.reservationDate) {
    const MAX_CAPACITY = 40;
    const SLOT_MINUTES = 90;
    const availability = await checkAvailability(
      restaurant.id,
      String(state.draft.reservationDate),
      String(result.value),
      Number(state.draft.guests ?? 1),
      MAX_CAPACITY,
      SLOT_MINUTES
    );
    if (!availability.available) {
      state.draft.reservationTime = undefined;
      state.currentStep = 'reservationTime';
      const booked = (availability as { available: false; guestsBooked: number; maxCapacity: number }).guestsBooked;
      const max = (availability as { available: false; guestsBooked: number; maxCapacity: number }).maxCapacity;
      const remaining = max - booked;
      return {
        reply: remaining <= 0
          ? `I'm sorry, we're fully booked at that time. Could you choose a different time?`
          : `I'm sorry, we only have ${remaining} spots left at that time for your party of ${state.draft.guests}. Could you choose a different time?`,
      };
    }
  }

  const next = findNextStep(state);
  if (next) {
    state.currentStep = next.key;
    return { reply: next.question(state) };
  }

  const input = createReservationSchema.parse({
    customerName: state.draft.customerName,
    guests: state.draft.guests,
    reservationDate: state.draft.reservationDate,
    reservationTime: state.draft.reservationTime,
    phone: state.draft.phone,
    email: state.draft.email || undefined,
    notes: state.draft.notes || undefined,
    source: 'chatbot',
  });

  // Vérification de capacité - limite fixe à 40 couverts
  const MAX_CAPACITY = 40;
  const SLOT_MINUTES = 90;

  const availability = await checkAvailability(
    restaurant.id,
    input.reservationDate,
    input.reservationTime,
    input.guests,
    MAX_CAPACITY,
    SLOT_MINUTES
  );

  if (!availability.available) {
    state.draft.reservationDate = undefined;
    state.draft.reservationTime = undefined;
    state.currentStep = 'reservationDate';
    const booked = (availability as { available: false; guestsBooked: number; maxCapacity: number }).guestsBooked;
    const max = (availability as { available: false; guestsBooked: number; maxCapacity: number }).maxCapacity;
    const remaining = max - booked;
    return {
      reply: remaining <= 0
        ? `I'm sorry, we're fully booked at that time. Could you choose a different date or time?`
        : `I'm sorry, we only have ${remaining} spots left for that slot. Could you choose a different time?`,
    };
  }

  const reservation = await createReservation(restaurant.id, input);
  resetReservationFlow(state);

  const summaryLines = [
    `Reservation confirmed!`,
    ``,
    `Name: ${reservation.customerName}`,
    `Date: ${formatDisplayDate(reservation.reservationDate)}`,
    `Time: ${formatDisplayTime(reservation.reservationTime)}`,
    `Guests: ${reservation.guests}`,
    `Phone: ${reservation.phone}`,
    ...(reservation.email ? [`Email: ${reservation.email}`] : []),
    ...(reservation.notes ? [`Notes: ${reservation.notes}`] : []),
    ``,
    `Reservation ID: #${reservation.id}`,
    ``,
    `We look forward to welcoming you to ${restaurant.name}. Is there anything else I can help you with?`,
  ];

  return {
    reply: summaryLines.join('\n'),
    quickReplies: ['Dress code', 'Parking', 'Menu'],
    reservationCompleted: {
      id: reservation.id,
      customerName: reservation.customerName,
      guests: reservation.guests,
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime,
    },
  };
}

export async function handleChatMessage(
  state: ConversationState,
  message: string,
  restaurant: Restaurant
): Promise<ChatResponseBody> {
  const trimmed = message.trim();

  if (state.reservationActive) {
    return advanceReservationFlow(state, trimmed, restaurant);
  }

  const intent = detectIntent(trimmed);

  if (intent === 'reservation') {
    const reply = startReservationFlow(state);
    return { reply };
  }

  const reply = buildIntentReply(intent, restaurant);
  const quickReplies = suggestQuickReplies(intent);
  return { reply, quickReplies: quickReplies.length ? quickReplies : undefined };
}
