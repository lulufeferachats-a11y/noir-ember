import 'dotenv/config';
import { db } from './client.js';
import { restaurants } from './schema.js';
import { eq } from 'drizzle-orm';
import type { RestaurantSettings } from './schema.js';

/**
 * Seed data for the first tenant: Noir & Ember.
 * To onboard a new restaurant client later, insert a new row here (or via
 * an admin UI) with its own slug and settings - no chatbot code changes needed.
 */
const noirEmberSettings: RestaurantSettings = {
  hours: [
    { day: 'Monday', open: null, close: null, closed: true },
    { day: 'Tuesday–Thursday', open: '19:00', close: '23:00', closed: false },
    { day: 'Friday–Saturday', open: '18:30', close: '23:30', closed: false },
    { day: 'Sunday', open: '12:00', close: '16:00', closed: false },
  ],
  parking: 'Valet parking available Thursday to Sunday from 6:30 PM. Public parking at Parking Ternes, a 2-minute walk away.',
  terrace: 'We have a heated terrace open from May to October.',
  dressCode: 'Smart casual to formal. Ties are not required but appreciated.',
  privateEvents: 'Private events and chef\'s table experiences are available, seating up to 24 guests. Email events@noirandemmer.fr to enquire.',
  vegetarianInfo: 'Vegetarian dishes are marked VG on our menu, including the Oysters & Black Pearl, Charred Leek Velouté, Charcoal Soufflé, Dark Chocolate Sphere, and Île Flottante Noir.',
  veganInfo: 'Our vegan dishes (marked VN) are the Charred Leek Velouté and Roasted Celeriac. Our chef can adapt other dishes with advance notice.',
  allergyInfo: 'Please mention any allergies when booking. Our kitchen handles nuts, gluten, dairy, and shellfish, and can adapt most dishes given advance notice.',
  wineInfo: 'Our sommelier Isabelle Garnier curates an 800-label wine cellar, including Pétrus 2015 and Krug Grande Cuvée. Pairings can be arranged in advance.',
  cocktailInfo: 'Signature cocktails include the Ember Negroni and the Black Pearl Martini, crafted by our in-house mixologist.',
  dessertInfo: 'Don\'t miss the Charcoal Soufflé or the tableside Dark Chocolate Sphere.',
  michelinInfo: 'Noir & Ember holds two Michelin stars, awarded in 2021 and retained every year since.',
  chefInfo: 'Chef Étienne Morel trained under Alain Ducasse and spent years in Osaka before opening Noir & Ember in 2019, built around the art of ember cooking.',
  maxCapacityPerSlot: 40,
  slotDurationMinutes: 90,
  faq: [
    { question: 'Do you have a children\'s menu?', answer: 'We welcome children but currently do not offer a dedicated children\'s menu, given our tasting-menu format.' },
    { question: 'Is there a corkage fee?', answer: 'Corkage is €45 per bottle for wines not on our list.' },
  ],
  menu: [
    {
      category: 'Starters',
      items: [
        { name: 'Oysters & Black Pearl', description: 'Gillardeau oysters, black caviar pearls, champagne foam, seaweed oil', price: '€28', tags: ['VG'] },
        { name: 'Ember Burrata', description: 'Wood-smoked burrata, tomato confit, charred sourdough, basil oil', price: '€24' },
        { name: 'Foie Gras Torchon', description: 'Duck foie gras, sauternes gelée, brioche, black truffle shavings', price: '€36' },
        { name: 'Charred Leek Velouté', description: 'Slow-roasted leeks, cashew cream, chive oil, crispy capers', price: '€19', tags: ['VN'] },
      ],
    },
    {
      category: 'Mains',
      items: [
        { name: 'Wagyu Côte de Bœuf', description: 'A5 Wagyu, ember-roasted marrow, black garlic butter, seasonal greens', price: '€85' },
        { name: 'Wild Sea Bass', description: 'Line-caught sea bass, miso beurre blanc, charred corn, yuzu foam', price: '€54' },
        { name: 'Roasted Celeriac', description: 'Whole-roasted celeriac, walnut cream, truffle vinaigrette, microherbs', price: '€42', tags: ['VN'] },
        { name: 'Duck à l\'Orange Noir', description: 'Aged duck breast, bitter orange reduction, smoked potato, chicory', price: '€58' },
      ],
    },
    {
      category: 'Desserts',
      items: [
        { name: 'Charcoal Soufflé', description: 'Activated charcoal soufflé, vanilla ice cream, dark chocolate sauce', price: '€22', tags: ['VG'] },
        { name: 'Ember Tarte Tatin', description: 'Caramelised apple, smoked caramel, crème fraîche, cinnamon emulsion', price: '€18' },
        { name: 'Dark Chocolate Sphere', description: '72% Valrhona, salted caramel core, spun sugar, gold leaf', price: '€24', tags: ['VG'] },
      ],
    },
  ],
};

async function seed() {
  console.log('Seeding restaurant: Noir & Ember...');

  const existing = await db.query.restaurants.findFirst({
    where: (r, { eq }) => eq(r.slug, 'noir-and-ember'),
  });

  if (existing) {
    await db
      .update(restaurants)
      .set({
        name: 'Noir & Ember',
        address: '14 Rue des Acacias, 75017 Paris, France',
        phone: '+33 1 45 67 89 00',
        email: 'reservations@noirandemmer.fr',
        primaryColor: '#C9A96E',
        secondaryColor: '#0A0A0A',
        settings: noirEmberSettings,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, existing.id));
    console.log('Updated existing restaurant row.');
  } else {
    await db.insert(restaurants).values({
      slug: 'noir-and-ember',
      name: 'Noir & Ember',
      address: '14 Rue des Acacias, 75017 Paris, France',
      phone: '+33 1 45 67 89 00',
      email: 'reservations@noirandemmer.fr',
      primaryColor: '#C9A96E',
      secondaryColor: '#0A0A0A',
      settings: noirEmberSettings,
    });
    console.log('Inserted new restaurant row.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
