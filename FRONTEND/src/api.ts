import axios from 'axios';

// Connects to your local Node.js server
const api = axios.create({
  baseURL: 'https://smartshop-api-ai52.onrender.com',
});

// Automatically attach the JWT VIP Pass to every request
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

export default api;