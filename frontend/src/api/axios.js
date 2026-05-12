import axios from 'axios';

// Create axios instance pointing to our backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Interceptor — runs before EVERY request
// Automatically attaches the JWT token if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;