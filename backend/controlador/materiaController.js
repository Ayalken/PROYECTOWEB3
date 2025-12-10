import { obtTodasMaterias, obtMateriaPorId, insertaMateria, actualizaMateria, eliminaMateria } from "../modelo/materiaModel.js";

export const listarMaterias = async (req, res) => {
    try {
        const materias = await obtTodasMaterias();
        res.json(materias);
    } catch (err) {
        console.error('Error al listar materias:', err);
        res.status(500).json({ mensaje: 'Error al listar materias', error: err.message });
    }
};

export const obtenerMateria = async (req, res) => {
    try {
        const materia = await obtMateriaPorId(req.params.id);
        if (!materia) return res.status(404).json({ mensaje: 'Materia no encontrada' });
        res.json(materia);
    } catch (err) {
        console.error('Error al obtener materia:', err);
        res.status(500).json({ mensaje: 'Error al obtener materia', error: err.message });
    }
};

export const crearMateria = async (req, res) => {
    try {
        const resultado = await insertaMateria(req.body);
        res.json({ mensaje: 'Materia creada', resultado });
    } catch (err) {
        console.error('Error al crear materia:', err);
        res.status(500).json({ mensaje: 'Error al crear materia', error: err.message });
    }
};

export const actualizarMateria = async (req, res) => {
    try {
        const resultado = await actualizaMateria(req.params.id, req.body);
        res.json({ mensaje: 'Materia actualizada', resultado });
    } catch (err) {
        console.error('Error al actualizar materia:', err);
        res.status(500).json({ mensaje: 'Error al actualizar materia', error: err.message });
    }
};

export const borrarMateria = async (req, res) => {
    try {
        const resultado = await eliminaMateria(req.params.id);
        res.json({ mensaje: 'Materia eliminada', resultado });
    } catch (err) {
        console.error('Error al eliminar materia:', err);
        res.status(500).json({ mensaje: 'Error al eliminar materia', error: err.message });
    }
};
