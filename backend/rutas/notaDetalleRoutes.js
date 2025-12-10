import express from "express";
import { listar, crear, actualizar, eliminar } from "../controlador/notaDetalleController.js";
import { protegerRuta, permitirRol } from "../controlador/authController.js";

const router = express.Router();

// Sin autenticación temporalmente para debuggear
router.get("/", listar);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;