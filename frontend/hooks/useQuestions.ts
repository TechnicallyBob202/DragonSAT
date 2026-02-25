import { useEffect, useState } from 'react';
import { getQuestions, getDomains } from '../utils/api';
import { ParsedQuestion, parseQuestions } from '../utils/questionParser';

export interface UseQuestionsOptions {
  domain?: string;
  difficulty?: string;
  limit?: number;
}

export interface UseQuestionsResult {
  questions: ParsedQuestion[];
  domains: string[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: UseQuestionsOptions) => Promise<void>;
}

export function useQuestions(initialOptions: UseQuestionsOptions = {}): UseQuestionsResult {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (options: UseQuestionsOptions = initialOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch questions
      const questionsRes = await getQuestions({
        domain: options.domain,
        difficulty: options.difficulty,
        limit: options.limit || 10,
      });

      if (questionsRes.success) {
        setQuestions(parseQuestions(questionsRes.questions));
      } else {
        setError('Failed to load questions');
      }

      // Fetch domains if not already loaded
      if (domains.length === 0) {
        const domainsRes = await getDomains();
        if (domainsRes.success) {
          setDomains(domainsRes.domains);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    domains,
    isLoading,
    error,
    refetch: fetchQuestions,
  };
}
