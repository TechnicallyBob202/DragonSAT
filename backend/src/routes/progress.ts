import { Router, Response } from 'express';
import sqlite3 from 'sqlite3';
import { AuthRequest } from '../middleware/auth';
import {
  getOrCreateUser,
  createSession,
  endSession,
  recordResponse,
  getSessionResponses,
  getUserSessions,
  getUserStats,
} from '../services/progress';

export function createProgressRouter(db: sqlite3.Database): Router {
  const router = Router();

  /**
   * POST /api/progress/user
   * Get or create a user (uses JWT userId as the authoritative identity)
   */
  router.post('/user', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { name } = req.body;

      const user = await getOrCreateUser(db, userId, name);

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/progress/session/start
   * Start a new session (always scoped to the authenticated user)
   */
  router.post('/session/start', async (req: AuthRequest, res: Response) => {
    try {
      const { mode } = req.body;
      const userId = req.userId!;

      if (!mode) {
        res.status(400).json({
          success: false,
          error: 'mode is required',
        });
        return;
      }

      const session = await createSession(db, userId, mode);

      res.json({
        success: true,
        session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/progress/session/end
   * End a session with optional score
   */
  router.post('/session/end', async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId, score, totalQuestions, correctAnswers } = req.body;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'sessionId is required',
        });
        return;
      }

      await endSession(db, sessionId, score, totalQuestions, correctAnswers);

      res.json({
        success: true,
        message: 'Session ended successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/progress/response
   * Record a user's response to a question
   */
  router.post('/response', async (req: AuthRequest, res: Response) => {
    try {
      const {
        sessionId,
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
        timeSpentSeconds,
      } = req.body;

      if (!sessionId || !questionId || correctAnswer === undefined) {
        res.status(400).json({
          success: false,
          error: 'sessionId, questionId, and correctAnswer are required',
        });
        return;
      }

      await recordResponse(
        db,
        sessionId,
        questionId,
        userAnswer || null,
        correctAnswer,
        isCorrect || false,
        timeSpentSeconds
      );

      res.json({
        success: true,
        message: 'Response recorded',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/progress/session/:sessionId
   * Get all responses for a session
   */
  router.get('/session/:sessionId', async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;

      const responses = await getSessionResponses(db, sessionId);

      res.json({
        success: true,
        count: responses.length,
        responses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/progress/user/:userId
   * Get the authenticated user's sessions and stats (JWT identity is authoritative)
   */
  router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { limit } = req.query;

      const sessions = await getUserSessions(
        db,
        userId,
        limit ? parseInt(limit as string) : 10
      );
      const stats = await getUserStats(db, userId);

      res.json({
        success: true,
        sessions,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
