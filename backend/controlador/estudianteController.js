// /controlador/estudianteController.js
import { obtTodosEstudiantes, insertaEstudiante, actualizaEstudiante, eliminaLogicoEstudiante } from "../modelo/estudianteModel.js";

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
        res.status(500).json(err);
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
        res.status(500).json(err);
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