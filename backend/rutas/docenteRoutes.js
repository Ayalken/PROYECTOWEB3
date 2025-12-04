// /rutas/docenteRoutes.js
import express from "express";
import { listar, crear, actualizar, eliminar } from "../controlador/docenteController.js";
import { protegerRuta, permitirRol } from "../controlador/authController.js";

const router = express.Router();

// Rutas protegidas
router.get("/", protegerRuta, listar);
router.post("/", protegerRuta, permitirRol(['admin', 'docente']), crear);
router.put("/:id", protegerRuta, permitirRol(['admin', 'docente']), actualizar);
router.delete("/:id", protegerRuta, permitirRol(['admin']), eliminar); // Solo Admin elimina

export default router;