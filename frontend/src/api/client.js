import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials and notify listeners
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// Auth API helpers
export async function registerUser(username, email, password) {
  const response = await apiClient.post('/auth/register', { username, email, password });
  return response.data;
}

export async function loginUser(username, password) {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

// Game API helpers
export async function fetchLevels() {
  const response = await apiClient.get('/levels');
  return response.data;
}

export async function submitRun(runData) {
  const response = await apiClient.post('/runs', runData);
  return response.data;
}

export async function fetchMyRuns() {
  const response = await apiClient.get('/runs/me');
  return response.data;
}

export async function fetchLeaderboard(levelId = null) {
  const url = levelId ? `/leaderboard?level_id=${levelId}` : '/leaderboard';
  const response = await apiClient.get(url);
  return response.data;
}
