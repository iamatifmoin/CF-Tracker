
import axios from 'axios';
import { Student } from '@/types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Student API endpoints
export const studentApi = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (student: Omit<Student, 'id' | 'createdAt' | 'lastUpdated' | 'emailReminderCount' | 'currentRating' | 'maxRating'>) => 
    api.post<Student>('/students', student),
  update: (id: string, updates: Partial<Student>) => api.put<Student>(`/students/${id}`, updates),
  delete: (id: string) => api.delete(`/students/${id}`),
  sync: (id: string) => api.post(`/students/${id}/sync`),
  toggleEmailReminders: (id: string) => api.post(`/students/${id}/email-toggle`),
};

// Sync API endpoints
export const syncApi = {
  getSettings: () => api.get('/sync/settings'),
  updateSettings: (settings: any) => api.post('/sync/settings', settings),
  getStatus: () => api.get('/sync/status'),
  triggerManualSync: () => api.post('/sync/manual'),
  getLogs: (page: number = 1, limit: number = 10) => 
    api.get(`/sync/logs?page=${page}&limit=${limit}`),
  triggerInactivityCheck: () => api.post('/sync/inactivity-check'),
};

// Email API endpoints
export const emailApi = {
  getLogs: (page: number = 1, limit: number = 20) => 
    api.get(`/emails/logs?page=${page}&limit=${limit}`),
  getStats: () => api.get('/emails/stats'),
  getStudentLogs: (studentId: string) => api.get(`/emails/student/${studentId}`),
  sendTest: (studentId: string, type: 'inactivity' | 'sync_error') => 
    api.post('/emails/test', { studentId, type }),
};
