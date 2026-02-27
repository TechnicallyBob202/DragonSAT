import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { getAsync, runAsync } from '../db/init';
import { requireAuth, AuthRequest, JWT_SECRET } from '../middleware/auth';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

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
