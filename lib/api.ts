import { SubmitPayload } from '@/types/type';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE });

export const typingAPI = {
  getText: () => api.get('/api/text'),
  getStats: () => api.get('/api/stats'),
  getLeaderboard: (type = 'wpm', limit = 10) =>
    api.get(`/api/leaderboard?type=${type}&limit=${limit}`),
  getUserProfile: (username: string) => api.get(`/api/user/${username}`),
  submitTest: (payload: SubmitPayload) => api.post('/api/submit', payload),
};
