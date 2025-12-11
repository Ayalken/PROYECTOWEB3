import express from "express";
import { listar, crear, actualizar, eliminar, checkNombre, obtenerPorCI, obtenerPorId } from "../controlador/estudianteController.js";
import { checkCI } from "../controlador/estudianteController.js";

const router = express.Router();

router.get("/", listar);
router.get("/check-ci/:ci", checkCI);
router.get("/check-nombre/:nombre", checkNombre);
router.get("/ci/:ci", obtenerPorCI);
router.get("/id/:id", obtenerPorId);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
