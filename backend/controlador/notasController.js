import { obtNotasPorEstudiante, insertaNota, actualizaNota } from "../modelo/notasModel.js";

export const mostrar = async (req, res) => {
    try {
        const resultado = await obtNotasPorEstudiante(req.params.idEstudiante);
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crearNota = async (req, res) => {
    try {
        const resultado = await insertaNota(req.body);
        res.json({ mensaje: "Nota registrada", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const actualizarNota = async (req, res) => {
    try {
        const resultado = await actualizaNota(req.params.id, req.body);
        res.json({ mensaje: "Nota actualizada", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};
