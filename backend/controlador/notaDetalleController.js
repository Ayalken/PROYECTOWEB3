import {
    obtNotasDetallePorEstudiante,
    insertaNotaDetalle,
    actualizaNotaDetalle,
    eliminaNotaDetalle
} from "../modelo/notaDetalleModel.js";

// Listar notas detalle por estudiante y semestre
export const listar = async (req, res) => {
    try {
        const { idEstudiante, semestre, materia_id } = req.query;
        if (!idEstudiante || !semestre) {
            return res.status(400).json({ mensaje: "Faltan parámetros: idEstudiante y semestre" });
        }
        const materiaIdNum = materia_id ? parseInt(materia_id, 10) : null;
        const resultado = await obtNotasDetallePorEstudiante(idEstudiante, semestre, materiaIdNum);
        res.json(resultado);
    } catch (err) {
        console.error("Error al listar notas_detalle:", err);
        res.status(500).json({ mensaje: "Error al listar notas", error: err.message });
    }
};

// Crear nota detalle
export const crear = async (req, res) => {
    try {
        console.log("Datos recibidos en POST /notas-detalle:", req.body);
        const resultado = await insertaNotaDetalle(req.body);
        res.json({ mensaje: "Nota registrada", resultado, insertId: resultado.id });
    } catch (err) {
        console.error("Error al guardar nota_detalle:", err);
        res.status(500).json({ mensaje: "Error al guardar nota", error: err.message });
    }
};

// Actualizar nota detalle
export const actualizar = async (req, res) => {
    try {
        const resultado = await actualizaNotaDetalle(req.params.id, req.body);
        res.json({ mensaje: "Nota actualizada", resultado });
    } catch (err) {
        console.error("Error al actualizar nota_detalle:", err);
        res.status(500).json({ mensaje: "Error al actualizar nota", error: err.message });
    }
};

// Eliminar nota detalle
export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaNotaDetalle(req.params.id);
        res.json({ mensaje: "Nota eliminada", resultado });
    } catch (err) {
        console.error("Error al eliminar nota_detalle:", err);
        res.status(500).json({ mensaje: "Error al eliminar nota", error: err.message });
    }
};