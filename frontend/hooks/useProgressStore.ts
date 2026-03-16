import { create } from 'zustand';

export interface HistoricalSession {
  id: string;
  mode: 'study' | 'quiz' | 'test';
  start_time: string;
  end_time?: string;
  score?: number;
  total_questions?: number;
  correct_answers?: number;
}

export interface UserStats {
  totalSessions: number;
  averageScore: number | null;
  totalQuestionsAnswered: number;
  correctAnswers: number;
}

export interface ProgressState {
  userId: string | null;
  recentSessions: HistoricalSession[];
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserId: (userId: string) => void;
  setSessions: (sessions: HistoricalSession[]) => void;
  setUserStats: (stats: UserStats) => void;
  addSession: (session: HistoricalSession) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  // Initial state
  userId: null,
  recentSessions: [],
  userStats: null,
  isLoading: false,
  error: null,

  // Actions
  setUserId: (userId) => set({ userId }),

  setSessions: (sessions) => set({ recentSessions: sessions }),

  setUserStats: (stats) => set({ userStats: stats }),

  addSession: (session) => {
    set((state) => ({
      recentSessions: [session, ...state.recentSessions],
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => {
    set({
      userId: null,
      recentSessions: [],
      userStats: null,
      isLoading: false,
      error: null,
    });
  },
}));
