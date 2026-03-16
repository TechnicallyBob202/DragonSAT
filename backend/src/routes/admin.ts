import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { getAsync, allAsync, runAsync } from '../db/init';
import { AuthRequest } from '../middleware/auth';

export function createAdminRouter(db: sqlite3.Database): Router {
  const router = Router();

  // GET /api/admin/users — list all users
  router.get('/users', async (_req: AuthRequest, res: Response) => {
    try {
      const users = await allAsync(
        db,
        `SELECT id, name, username, email, role, created_at,
                CASE WHEN google_id IS NOT NULL THEN 1 ELSE 0 END AS google_linked,
                CASE WHEN password_hash IS NOT NULL THEN 1 ELSE 0 END AS has_password
         FROM users ORDER BY created_at ASC`
      );
      res.json({ success: true, users });
    } catch (err) {
      console.error('Admin list users error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/admin/users/:id — delete user + cascade
  router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (id === req.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    try {
      const user = await getAsync(db, 'SELECT id FROM users WHERE id = ?', [id]);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Cascade: delete responses for user's sessions, then sessions, then user
      await runAsync(
        db,
        'DELETE FROM responses WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?)',
        [id]
      );
      await runAsync(db, 'DELETE FROM sessions WHERE user_id = ?', [id]);
      await runAsync(db, 'DELETE FROM users WHERE id = ?', [id]);

      res.json({ success: true });
    } catch (err) {
      console.error('Admin delete user error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/users/:id/reset-password — set new password
  router.post('/users/:id/reset-password', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    try {
      const user = await getAsync(db, 'SELECT id FROM users WHERE id = ?', [id]);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await runAsync(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);

      res.json({ success: true });
    } catch (err) {
      console.error('Admin reset password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PATCH /api/admin/users/:id/role — promote or demote
  router.patch('/users/:id/role', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'admin' && role !== 'user') {
      res.status(400).json({ error: 'Role must be "admin" or "user"' });
      return;
    }

    if (id === req.userId) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    try {
      const user = await getAsync(db, 'SELECT id FROM users WHERE id = ?', [id]);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await runAsync(db, 'UPDATE users SET role = ? WHERE id = ?', [role, id]);
      res.json({ success: true, role });
    } catch (err) {
      console.error('Admin update role error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
