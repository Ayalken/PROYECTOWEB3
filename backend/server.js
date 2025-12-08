// /server.js
import express from "express";
import cors from "cors";
import estudianteRoutes from "./rutas/estudianteRoutes.js";
import notasRoutes from "./rutas/notasRoutes.js";
import camposExtraRoutes from "./rutas/camposExtraRoutes.js";
import authRoutes from "./rutas/authRoutes.js"; // ⬅️ NUEVO
import docenteRoutes from "./rutas/docenteRoutes.js"; // ⬅️ NUEVO
import reporteRoutes from "./rutas/reporteRoutes.js"; // ⬅️ NUEVO
import dbExport from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Middlewares para capturar IP y User-Agent (Necesario para el Log de Acceso)
app.use((req, res, next) => {
    // Usamos el header si estamos detrás de un proxy/load balancer
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.userAgent = req.headers['user-agent'] || 'Desconocido';
    next();
});

// RUTAS
app.use("/auth", authRoutes); // Autenticación, Login, Registro
app.use("/estudiantes", estudianteRoutes);
app.use("/docentes", docenteRoutes); // CRUD de Docentes
app.use("/notas", notasRoutes);
app.use("/campos-extra", camposExtraRoutes);
app.use("/reportes", reporteRoutes); // Reportes PDF

// Servidor
app.listen(3000, async () => {
    await dbExport.connectDB();
    console.log("Servidor backend corriendo en http://localhost:3000");
});