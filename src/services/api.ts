import axios from 'axios';

// Base API configuration
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s for intensive AI tasks
});
