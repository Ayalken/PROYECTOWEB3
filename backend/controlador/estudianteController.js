// /controlador/estudianteController.js
import { obtTodosEstudiantes, insertaEstudiante, actualizaEstudiante, eliminaLogicoEstudiante } from "../modelo/estudianteModel.js";

// Función de validación simple (Requisito: Validaciones)
const validarDatosEstudiante = (data) => {
    if (!data.apellidos_nombres || data.apellidos_nombres.length < 5) {
        return "El nombre y apellido del estudiante es obligatorio.";
    }
    if (!data.carnet_identidad) {
        return "El carnet de identidad del estudiante es obligatorio.";
    }
    // Puedes añadir más validaciones aquí
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
        const data = req.body;
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
        const resultado = await actualizaEstudiante(req.params.id, req.body);
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