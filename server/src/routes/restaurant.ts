import { Router } from 'express';

const router = Router();

/**
 * GET /restaurant
 * Returns the public-facing config for the current tenant: branding, menu,
 * hours, FAQ content. The React app fetches this once on load so the same
 * frontend renders correctly for any restaurant client - PARTIE 10.
 */
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

export default router;
