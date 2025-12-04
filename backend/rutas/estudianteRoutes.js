import express from "express";
import { listar, crear, actualizar, eliminar } from "../controlador/estudianteController.js";

const router = express.Router();

router.get("/", listar);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
