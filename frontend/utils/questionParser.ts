/**
 * Normalizes LaTeX in question text
 * Converts between different LaTeX formats to standardized $...$ for inline
 * and $$...$$ for display math
 */
export function normalizeLatex(text: string): string {
  if (!text) return text;

  // Convert \(...\) to $...$
  text = text.replace(/\\\((.*?)\\\)/g, '$$$1$$');

  // Keep $...$ and $$...$$ as is
  // They're already in the correct format

  return text;
}

export interface ParsedQuestion {
  id: string;
  domain: string;
  difficulty: string;
  paragraph?: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export function parseQuestion(data: any): ParsedQuestion {
  return {
    id: data.id,
    domain: data.domain,
    difficulty: data.difficulty,
    paragraph: data.question?.paragraph
      ? normalizeLatex(data.question.paragraph)
      : undefined,
    question: normalizeLatex(data.question?.question || ''),
    choices: {
      A: normalizeLatex(data.question?.choices?.A || ''),
      B: normalizeLatex(data.question?.choices?.B || ''),
      C: normalizeLatex(data.question?.choices?.C || ''),
      D: normalizeLatex(data.question?.choices?.D || ''),
    },
    correct_answer: data.correct_answer || data.question?.correct_answer || 'A',
    explanation: normalizeLatex(data.explanation || data.question?.explanation || ''),
  };
}

export function parseQuestions(data: any[]): ParsedQuestion[] {
  return data.map(parseQuestion);
}

const MATH_DOMAINS = new Set([
  'Algebra',
  'Advanced Math',
  'Geometry and Trigonometry',
  'Problem-Solving and Data Analysis',
]);

export function getSectionFromDomain(domain: string): string {
  return MATH_DOMAINS.has(domain) ? 'math' : 'english';
}
