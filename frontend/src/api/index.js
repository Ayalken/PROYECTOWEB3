// /frontend/src/api/index.js
import axios from 'axios';

// URL de tu backend (Asegúrate que coincida con donde corre tu servidor Node.js)
const API_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🛡️ Interceptor para añadir el token JWT a cada solicitud (Seguridad)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});