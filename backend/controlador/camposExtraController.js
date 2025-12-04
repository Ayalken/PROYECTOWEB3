import { obtCamposExtra, insertaCampoExtra, eliminaCampoExtra } from "../modelo/camposExtraModel.js";

export const listar = async (req, res) => {
    try {
        const resultado = await obtCamposExtra();
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crear = async (req, res) => {
    try {
        const resultado = await insertaCampoExtra(req.body);
        res.json({ mensaje: "Campo extra agregado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaCampoExtra(req.params.id);
        res.json({ mensaje: "Campo extra eliminado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};
