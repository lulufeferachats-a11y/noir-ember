import type { Restaurant } from '../db/schema.js';
import type {
  ChatResponseBody,
  ConversationState,
  ReservationFieldKey,
  Language,
} from '../types/chat.js';
import { detectIntent } from './intentDetection.js';
import { buildIntentReply, suggestQuickReplies } from './chatResponses.js';
import { parseNaturalDate, parseNaturalTime } from '../utils/naturalLanguageParsers.js';
import { createReservation, checkAvailability } from './reservationService.js';
import { createReservationSchema } from '../types/validation.js';
import { resetReservationFlow } from './conversationStore.js';
import { sendCustomerConfirmationEmail, sendRestaurantNotificationEmail } from './emailService.js';
import { t } from './translations.js';

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

function detectLanguage(message: string): Language | null {
  const m = message.toLowerCase().trim();
  if (/^(fr|français|francais|french|bonjour|oui|non)$/i.test(m)) return 'fr';
  if (/^(en|english|anglais|hello|yes|no)$/i.test(m)) return 'en';
  return null;
}

const RESERVATION_STEPS: Array<{
  key: ReservationFieldKey;
  optional: boolean;
  question: (state: ConversationState) => string;
  parse: (raw: string, lang: Language | null) => { value: string | number; error?: undefined } | { value?: undefined; error: string };
}> = [
  {
    key: 'guests',
    optional: false,
    question: (state) => t(state.language).reservation.steps.guests,
    parse: (raw, lang) => {
      const n = parseInt(raw.trim(), 10);
      if (Number.isNaN(n) || n < 1 || n > 50) return { error: t(lang).reservation.errors.guests };
      return { value: n };
    },
  },
  {
    key: 'reservationDate',
    optional: false,
    question: (state) => t(state.language).reservation.steps.reservationDate,
    parse: (raw, lang) => {
      const parsed = parseNaturalDate(raw);
      if (!parsed) return { error: t(lang).reservation.errors.date };
      return { value: parsed };
    },
  },
  {
    key: 'reservationTime',
    optional: false,
    question: (state) => t(state.language).reservation.steps.reservationTime,
    parse: (raw, lang) => {
      const parsed = parseNaturalTime(raw);
      if (!parsed) return { error: t(lang).reservation.errors.time };
      return { value: parsed };
    },
  },
  {
    key: 'customerName',
    optional: false,
    question: (state) => t(state.language).reservation.steps.customerName(state.memory.customerName),
    parse: (raw, lang) => {
      const v = raw.trim();
      if (v.length < 2) return { error: t(lang).reservation.errors.name };
      return { value: v };
    },
  },
  {
    key: 'phone',
    optional: false,
    question: (state) => t(state.language).reservation.steps.phone,
    parse: (raw, lang) => {
      const v = raw.trim();
      if (v.replace(/[\s\-()+]/g, '').length < 6) return { error: t(lang).reservation.errors.phone };
      return { value: v };
    },
  },
  {
    key: 'email',
    optional: true,
    question: (state) => t(state.language).reservation.steps.email,
    parse: (raw, lang) => {
      const v = raw.trim();
      if (!v || /^(skip|passer|sauter|ignorer|non|aucun|rien|no)$/i.test(v)) return { value: '' };
      if (!/@/.test(v)) return { error: t(lang).reservation.errors.email };
      return { value: v };
    },
  },
  {
    key: 'notes',
    optional: true,
    question: (state) => t(state.language).reservation.steps.notes,
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

function startReservationFlow(state: ConversationState): string {
  state.reservationActive = true;
  state.draft = {};

  if (state.memory.customerName) state.draft.customerName = state.memory.customerName;
  if (state.memory.phone) state.draft.phone = state.memory.phone;
  if (state.memory.email) state.draft.email = state.memory.email;

  const next = findNextStep(state);
  state.currentStep = next?.key ?? 'guests';

  const intro = t(state.language).reservation.intro;
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
    return { reply: t(state.language).reservation.startOver };
  }

  const result = currentStepDef.parse(message, state.language);
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
          ? t(state.language).reservation.capacityFull
          : t(state.language).reservation.capacityPartial(remaining, Number(state.draft.guests ?? 1)),
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

  // Vérification finale de capacité
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
        ? t(state.language).reservation.capacityFull
        : t(state.language).reservation.capacityPartial(remaining, input.guests),
    };
  }

  const reservation = await createReservation(restaurant.id, input);
  resetReservationFlow(state);

  const emailData = {
    customerName: reservation.customerName,
    customerEmail: reservation.email ?? '',
    guests: reservation.guests,
    reservationDate: reservation.reservationDate,
    reservationTime: reservation.reservationTime,
    phone: reservation.phone,
    notes: reservation.notes,
    reservationId: reservation.id,
    restaurantName: restaurant.name,
    restaurantPhone: restaurant.phone,
    restaurantAddress: restaurant.address,
  };

  Promise.all([
    sendCustomerConfirmationEmail(emailData),
    sendRestaurantNotificationEmail(emailData),
  ]).catch((err) => console.error('Email sending failed:', err));

  return {
    reply: t(state.language).reservation.confirmed(
      reservation.customerName,
      restaurant.name,
      reservation.email
    ),
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

  // Étape 1 — choix de la langue au démarrage
  if (state.language === null) {
    const detected = detectLanguage(trimmed);
    if (detected) {
      state.language = detected;
      const welcomeReply = detected === 'fr'
        ? `Bonjour ! ${t('fr').welcome(restaurant.name)}`
        : t('en').welcome(restaurant.name);
      return {
        reply: welcomeReply,
        quickReplies: t(detected).quickReplies.initial as unknown as string[],
      };
    }
    // Pas encore de langue choisie — demander
    return {
      reply: `Bonjour / Hello 👋\n\nFrançais ou English ?`,
      quickReplies: ['Français', 'English'],
    };
  }

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