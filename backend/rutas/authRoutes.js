// /rutas/authRoutes.js
import express from "express";
import { login, registrar, logout, protegerRuta } from "../controlador/authController.js";

const router = express.Router();

router.post("/register", registrar);
router.post("/login", login);
router.post("/logout", protegerRuta, logout); // Requiere token para registrar la salida

export default router;