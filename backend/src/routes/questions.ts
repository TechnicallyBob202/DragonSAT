import { Router, Request, Response } from 'express';
import {
  getFilteredQuestions,
  getQuestionById,
  getAllDomains,
  getAllSections,
  getCacheStatus,
} from '../services/opensat';

const router = Router();

/**
 * GET /api/questions
 * Retrieve filtered questions from OpenSAT cache
 * Query parameters:
 * - domain: filter by domain (partial match)
 * - difficulty: Easy, Medium, or Hard
 * - limit: max number of results (default 10)
 */
router.get('/questions', (req: Request, res: Response) => {
  try {
    const { section, domain, difficulty, limit } = req.query;

    const questions = getFilteredQuestions({
      section: section as string | undefined,
      domain: domain as string | undefined,
      difficulty: difficulty as string | undefined,
      limit: limit ? parseInt(limit as string) : 10,
    });

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/questions/:id
 * Retrieve a specific question by ID
 */
router.get('/questions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = getQuestionById(id);

    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found',
      });
      return;
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/domains
 * Get list of all available domains
 */
router.get('/domains', (_req: Request, res: Response) => {
  try {
    const domains = getAllDomains();

    res.json({
      success: true,
      count: domains.length,
      domains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/sections
 * Get list of all available sections (math, english)
 */
router.get('/sections', (_req: Request, res: Response) => {
  try {
    const sections = getAllSections();
    res.json({ success: true, sections });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/cache-status
 * Check if OpenSAT data is cached and available
 */
router.get('/cache-status', (_req: Request, res: Response) => {
  try {
    const status = getCacheStatus();

    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
