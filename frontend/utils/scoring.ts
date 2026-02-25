/**
 * Scoring utilities for quiz and test modes
 * Calculates raw scores, percentages, and provides feedback
 */

export interface ScoreResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  rawScore: number;
}

export function calculateScore(
  totalQuestions: number,
  correctAnswers: number
): ScoreResult {
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = (correctAnswers / totalQuestions) * 100;

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    percentage,
    rawScore: correctAnswers,
  };
}

export function getScoreGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export function getScoreFeedback(percentage: number): string {
  if (percentage >= 90) return 'Excellent work!';
  if (percentage >= 80) return 'Good job! Keep practicing.';
  if (percentage >= 70) return 'Nice effort. Review weak areas.';
  if (percentage >= 60) return 'Fair attempt. More practice needed.';
  return 'Review the material and try again.';
}

export function getTimeAccuracy(
  timeSpent: number,
  recommendedTime: number
): {
  ratio: number;
  status: 'fast' | 'on-pace' | 'slow';
} {
  const ratio = timeSpent / recommendedTime;

  if (ratio < 0.75) return { ratio, status: 'fast' };
  if (ratio > 1.25) return { ratio, status: 'slow' };
  return { ratio, status: 'on-pace' };
}
