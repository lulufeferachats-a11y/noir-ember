import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * POST /admin/login
 * Validates admin credentials against the server-side secret and returns
 * a simple success flag. The client stores credentials in memory and
 * resends them as headers on subsequent admin requests (see requireAdminAuth).
 */
router.post('/login', (req, res) => {
  const { username, password } = loginSchema.parse(req.body);

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (username === expectedUsername && password === expectedPassword) {
    return res.json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid admin credentials.' });
});

export default router;
