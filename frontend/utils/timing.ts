/**
 * Calculates appropriate SAT timing for different modes
 * SAT typically allows ~1 minute 24 seconds per question (84 seconds)
 */

export const SAT_SECONDS_PER_QUESTION = 84; // 1 minute 24 seconds
export const QUIZ_SECONDS_PER_QUESTION = 90; // 1 minute 30 seconds (slightly more generous)
export const STUDY_NO_TIMER = true; // Study mode is untimed

export function calculateQuizTime(questionCount: number): number {
  return questionCount * QUIZ_SECONDS_PER_QUESTION;
}

export function calculateTestTime(questionCount: number): number {
  return questionCount * SAT_SECONDS_PER_QUESTION;
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function isTimeWarning(seconds: number): boolean {
  return seconds > 0 && seconds <= 60; // Warning when under 1 minute
}

export function isTimeExpired(seconds: number): boolean {
  return seconds <= 0;
}

export function parseTimeString(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}
