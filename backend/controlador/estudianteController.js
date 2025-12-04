import {
    obtTodosEstudiantes,
    insertaEstudiante,
    actualizaEstudiante,
    eliminaLogicoEstudiante,
} from "../modelo/estudianteModel.js";

export const listar = async (req, res) => {
    try {
        const resultado = await obtTodosEstudiantes();
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crear = async (req, res) => {
    try {
        const data = req.body;
        const resultado = await insertaEstudiante(data);
        res.json({ mensaje: "Estudiante registrado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const actualizar = async (req, res) => {
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
