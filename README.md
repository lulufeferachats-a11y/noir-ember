# Noir & Ember — Premium Restaurant Platform

A production-grade restaurant website with an AI-powered reservation
assistant, built to be resold to multiple restaurant clients (multi-tenant
SaaS architecture).

Stack: **React + TypeScript** (client) · **Express + TypeScript** (server) ·
**PostgreSQL + Drizzle ORM** (database).

---

## 1. Project structure

```
noir-ember/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/     UI components (one .tsx + .module.css per component)
│       ├── hooks/          useRestaurant, useChatbot, useAdmin
│       ├── services/       API clients (restaurantService, chatService, adminService)
│       ├── types/          Shared TypeScript types
│       ├── config/         App-level config (restaurant slug, API base URL)
│       └── utils/          Small helpers (session id)
│
└── server/                 Express + Drizzle backend
    └── src/
        ├── db/              Drizzle schema, migrations, client, seed
        ├── routes/          Express routers (restaurant, reservations, chat, adminAuth)
        ├── services/        Business logic (reservationService, conversationController, …)
        ├── middleware/      resolveRestaurant (multi-tenant), auth, error handling
        ├── types/           Zod validation schemas, chat types
        └── utils/           Natural-language date/time parsers
```

## 2. Database schema

Two tables, defined in `server/src/db/schema.ts`:

- **restaurants** — one row per tenant (name, address, branding colors, and a
  `settings` jsonb column holding hours, menu, FAQ-style content). This is
  what lets the same codebase serve multiple restaurant clients without code
  changes — see section 6.
- **reservations** — `id, created_at, customer_name, guests,
  reservation_date, reservation_time, phone, email, notes, status` plus
  `restaurant_id` (foreign key) and `source` (chatbot / manual / phone).

## 3. Setup & running locally

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local install, Docker, or a hosted instance like
  Neon/Supabase/Railway)

### Steps

```bash
# 1. Install dependencies in both client and server
cd server && npm install
cd ../client && npm install

# 2. Configure the server
cd ../server
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL connection string

# 3. Run migrations and seed the first restaurant (Noir & Ember)
npm run db:migrate
npm run db:seed

# 4. Configure the client
cd ../client
cp .env.example .env
# Defaults are fine for local dev (proxies to localhost:4000)

# 5. Run both apps (from the project root, in two terminals)
cd ../server && npm run dev      # http://localhost:4000
cd ../client && npm run dev      # http://localhost:5173
```

Visit **http://localhost:5173** to see the site. Click the chat bubble
(bottom-right) to talk to the assistant, or the **Admin** button
(bottom-left) to open the dashboard.

Default admin credentials (set in `server/.env`):
```
Username: admin
Password: change_me_in_production
```

## 4. Testing the reservation flow

In the chatbot, type any of:
- "I want to reserve"
- "Book a table"
- "Reservation"

The bot will ask for guests, date, time, name, phone, email (optional), and
notes (optional), then save the reservation to PostgreSQL and confirm it.
Open the Admin dashboard to see it appear instantly, and to confirm, cancel,
edit, or delete it.

The bot also answers natural questions about hours, address, menu,
vegetarian/vegan options, allergies, dress code, parking, terrace, private
events, wine, cocktails, desserts, pricing, Michelin stars, and the chef —
all sourced from the `restaurants.settings` jsonb column (see section 6).

## 5. API reference

All reservation/chat/restaurant routes require an `x-restaurant-slug`
header identifying the tenant (the client sets this automatically from
`VITE_RESTAURANT_SLUG`).

| Method | Route                  | Auth        | Description                          |
|--------|-------------------------|-------------|---------------------------------------|
| GET    | `/api/restaurant`       | none        | Public restaurant config for the UI   |
| POST   | `/api/chat`              | none        | Send a chatbot message                |
| POST   | `/api/admin/login`       | none        | Validate admin credentials            |
| POST   | `/api/reservations`      | admin       | Create a reservation manually         |
| GET    | `/api/reservations`      | admin       | List reservations (filter by status)  |
| GET    | `/api/reservations/stats`| admin      | Counts by status                      |
| GET    | `/api/reservations/:id`  | admin       | Get one reservation                   |
| PATCH  | `/api/reservations/:id`  | admin       | Update / confirm / cancel             |
| DELETE | `/api/reservations/:id`  | admin       | Delete a reservation                  |

Admin routes expect `x-admin-username` / `x-admin-password` headers.

## 6. Onboarding a new restaurant (the SaaS part)

To sell this to a second restaurant, no chatbot or UI code needs to change:

1. Insert a new row in `restaurants` with a unique `slug`, its own name,
   address, phone, email, brand colors, and a `settings` object (hours,
   menu, FAQ text) — see `server/src/db/seed.ts` for the shape to copy.
2. Deploy a client build with `VITE_RESTAURANT_SLUG` set to that new slug
   (or build a simple restaurant switcher if hosting multiple tenants on
   one domain).
3. Done — the chatbot, hero, menu, hours, and contact sections all render
   from that restaurant's row automatically.

## 7. Possible improvements

- Replace the in-memory chat session store (`conversationStore.ts`) with
  Redis or a `chat_sessions` table if you scale to multiple server
  instances.
- Replace the shared-secret admin auth with per-staff accounts and proper
  session/JWT auth before onboarding multiple paying restaurant clients.
- Add email/SMS confirmation sending on reservation creation (e.g. via
  Resend or Twilio) from `conversationController.ts`.
- Add a date-availability check (table capacity per slot) before
  confirming a reservation.
- Add an admin UI for managing restaurant `settings` (menu, hours, FAQ)
  without touching the database directly.
- Swap the keyword-based `intentDetection.ts` for an LLM-based classifier
  if you want the bot to handle more open-ended phrasing.
