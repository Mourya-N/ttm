import axios from 'axios';

// Development: uses Vite proxy (/api → http://localhost:8080/api)
// Production (Railway): VITE_API_URL = https://your-backend.up.railway.app/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ttm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ttm_token');
      localStorage.removeItem('ttm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
};

// Projects
export const projectApi = {
  getAll:      ()           => api.get('/projects'),
  getOne:      (id)         => api.get(`/projects/${id}`),
  create:      (data)       => api.post('/projects', data),
  update:      (id, data)   => api.put(`/projects/${id}`, data),
  delete:      (id)         => api.delete(`/projects/${id}`),
  addMember:   (id, data)   => api.post(`/projects/${id}/members`, data),
  removeMember:(id, mId)    => api.delete(`/projects/${id}/members/${mId}`),
};

// Tasks
export const taskApi = {
  create:          (data)     => api.post('/tasks', data),
  getByProject:    (projectId)=> api.get(`/tasks/project/${projectId}`),
  getMy:           ()         => api.get('/tasks/my'),
  getOne:          (id)       => api.get(`/tasks/${id}`),
  update:          (id, data) => api.put(`/tasks/${id}`, data),
  delete:          (id)       => api.delete(`/tasks/${id}`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// Users
export const userApi = {
  getAll:     () => api.get('/users'),
  getMe:      () => api.get('/users/me'),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};

export default api;
