import express from "express";
import cors from "cors";
import estudianteRoutes from "./rutas/estudianteRoutes.js";
import notasRoutes from "./rutas/notasRoutes.js";
import camposExtraRoutes from "./rutas/camposExtraRoutes.js";
import authRoutes from "./rutas/authRoutes.js";
import docenteRoutes from "./rutas/docenteRoutes.js";
import reporteRoutes from "./rutas/reporteRoutes.js";
import dbExport from "./config/db.js";
import bcrypt from "bcrypt";
import { obtUsuarioPorNombre, insertaUsuario } from "./modelo/authmodel.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.userAgent = req.headers['user-agent'] || 'Desconocido';
    next();
});

app.use("/auth", authRoutes);
app.use("/estudiantes", estudianteRoutes);
app.use("/docentes", docenteRoutes);
app.use("/notas", notasRoutes);
app.use("/campos-extra", camposExtraRoutes);
app.use("/reportes", reporteRoutes);

app.listen(3000, async () => {
    await dbExport.connectDB();

    const ensureAdmin = async () => {
        try {
            const existente = await obtUsuarioPorNombre('admin');
            if (!existente) {
                const password = 'admin123!';
                const saltRounds = 10;
                const password_hash = await bcrypt.hash(password, saltRounds);
                await insertaUsuario({ nombre_usuario: 'admin', password_hash, rol: 'admin' });
                console.log('✅ Usuario admin creado: usuario=admin contraseña=admin123!');
            } else {
                console.log('ℹ️ Usuario admin ya existe');
            }
        } catch (err) {
            console.error('Error creando usuario admin:', err);
        }
    };

    await ensureAdmin();

    console.log("Servidor backend corriendo en http://localhost:3000");
});