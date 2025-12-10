// /rutas/authRoutes.js
import express from "express";
import { login, registrar, logout, protegerRuta, permitirRol, obtenerUsuarios } from "../controlador/authController.js";

const router = express.Router();

router.post("/register", registrar);
router.post("/login", login);
router.post("/logout", protegerRuta, logout); // Requiere token para registrar la salida
router.get("/usuarios", protegerRuta, permitirRol(['admin']), obtenerUsuarios); // Solo admin

export default router;