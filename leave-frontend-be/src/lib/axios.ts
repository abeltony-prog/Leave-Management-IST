import axios from 'axios';
import { toast } from '@/components/ui/sonner';

// Set base URL from environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }

    const errorMessage = response?.data?.message || 'Something went wrong';

    if (response && response.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
