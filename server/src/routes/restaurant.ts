import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { restaurants } from '../db/schema.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';

const router = Router();

router.get('/', async (req, res) => {
  const r = req.restaurant!;
  res.json({
    data: {
      slug: r.slug,
      name: r.name,
      address: r.address,
      phone: r.phone,
      email: r.email,
      logoUrl: r.logoUrl,
      primaryColor: r.primaryColor,
      secondaryColor: r.secondaryColor,
      settings: r.settings,
    },
  });
});

router.patch('/settings', requireAdminAuth, async (req, res, next) => {
  try {
    const r = req.restaurant!;
    const { name, address, phone, email, settings } = req.body;

    const updatePayload: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updatePayload.name = name;
    if (address) updatePayload.address = address;
    if (phone) updatePayload.phone = phone;
    if (email) updatePayload.email = email;
    if (settings) updatePayload.settings = settings;

    await db.update(restaurants).set(updatePayload).where(eq(restaurants.id, r.id));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;