// /controlador/estudianteController.js
import { obtTodosEstudiantes, insertaEstudiante, actualizaEstudiante, eliminaLogicoEstudiante } from "../modelo/estudianteModel.js";
import { buscarPorCI } from "../modelo/estudianteModel.js";

// Función de validación: acepta combinación vieja (`apellidos_nombres`) o nueva (apellido_paterno, apellido_materno, nombres)
const validarDatosEstudiante = (data) => {
    // Si vienen separados
    if (data.apellido_paterno || data.apellido_materno || data.nombres) {
        if (!data.apellido_paterno || !data.apellido_materno || !data.nombres) {
            return "Apellido paterno, apellido materno y nombres son obligatorios si se usan campos separados.";
        }
    } else {
        // Compatibilidad con campo único antiguo
        if (!data.apellidos_nombres || data.apellidos_nombres.length < 5) {
            return "El nombre y apellido del estudiante es obligatorio.";
        }
    }

    if (!data.carnet_identidad) {
        return "El carnet de identidad del estudiante es obligatorio.";
    }
    return null;
};

export const listar = async (req, res) => {
    try {
        const resultado = await obtTodosEstudiantes();
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crear = async (req, res) => {
    const error = validarDatosEstudiante(req.body);
    if (error) return res.status(400).json({ mensaje: error }); // ⬅️ Validación

    try {
        // Si vienen campos separados, componer `apellidos_nombres` pero conservar las columnas separadas
        const data = { ...req.body };
        if (data.apellido_paterno && data.apellido_materno && data.nombres) {
            data.apellidos_nombres = `${data.apellido_paterno} ${data.apellido_materno} ${data.nombres}`.trim();
        }
        const resultado = await insertaEstudiante(data);
        res.json({ mensaje: "Estudiante registrado", resultado });
    } catch (err) {
        // Log con contexto
        const masked = { ...req.body };
        if (masked.password) masked.password = '***masked***';
        console.error(`[${new Date().toISOString()}] Error al crear estudiante. Ruta: ${req.originalUrl} - Datos:`, masked);
        console.error(err && err.stack ? err.stack : err);
        const resp = { mensaje: 'Error al crear estudiante' };
        if (process.env.NODE_ENV === 'development') resp.error = err.message;
        res.status(500).json(resp);
    }
};

export const actualizar = async (req, res) => {
    const error = validarDatosEstudiante(req.body);
    if (error) return res.status(400).json({ mensaje: error }); // ⬅️ Validación

    try {
        const data = { ...req.body };
        if (data.apellido_paterno && data.apellido_materno && data.nombres) {
            data.apellidos_nombres = `${data.apellido_paterno} ${data.apellido_materno} ${data.nombres}`.trim();
        }
        const resultado = await actualizaEstudiante(req.params.id, data);
        res.json({ mensaje: "Estudiante actualizado", resultado });
    } catch (err) {
        const masked = { ...req.body };
        if (masked.password) masked.password = '***masked***';
        console.error(`[${new Date().toISOString()}] Error al actualizar estudiante ID=${req.params.id}. Ruta: ${req.originalUrl} - Datos:`, masked);
        console.error(err && err.stack ? err.stack : err);
        const resp = { mensaje: 'Error al actualizar estudiante' };
        if (process.env.NODE_ENV === 'development') resp.error = err.message;
        res.status(500).json(resp);
    }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaLogicoEstudiante(req.params.id);
        res.json({ mensaje: "Estudiante eliminado (lógico)", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Comprobar existencia de CI (para validar duplicados desde frontend)
export const checkCI = async (req, res) => {
    try {
        const ci = req.params.ci;
        if (!ci) return res.status(400).json({ mensaje: 'CI requerido' });
        const encontrado = await buscarPorCI(ci);
        res.json({ exists: !!encontrado });
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error en checkCI:`, err && err.stack ? err.stack : err);
        const resp = { mensaje: 'Error verificando CI' };
        if (process.env.NODE_ENV === 'development') resp.error = err.message;
        res.status(500).json(resp);
    }
};