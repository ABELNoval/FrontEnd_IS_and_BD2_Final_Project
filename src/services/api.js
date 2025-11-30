import axios from 'axios';

const API_BASE = 'http://localhost:5159/api';

const api = axios.create({
  baseURL: API_BASE,
});

// SIN interceptores de autenticación - peticiones directas
export default api;