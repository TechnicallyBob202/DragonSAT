import { create } from 'zustand';
import { ParsedQuestion } from '../utils/questionParser';

export type AssessmentMode = 'study' | 'quiz' | 'test' | null;

export interface UserResponse {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface AssessmentState {
  // Session info
  sessionId: string | null;
  userId: string | null;
  activeMode: AssessmentMode;

  // Questions and responses
  questions: ParsedQuestion[];
  currentQuestionIndex: number;
  responses: UserResponse[];

  // Timer
  timeRemaining: number;
  timeStartedAt: number | null;

  // Configuration
  questionCount: number;
  selectedDomain: string | null;
  selectedDifficulty: string | null;

  // Actions
  initializeSession: (userId: string, mode: AssessmentMode) => void;
  setSessionId: (sessionId: string) => void;
  setQuestions: (questions: ParsedQuestion[]) => void;
  recordResponse: (response: UserResponse) => void;
  moveToNextQuestion: () => void;
  moveToQuestion: (index: number) => void;
  updateTimeRemaining: (seconds: number) => void;
  startTimer: () => void;
  resetAssessment: () => void;

  // Getters
  getCurrentQuestion: () => ParsedQuestion | null;
  getProgress: () => { current: number; total: number };
  getCorrectCount: () => number;
  getResponseForQuestion: (questionId: string) => UserResponse | undefined;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // Initial state
  sessionId: null,
  userId: null,
  activeMode: null,
  questions: [],
  currentQuestionIndex: 0,
  responses: [],
  timeRemaining: 0,
  timeStartedAt: null,
  questionCount: 10,
  selectedDomain: null,
  selectedDifficulty: null,

  // Actions
  initializeSession: (userId, mode) => {
    set({
      userId,
      activeMode: mode,
      responses: [],
      currentQuestionIndex: 0,
      timeStartedAt: null,
    });
  },

  setSessionId: (sessionId) => set({ sessionId }),

  setQuestions: (questions) => {
    set({ questions, currentQuestionIndex: 0 });
  },

  recordResponse: (response) => {
    set((state) => ({
      responses: [...state.responses, response],
    }));
  },

  moveToNextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    }));
  },

  moveToQuestion: (index) => {
    const state = get();
    if (index >= 0 && index < state.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  updateTimeRemaining: (seconds) => {
    set({ timeRemaining: Math.max(0, seconds) });
  },

  startTimer: () => {
    set({ timeStartedAt: Date.now() });
  },

  resetAssessment: () => {
    set({
      sessionId: null,
      activeMode: null,
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      timeRemaining: 0,
      timeStartedAt: null,
    });
  },

  // Getters
  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },

  getProgress: () => {
    const state = get();
    return {
      current: state.currentQuestionIndex + 1,
      total: state.questions.length,
    };
  },

  getCorrectCount: () => {
    const state = get();
    return state.responses.filter((r) => r.isCorrect).length;
  },

  getResponseForQuestion: (questionId) => {
    const state = get();
    return state.responses.find((r) => r.questionId === questionId);
  },
}));
