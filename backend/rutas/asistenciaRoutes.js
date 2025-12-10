import express from "express";
import {
    listar,
    obtenerPorEstudiante,
    obtenerPorFechaDocente,
    crear,
    actualizar,
    eliminar,
    obtenerReporte
} from "../controlador/asistenciaController.js";
import { protegerRuta, permitirRol } from "../controlador/authController.js";

const router = express.Router();

// Rutas públicas para docentes
router.get("/", protegerRuta, permitirRol(['admin', 'docente']), listar);
router.get("/estudiante/:idEstudiante", protegerRuta, permitirRol(['admin', 'docente']), obtenerPorEstudiante);
router.get("/fecha-docente", protegerRuta, permitirRol(['admin', 'docente']), obtenerPorFechaDocente);
router.get("/reporte", protegerRuta, permitirRol(['admin', 'docente']), obtenerReporte);

// Crear, actualizar, eliminar (solo docentes y admin)
router.post("/", protegerRuta, permitirRol(['admin', 'docente']), crear);
router.put("/:id", protegerRuta, permitirRol(['admin', 'docente']), actualizar);
router.delete("/:id", protegerRuta, permitirRol(['admin', 'docente']), eliminar);

export default router;
