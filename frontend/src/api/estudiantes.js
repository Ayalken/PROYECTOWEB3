// /frontend/src/api/estudiantes.js
import { api } from './index';

const ESTUDIANTE_URL = '/estudiantes';

// Obtener todos los estudiantes
export const getEstudiantes = () => api.get(ESTUDIANTE_URL);

// Crear nuevo estudiante (Filiación)
export const createEstudiante = (data) => api.post(ESTUDIANTE_URL, data);

// Actualizar estudiante
export const updateEstudiante = (id, data) => api.put(`${ESTUDIANTE_URL}/${id}`, data);

// Eliminar lógico (Requisito)
export const deleteEstudiante = (id) => api.delete(`${ESTUDIANTE_URL}/${id}`);