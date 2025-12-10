import express from 'express';
import { listarMaterias, obtenerMateria, crearMateria, actualizarMateria, borrarMateria } from '../controlador/materiaController.js';

const router = express.Router();

router.get('/', listarMaterias);
router.get('/:id', obtenerMateria);
router.post('/', crearMateria);
router.put('/:id', actualizarMateria);
router.delete('/:id', borrarMateria);

export default router;
