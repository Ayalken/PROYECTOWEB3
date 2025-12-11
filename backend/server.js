import express from "express";
import cors from "cors";
import estudianteRoutes from "./rutas/estudianteRoutes.js";
import notasRoutes from "./rutas/notasRoutes.js";
import camposExtraRoutes from "./rutas/camposExtraRoutes.js";
import authRoutes from "./rutas/authRoutes.js";
import docenteRoutes from "./rutas/docenteRoutes.js";
import reporteRoutes from "./rutas/reporteRoutes.js";
import materiaRoutes from "./rutas/materiaRoutes.js";
import asistenciaRoutes from "./rutas/asistenciaRoutes.js";
import dbExport from "./config/db.js";
import bcrypt from "bcrypt";
import { obtUsuarioPorNombre, insertaUsuario } from "./modelo/authmodel.js";
import notaDetalleRoutes from "./rutas/notaDetalleRoutes.js";

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
app.use("/asistencia", asistenciaRoutes);
app.use("/notas-detalle", notaDetalleRoutes);
app.use("/materias", materiaRoutes);

app.post("/test-nota", async (req, res) => {
    try {
        console.log("POST /test-nota recibida con datos:", req.body);
        const { idEstudiante, semestre, tipo, descripcion, nota } = req.body;

        if (!idEstudiante || !semestre || !tipo || nota === undefined) {
            return res.status(400).json({ error: "Faltan parámetros" });
        }

        const query = "INSERT INTO nota_detalle (idEstudiante, semestre, tipo, descripcion, nota) VALUES (?, ?, ?, ?, ?)";
        const [resultado] = await dbExport.pool.query(query, [idEstudiante, semestre, tipo, descripcion || null, nota]);
        res.json({ success: true, id: resultado.insertId });
    } catch (err) {
        console.error("Error en /test-nota:", err.message);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

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
                console.log(' Usuario admin creado: usuario=admin contraseña=admin123!');
            } else {
                console.log('ℹ Usuario admin ya existe');
            }
        } catch (err) {
            console.error('Error creando usuario admin:', err);
        }
    };

    const ensureNotaDetalleTable = async () => {
        try {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS nota_detalle (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    idEstudiante INT NOT NULL,
                    semestre INT NOT NULL,
                    tipo ENUM('tarea','examen','proyecto') NOT NULL,
                    descripcion VARCHAR(100),
                    nota DECIMAL(5,2) NOT NULL,
                    fecha DATE,
                    materia_id INT NULL,
                    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id) ON DELETE CASCADE
                )
            `;
            await dbExport.pool.query(createTableSQL);
            console.log('Tabla nota_detalle lista');
        } catch (err) {
            console.error('Error creando tabla nota_detalle:', err.message);
        }
    };

    await ensureNotaDetalleTable();
    await ensureAdmin();

    const ensureMateriasTable = async () => {
        try {
            const createSQL = `
                CREATE TABLE IF NOT EXISTS materias (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nombre VARCHAR(150) NOT NULL UNIQUE,
                    descripcion TEXT,
                    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await dbExport.pool.query(createSQL);
            try {
                await dbExport.pool.query("ALTER TABLE nota_detalle ADD COLUMN IF NOT EXISTS materia_id INT NULL");
            } catch (err) {
            }
            console.log('✅ Tabla materias lista');
        } catch (err) {
            console.error('Error creando tabla materias:', err.message);
        }
    };

    await ensureMateriasTable();

    console.log("Servidor backend corriendo en http://localhost:3000");
});

app.use((err, req, res, next) => {
    try {
        const timestamp = new Date().toISOString();
        const route = req.originalUrl || req.url;
        const method = req.method;
        const ip = req.clientIp || req.ip;
        console.error(`[${timestamp}] Error en ruta ${method} ${route} - IP: ${ip}`);
        console.error(err && err.stack ? err.stack : err);
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({ mensaje: 'Error interno del servidor', error: err.message });
        } else {
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    } catch (e) {
        console.error('Error dentro del middleware de errores:', e);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});