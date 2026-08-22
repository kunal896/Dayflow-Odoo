import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      toast.error(response.data.error || 'Request failed');
      return Promise.reject(new Error(response.data.error || 'Request failed'));
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || 'Network error. Please check your connection.';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
