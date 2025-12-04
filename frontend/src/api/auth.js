// /frontend/src/api/auth.js
import { api } from './index';

export const login = async (data) => {
    const response = await api.post('/auth/login', data);
    // Guardar datos de sesión
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', response.data.usuario);
    localStorage.setItem('rol', response.data.rol);
    return response.data;
};

export const logout = async () => {
    // Llama al backend para registrar el Log de Salida
    try {
        // Asumiendo que tienes una ruta de logout para registrar el log de salida
        await api.post('/auth/logout');
    } catch (error) {
        console.error("Error al registrar logout:", error);
    } finally {
        // Limpiar el estado de sesión localmente
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rol');
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getUserRole = () => {
    return localStorage.getItem('rol');
};