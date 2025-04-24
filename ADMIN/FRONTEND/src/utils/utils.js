import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const superAdminToken = sessionStorage.getItem('superAdminToken');
  const resellerAdminToken = sessionStorage.getItem('resellerAdminToken');
  const associationAdminToken = sessionStorage.getItem('associationAdminToken');
  const clientAdminToken = sessionStorage.getItem('clientAdminToken');

  const token =
    superAdminToken ||
    resellerAdminToken ||
    associationAdminToken ||
    clientAdminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
