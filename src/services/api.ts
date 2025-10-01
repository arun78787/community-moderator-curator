import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.patch('/auth/me', data),
};

export const postsService = {
  getAll: (params?: any) => api.get('/posts', { params }),
  
  getById: (id: string) => api.get(`/posts/${id}`),
  
  create: (data: FormData) => api.post('/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  update: (id: string, data: any) => api.patch(`/posts/${id}`, data),
  
  delete: (id: string) => api.delete(`/posts/${id}`),
};

export const flagsService = {
  create: (data: any) => api.post('/flags', data),
  
  getAll: (params?: any) => api.get('/flags', { params }),
};

export const moderationService = {
  getQueue: (params?: any) => api.get('/moderation/queue', { params }),
  
  getFlag: (id: string) => api.get(`/moderation/${id}`),
  
  takeAction: (id: string, data: any) => api.post(`/moderation/${id}/action`, data),
  
  getLogs: (params?: any) => api.get('/moderation/logs', { params }),
};

export const analyticsService = {
  getModerationMetrics: () => api.get('/analytics/moderation-metrics'),
  
  getCommunityStats: () => api.get('/analytics/community-stats'),
};

export const aiService = {
  analyzeText: (data: any) => api.post('/ai/analyze-text', data),
  
  analyzeImage: (data: any) => api.post('/ai/analyze-image', data),
};