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
  section?: string;
  domain?: string;
  difficulty?: string;
  limit?: number;
}

// Auth endpoints
export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function googleAuth(accessToken: string) {
  const response = await apiClient.post('/auth/google', { accessToken });
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function linkGoogle(accessToken: string) {
  const response = await apiClient.post('/auth/link-google', { accessToken });
  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await apiClient.post('/auth/register', { name, email, password });
  return response.data;
}

export async function updateProfile(name: string) {
  const response = await apiClient.patch('/auth/profile', { name });
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
  timeSpentSeconds?: number,
  section?: string,
  domain?: string
) {
  const response = await apiClient.post('/progress/response', {
    sessionId,
    questionId,
    userAnswer,
    correctAnswer,
    isCorrect,
    timeSpentSeconds,
    section,
    domain,
  });
  return response.data;
}

export async function getAnalytics() {
  const response = await apiClient.get('/progress/analytics');
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
