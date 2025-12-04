// /controlador/docenteController.js
import { obtTodosDocentes, insertaDocente, actualizaDocente, eliminaLogicoDocente } from "../modelo/docenteModel.js";

// Función de validación simple (Requisito: Validaciones)
const validarDatosDocente = (data) => {
    if (!data.apellidos_nombres || data.apellidos_nombres.length < 5) {
        return "El nombre y apellido del docente es obligatorio y debe ser más largo.";
    }
    if (!data.ci) {
        return "El carnet de identidad es obligatorio.";
    }
    return null;
};

export const listar = async (req, res) => {
    try {
        const resultado = await obtTodosDocentes();
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crear = async (req, res) => {
    const error = validarDatosDocente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const resultado = await insertaDocente(req.body);
        res.json({ mensaje: "Docente registrado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const actualizar = async (req, res) => {
    const error = validarDatosDocente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const resultado = await actualizaDocente(req.params.id, req.body);
        res.json({ mensaje: "Docente actualizado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaLogicoDocente(req.params.id);
        res.json({ mensaje: "Docente eliminado (lógico)", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};