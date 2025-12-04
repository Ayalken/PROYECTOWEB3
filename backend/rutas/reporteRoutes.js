// /rutas/reporteRoutes.js
import express from "express";
import { generarLibretaPDF, obtenerDatosGrafico } from "../controlador/reporteController.js";
import { protegerRuta } from "../controlador/authController.js";

const router = express.Router();

// Ruta para generar el PDF (Protegida)
router.get("/pdf/libreta/:id", protegerRuta, generarLibretaPDF);

// Ruta para obtener los datos crudos del gráfico (Protegida)
router.get("/datos/aprovechamiento", protegerRuta, obtenerDatosGrafico);

export default router;