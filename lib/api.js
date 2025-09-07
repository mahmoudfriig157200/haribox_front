import axios from 'axios';

// Use env in production, fallback to local in dev
export const api = axios.create({
  // Use Next.js rewrite proxy to avoid CORS in production
  baseURL: process.env.NEXT_PUBLIC_USE_DIRECT_API === '1' ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001') : '/api',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function withTokenParams(token, extra = {}) {
  return { token, ...extra };
}