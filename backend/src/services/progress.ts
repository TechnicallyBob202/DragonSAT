import sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';
import { User, Session, Response, DomainStat } from '../types';
import { runAsync, getAsync, allAsync } from '../db/init';

export async function getOrCreateUser(
  db: sqlite3.Database,
  userId: string,
  name: string = 'Anonymous'
): Promise<User> {
  const existing = await getAsync(
    db,
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (existing) {
    return existing;
  }

  await runAsync(db, 'INSERT INTO users (id, name) VALUES (?, ?)', [
    userId,
    name,
  ]);

  return { id: userId, name, created_at: new Date().toISOString() };
}

export async function createSession(
  db: sqlite3.Database,
  userId: string,
  mode: 'study' | 'quiz' | 'test'
): Promise<Session> {
  const sessionId = randomUUID();
  const now = new Date().toISOString();

  await runAsync(
    db,
    'INSERT INTO sessions (id, user_id, mode, start_time) VALUES (?, ?, ?, ?)',
    [sessionId, userId, mode, now]
  );

  return {
    id: sessionId,
    user_id: userId,
    mode,
    start_time: now,
  };
}

export async function endSession(
  db: sqlite3.Database,
  sessionId: string,
  score?: number,
  totalQuestions?: number,
  correctAnswers?: number
): Promise<void> {
  const now = new Date().toISOString();

  await runAsync(
    db,
    `UPDATE sessions
     SET end_time = ?, score = ?, total_questions = ?, correct_answers = ?
     WHERE id = ?`,
    [now, score ?? null, totalQuestions ?? null, correctAnswers ?? null, sessionId]
  );
}

export async function recordResponse(
  db: sqlite3.Database,
  sessionId: string,
  questionId: string,
  userAnswer: string | null,
  correctAnswer: string,
  isCorrect: boolean,
  timeSpentSeconds?: number,
  section?: string,
  domain?: string
): Promise<void> {
  const responseId = randomUUID();

  await runAsync(
    db,
    `INSERT INTO responses (id, session_id, question_id, user_answer, correct_answer, is_correct, time_spent_seconds, section, domain)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      responseId,
      sessionId,
      questionId,
      userAnswer,
      correctAnswer,
      isCorrect ? 1 : 0,
      timeSpentSeconds ?? null,
      section ?? null,
      domain ?? null,
    ]
  );
}

export async function getSessionResponses(
  db: sqlite3.Database,
  sessionId: string
): Promise<Response[]> {
  return allAsync(
    db,
    'SELECT * FROM responses WHERE session_id = ? ORDER BY rowid ASC',
    [sessionId]
  );
}

export async function getUserSessions(
  db: sqlite3.Database,
  userId: string,
  limit: number = 10
): Promise<Session[]> {
  return allAsync(
    db,
    `SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT ?`,
    [userId, limit]
  );
}

export async function getAnalytics(
  db: sqlite3.Database,
  userId: string
): Promise<DomainStat[]> {
  return allAsync(
    db,
    `SELECT
       r.domain,
       r.section,
       COUNT(*) as total,
       SUM(CASE WHEN r.is_correct = 1 THEN 1 ELSE 0 END) as correct,
       ROUND(100.0 * SUM(CASE WHEN r.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) as accuracy_pct
     FROM responses r
     JOIN sessions s ON r.session_id = s.id
     WHERE s.user_id = ? AND r.domain IS NOT NULL
     GROUP BY r.domain
     ORDER BY total DESC`,
    [userId]
  );
}

export async function getUserStats(
  db: sqlite3.Database,
  userId: string
): Promise<{
  totalSessions: number;
  averageScore: number | null;
  totalQuestionsAnswered: number;
  correctAnswers: number;
}> {
  const stats = await getAsync(
    db,
    `SELECT
      COUNT(*) as totalSessions,
      AVG(score) as averageScore,
      SUM(total_questions) as totalQuestionsAnswered,
      SUM(correct_answers) as correctAnswers
     FROM sessions
     WHERE user_id = ?`,
    [userId]
  );

  return {
    totalSessions: stats?.totalSessions ?? 0,
    averageScore: stats?.averageScore ?? null,
    totalQuestionsAnswered: stats?.totalQuestionsAnswered ?? 0,
    correctAnswers: stats?.correctAnswers ?? 0,
  };
}
