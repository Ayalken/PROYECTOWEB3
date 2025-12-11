// /rutas/reporteRoutes.js
import express from "express";
import { generarLibretaPDF, obtenerDatosGrafico, obtenerEstadisticasPorSemestre, generarReportePDFGeneral, obtenerNotasReporte } from "../controlador/reporteController.js";
import { protegerRuta } from "../controlador/authController.js";

const router = express.Router();

// Ruta para generar el PDF (Protegida)
router.get("/pdf/libreta/:id", protegerRuta, generarLibretaPDF);

// Ruta para obtener los datos crudos del gráfico (Protegida)
router.get("/datos/aprovechamiento", protegerRuta, obtenerDatosGrafico);

// Ruta para obtener estadísticas por semestre
router.get("/datos/por-semestre", protegerRuta, obtenerEstadisticasPorSemestre);

// Ruta para generar reporte PDF general
router.get("/pdf/general", protegerRuta, generarReportePDFGeneral);

// Ruta para obtener notas de detalle para reporte
router.get("/notas", protegerRuta, obtenerNotasReporte);

export default router;