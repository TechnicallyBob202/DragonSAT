export interface OpenSATQuestion {
  id: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  question: {
    paragraph?: string;
    question: string;
    choices: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
  };
  visuals?: {
    type: string;
    svg_content: string;
  };
}

export interface FilteredQuestion extends OpenSATQuestion {
  section?: string;
}

export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  mode: 'study' | 'quiz' | 'test';
  start_time: string;
  end_time?: string;
  score?: number;
  total_questions?: number;
  correct_answers?: number;
}

export interface Response {
  id: string;
  session_id: string;
  question_id: string;
  user_answer?: string;
  correct_answer: string;
  is_correct: boolean;
  time_spent_seconds?: number;
}

export interface QuestionFilterParams {
  section?: string;
  domain?: string;
  difficulty?: string;
  limit?: number;
}
