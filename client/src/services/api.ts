import axios from 'axios';

const getBaseApiUrl = (): string => {
  let url = import.meta.env.VITE_API_URL || '';
  
  if (typeof window !== 'undefined' && window.location.hostname) {
    // If the site is accessed via an IP address or hostname other than localhost,
    // and the API URL is set to localhost/127.0.0.1, redirect API calls to the hosting machine's IP.
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (url.includes('localhost')) {
        url = url.replace('localhost', window.location.hostname);
      } else if (url.includes('127.0.0.1')) {
        url = url.replace('127.0.0.1', window.location.hostname);
      }
    }
  }
  return url;
};

const API_URL = getBaseApiUrl();

export const getBackendUrl = (): string => {
  return API_URL;
};

export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  let resolvedUrl = imagePath;
  if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (resolvedUrl.includes('localhost')) {
        resolvedUrl = resolvedUrl.replace('localhost', window.location.hostname);
      } else if (resolvedUrl.includes('127.0.0.1')) {
        resolvedUrl = resolvedUrl.replace('127.0.0.1', window.location.hostname);
      }
    }
    return resolvedUrl;
  }
  
  let baseUrl = API_URL;
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', window.location.hostname);
    } else if (baseUrl.includes('127.0.0.1')) {
      baseUrl = baseUrl.replace('127.0.0.1', window.location.hostname);
    }
  }
  
  return `${baseUrl}${resolvedUrl}`;
};

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
