import type { Language } from '../types/chat.js';

/**
 * All chatbot text in both languages.
 * To add a new language, add a new key here - no other file needs to change.
 */
export const T = {
  en: {
    welcome: (restaurantName: string) => `Welcome to ${restaurantName}.\n\nI'm your personal concierge, here to help with reservations, menu questions, or anything else about your visit.\n\nHow may I assist you?`,
    quickReplies: {
      initial: ['Book a table', 'Opening hours', 'Menu highlights'],
      afterInfo: ['Make a reservation', 'More info'],
    },
    reservation: {
      intro: "Wonderful! I'll help you secure your table. Let's begin:",
      steps: {
        guests: 'How many guests will be joining you?',
        reservationDate: 'What date would you like to reserve? (e.g. "15 August 2026")',
        reservationTime: 'What time would you prefer? (e.g. "7:30 PM")',
        customerName: (name?: string) => name ? `Shall I use the name "${name}" again, or would you like a different name?` : 'What name shall I put the reservation under?',
        phone: 'A phone number to confirm your reservation?',
        email: 'And your email address? (optional - say "skip" or "passer" to skip)',
        notes: 'Any special requests? (optional - say "skip" or "passer" to continue)',
      },
      errors: {
        guests: 'Please enter a valid number of guests (1 to 50).',
        date: 'I didn\'t catch that date. Please use a format like "15 August 2026" or "15/08/2026".',
        dateInPast: 'I\'m sorry, that date is in the past. Please choose a future date.',
        time: 'Could you share the time like "7:30 PM" or "20:00"?',
        name: 'Please enter a valid name.',
        phone: 'Please enter a valid phone number.',
        email: 'That doesn\'t look like a valid email. Try again or say "skip".',
      },
      capacityFull: 'I\'m sorry, we\'re fully booked at that time. Could you choose a different time?',
      capacityPartial: (remaining: number, guests: number) => `I'm sorry, we only have ${remaining} spots left at that time for your party of ${guests}. Could you choose a different time?`,
      confirmed: (name: string, restaurantName: string, email?: string | null) =>
        `Reservation confirmed!\n\nName: ${name}\n` +
        (email ? `\nA confirmation email has been sent to ${email}.\n` : '') +
        `\nWe look forward to welcoming you to ${restaurantName}. Is there anything else I can help you with?`,
      startOver: "Let's start over - how many guests will be joining you?",
    },
    fallback: (phone: string, email: string) => `Thank you for your question. Our team would be happy to assist you personally at ${phone} or ${email}. Would you like to make a reservation?`,
    thanks: 'It\'s our pleasure. Is there anything else I can help you with?',
  },

  fr: {
    welcome: (restaurantName: string) => `Bienvenue chez ${restaurantName}.\n\nJe suis votre concierge personnel, disponible pour vos réservations, questions sur le menu ou toute autre information.\n\nComment puis-je vous aider ?`,
    quickReplies: {
      initial: ['Réserver une table', 'Horaires d\'ouverture', 'Le menu'],
      afterInfo: ['Faire une réservation', 'Plus d\'informations'],
    },
    reservation: {
      intro: 'Avec plaisir ! Je vais vous aider à réserver votre table. Commençons :',
      steps: {
        guests: 'Combien de personnes serez-vous ?',
        reservationDate: 'Quelle date souhaitez-vous réserver ? (ex: "15 août 2026")',
        reservationTime: 'À quelle heure préférez-vous ? (ex: "19h30")',
        customerName: (name?: string) => name ? `Puis-je utiliser le nom "${name}" à nouveau, ou souhaitez-vous un nom différent ?` : 'Au nom de qui dois-je faire la réservation ?',
        phone: 'Votre numéro de téléphone pour confirmer la réservation ?',
        email: 'Et votre adresse email ? (optionnel - tapez "passer" pour ignorer)',
        notes: 'Des demandes spéciales ? (optionnel - tapez "passer" pour continuer)',
      },
      errors: {
        guests: 'Veuillez entrer un nombre de personnes valide (1 à 50).',
        date: 'Je n\'ai pas compris cette date. Essayez un format comme "15 août 2026" ou "15/08/2026".',
        dateInPast: 'Désolé, cette date est déjà passée. Veuillez choisir une date future.',
        time: 'Pourriez-vous indiquer l\'heure comme "19h30" ou "20:00" ?',
        name: 'Veuillez entrer un nom valide.',
        phone: 'Veuillez entrer un numéro de téléphone valide.',
        email: 'Cela ne ressemble pas à un email valide. Réessayez ou tapez "passer".',
      },
      capacityFull: 'Désolé, nous sommes complets à cet horaire. Pourriez-vous choisir un autre créneau ?',
      capacityPartial: (remaining: number, guests: number) => `Désolé, il ne reste que ${remaining} place${remaining > 1 ? 's' : ''} à cet horaire pour votre groupe de ${guests}. Pourriez-vous choisir un autre créneau ?`,
      confirmed: (name: string, restaurantName: string, email?: string | null) =>
        `Réservation confirmée !\n\nNom : ${name}\n` +
        (email ? `\nUn email de confirmation a été envoyé à ${email}.\n` : '') +
        `\nNous avons hâte de vous accueillir chez ${restaurantName}. Puis-je vous aider pour autre chose ?`,
      startOver: 'Recommençons — combien de personnes serez-vous ?',
    },
    fallback: (phone: string, email: string) => `Merci pour votre question. Notre équipe se fera un plaisir de vous aider au ${phone} ou à ${email}. Souhaitez-vous faire une réservation ?`,
    thanks: 'Avec plaisir. Puis-je vous aider pour autre chose ?',
  },
} as const;

export function t(lang: Language | null): typeof T['en'] {
  return T[lang ?? 'en'];
}