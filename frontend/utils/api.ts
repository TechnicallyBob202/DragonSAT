import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface QuestionFilterParams {
  domain?: string;
  difficulty?: string;
  limit?: number;
}

// Auth endpoints
export async function login(username: string, password: string) {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

export async function register(username: string, password: string) {
  const response = await apiClient.post('/auth/register', { username, password });
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
}

// Question endpoints
export async function getQuestions(params: QuestionFilterParams = {}) {
  const response = await apiClient.get('/questions', { params });
  return response.data;
}

export async function getQuestionById(id: string) {
  const response = await apiClient.get(`/questions/${id}`);
  return response.data;
}

export async function getDomains() {
  const response = await apiClient.get('/domains');
  return response.data;
}

export async function getCacheStatus() {
  const response = await apiClient.get('/cache-status');
  return response.data;
}

// Progress endpoints
export async function getOrCreateUser(userId: string, name?: string) {
  const response = await apiClient.post('/progress/user', {
    userId,
    name,
  });
  return response.data;
}

export async function startSession(
  userId: string,
  mode: 'study' | 'quiz' | 'test'
) {
  const response = await apiClient.post('/progress/session/start', {
    userId,
    mode,
  });
  return response.data;
}

export async function endSession(
  sessionId: string,
  score?: number,
  totalQuestions?: number,
  correctAnswers?: number
) {
  const response = await apiClient.post('/progress/session/end', {
    sessionId,
    score,
    totalQuestions,
    correctAnswers,
  });
  return response.data;
}

export async function recordResponse(
  sessionId: string,
  questionId: string,
  userAnswer: string | null,
  correctAnswer: string,
  isCorrect: boolean,
  timeSpentSeconds?: number
) {
  const response = await apiClient.post('/progress/response', {
    sessionId,
    questionId,
    userAnswer,
    correctAnswer,
    isCorrect,
    timeSpentSeconds,
  });
  return response.data;
}

export async function getSessionResponses(sessionId: string) {
  const response = await apiClient.get(`/progress/session/${sessionId}`);
  return response.data;
}

export async function getUserProgress(userId: string, limit?: number) {
  const response = await apiClient.get(`/progress/user/${userId}`, {
    params: { limit },
  });
  return response.data;
}

export default apiClient;
