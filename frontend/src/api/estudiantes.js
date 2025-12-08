import { api } from './index.js';

const ESTUDIANTE_URL = '/estudiantes';

export const getEstudiantes = () => api.get(ESTUDIANTE_URL);

export const createEstudiante = (data) => api.post(ESTUDIANTE_URL, data);

export const updateEstudiante = (id, data) => api.put(`${ESTUDIANTE_URL}/${id}`, data);

export const deleteEstudiante = (id) => api.delete(`${ESTUDIANTE_URL}/${id}`);