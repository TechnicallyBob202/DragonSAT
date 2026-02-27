import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import axios from 'axios';
import { getAsync, runAsync } from '../db/init';
import { requireAuth, AuthRequest, JWT_SECRET } from '../middleware/auth';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

async function getGoogleUserInfo(accessToken: string): Promise<{ sub: string; email?: string; name?: string }> {
  const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export function createAuthRouter(db: sqlite3.Database): Router {
  const router = Router();

  // POST /api/auth/register
  router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !USERNAME_RE.test(username)) {
      res.status(400).json({ error: 'Username must be 3–20 alphanumeric characters or underscores' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const existing = await getAsync(db, 'SELECT id FROM users WHERE username = ?', [username]);
      if (existing) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      const id = randomUUID();
      const password_hash = await bcrypt.hash(password, 10);
      await runAsync(
        db,
        'INSERT INTO users (id, name, username, password_hash) VALUES (?, ?, ?, ?)',
        [id, username, username, password_hash]
      );

      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, user: { id, username, name: username } });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    try {
      const user = await getAsync(
        db,
        'SELECT id, name, username, password_hash FROM users WHERE username = ?',
        [username]
      );

      if (!user || !user.password_hash) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/google
  router.post('/google', async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'accessToken is required' });
      return;
    }

    try {
      const { sub: googleId, email, name } = await getGoogleUserInfo(accessToken);

      // Find by google_id first
      let user = await getAsync(db, 'SELECT id, username, name FROM users WHERE google_id = ?', [googleId]);

      if (!user && email) {
        // Link to existing account that has the same email
        user = await getAsync(db, 'SELECT id, username, name FROM users WHERE email = ?', [email]);
        if (user) {
          await runAsync(db, 'UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
        }
      }

      if (!user) {
        // Create a new user; derive a username from the email prefix
        const id = randomUUID();
        const base = (email?.split('@')[0] ?? name ?? 'user')
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .slice(0, 17);
        let username = base.length >= 3 ? base : `user_${base}`;

        // Handle username collisions with a short suffix
        const taken = await getAsync(db, 'SELECT id FROM users WHERE username = ?', [username]);
        if (taken) {
          username = `${username}_${id.slice(0, 5)}`;
        }

        await runAsync(
          db,
          'INSERT INTO users (id, name, username, email, google_id) VALUES (?, ?, ?, ?, ?)',
          [id, name ?? username, username, email ?? null, googleId]
        );
        user = { id, username, name: name ?? username };
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name } });
    } catch (err) {
      console.error('Google auth error:', err);
      res.status(401).json({ error: 'Google authentication failed' });
    }
  });

  // GET /api/auth/me  (authenticated)
  router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await getAsync(
        db,
        'SELECT id, username, email, google_id FROM users WHERE id = ?',
        [req.userId]
      );
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email ?? null, googleLinked: !!user.google_id } });
    } catch (err) {
      console.error('GET /me error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/link-google  (authenticated)
  router.post('/link-google', requireAuth, async (req: AuthRequest, res: Response) => {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'accessToken is required' });
      return;
    }

    try {
      const { sub: googleId, email } = await getGoogleUserInfo(accessToken);

      // Make sure this google_id isn't already linked to a different account
      const existing = await getAsync(db, 'SELECT id FROM users WHERE google_id = ?', [googleId]);
      if (existing && existing.id !== req.userId) {
        res.status(409).json({ error: 'This Google account is already linked to a different user' });
        return;
      }

      await runAsync(
        db,
        'UPDATE users SET google_id = ?, email = COALESCE(email, ?) WHERE id = ?',
        [googleId, email ?? null, req.userId]
      );

      res.json({ success: true, googleLinked: true, email: email ?? null });
    } catch (err) {
      console.error('Link-google error:', err);
      res.status(500).json({ error: 'Google linking failed' });
    }
  });

  // POST /api/auth/change-password  (authenticated)
  router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    try {
      const user = await getAsync(
        db,
        'SELECT password_hash FROM users WHERE id = ?',
        [req.userId]
      );

      if (!user || !user.password_hash) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await runAsync(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.userId]);
      res.json({ success: true });
    } catch (err) {
      console.error('Change-password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
