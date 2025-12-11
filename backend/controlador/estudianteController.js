// /controlador/estudianteController.js
import { obtTodosEstudiantes, insertaEstudiante, actualizaEstudiante, eliminaLogicoEstudiante, buscarPorCI, buscarPorNombre, buscarPorCIExcludingId, buscarPorNombreExcludingId } from "../modelo/estudianteModel.js";

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
            // Eliminar los campos temporales que no existen en la tabla `estudiante`
            delete data.apellido_paterno;
            delete data.apellido_materno;
            delete data.nombres;
        }
        // Comprobaciones de duplicados: CI y nombre completo
        if (data.carnet_identidad) {
            const existenteCI = await buscarPorCI(data.carnet_identidad);
            if (existenteCI) return res.status(400).json({ mensaje: 'CI ya registrado en el sistema.' });
        }
        if (data.apellidos_nombres) {
            const existenteNombre = await buscarPorNombre(data.apellidos_nombres);
            if (existenteNombre) return res.status(400).json({ mensaje: 'Ya existe un estudiante con ese nombre y apellidos.' });
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
            // Eliminar los campos temporales antes de enviar a la BD
            delete data.apellido_paterno;
            delete data.apellido_materno;
            delete data.nombres;
        }
        // Validar duplicados al actualizar (excluir el registro actual)
        const idActual = req.params.id;
        if (data.carnet_identidad) {
            const existenteCI = await buscarPorCIExcludingId(data.carnet_identidad, idActual);
            if (existenteCI) return res.status(400).json({ mensaje: 'CI ya registrado en otro estudiante.' });
        }
        if (data.apellidos_nombres) {
            const existenteNombre = await buscarPorNombreExcludingId(data.apellidos_nombres, idActual);
            if (existenteNombre) return res.status(400).json({ mensaje: 'Otro estudiante ya tiene ese nombre y apellidos.' });
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

// Comprobar existencia por nombre completo (apellidos_nombres) - usa comparación normalizada en el modelo
export const checkNombre = async (req, res) => {
    try {
        const nombre = req.params.nombre;
        if (!nombre) return res.status(400).json({ mensaje: 'Nombre requerido' });
        const excludeId = req.query.excludeId;
        let encontrado = null;
        if (excludeId) {
            encontrado = await buscarPorNombreExcludingId(nombre, excludeId);
        } else {
            encontrado = await buscarPorNombre(nombre);
        }
        res.json({ exists: !!encontrado });
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error en checkNombre:`, err && err.stack ? err.stack : err);
        const resp = { mensaje: 'Error verificando nombre' };
        if (process.env.NODE_ENV === 'development') resp.error = err.message;
        res.status(500).json(resp);
    }
};