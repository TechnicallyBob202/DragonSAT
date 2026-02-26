import axios from 'axios';
import { OpenSATQuestion, FilteredQuestion, QuestionFilterParams } from '../types';

let cachedQuestions: OpenSATQuestion[] = [];
let isCached = false;

const OPENSAT_URL = process.env.OPENSAT_API_URL ||
  'https://api.jsonsilo.com/public/942c3c3b-3a0c-4be3-81c2-12029def19f5';

export async function loadOpenSATData(): Promise<void> {
  if (isCached && cachedQuestions.length > 0) {
    console.log(`Using cached OpenSAT data (${cachedQuestions.length} questions)`);
    return;
  }

  try {
    console.log('Fetching OpenSAT data...');
    const response = await axios.get<{ math: OpenSATQuestion[] }>(OPENSAT_URL);
    cachedQuestions = response.data.math;
    isCached = true;
    console.log(`Loaded ${cachedQuestions.length} questions from OpenSAT`);
  } catch (error) {
    console.error('Failed to load OpenSAT data:', error);
    throw error;
  }
}

export function getFilteredQuestions(params: QuestionFilterParams): FilteredQuestion[] {
  if (!isCached || cachedQuestions.length === 0) {
    throw new Error('OpenSAT data not loaded. Call loadOpenSATData() first.');
  }

  let filtered = [...cachedQuestions];

  // Filter by domain
  if (params.domain && params.domain.trim() !== '') {
    filtered = filtered.filter(q =>
      q.domain.toLowerCase().includes(params.domain!.toLowerCase())
    );
  }

  // Filter by difficulty
  if (params.difficulty && params.difficulty.trim() !== '') {
    filtered = filtered.filter(q =>
      q.difficulty.toLowerCase() === params.difficulty!.toLowerCase()
    );
  }

  // Limit results
  const limit = params.limit || 10;
  filtered = filtered.slice(0, limit);

  return filtered;
}

export function getQuestionById(id: string): OpenSATQuestion | undefined {
  return cachedQuestions.find(q => q.id === id);
}

export function getAllDomains(): string[] {
  if (!isCached || cachedQuestions.length === 0) {
    return [];
  }

  const domains = new Set(cachedQuestions.map(q => q.domain));
  return Array.from(domains).sort();
}

export function getCacheStatus(): { isCached: boolean; count: number } {
  return { isCached, count: cachedQuestions.length };
}
