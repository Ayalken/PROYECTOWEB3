import express from "express";
import { mostrar, crearNota, actualizarNota } from "../controlador/notasController.js";

const router = express.Router();

router.get("/:idEstudiante", mostrar);
router.post("/", crearNota);
router.put("/:id", actualizarNota);

export default router;
