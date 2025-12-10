import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { obtUsuarioPorNombre, insertaUsuario, registrarLogAcceso } from "../modelo/authmodel.js";

// IMPORTANTE: Usa una clave secreta fuerte y guárdala en variables de entorno (ENV)
const JWT_SECRET = process.env.JWT_SECRET || "CLAVE_SECRETA_POR_DEFECTO_CAMBIAR";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const SAL_ROUNDS = 10;

// Función para verificar CAPTCHA con Google reCAPTCHA v3
const verificarCaptcha = async (token) => {
    // En desarrollo, permitir login sin verificar reCAPTCHA real (las claves demo no funcionan)
    if (process.env.NODE_ENV === "development" || !token) return true;

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${RECAPTCHA_SECRET}&response=${token}`
        });
        const data = await response.json();
        // Devuelve true si score > 0.5 (no es bot). Ajusta el threshold según necesites
        return data.success && data.score > 0.5;
    } catch (err) {
        console.error("Error verificando CAPTCHA:", err);
        return false;
    }
};

// Requisito: Validar fortaleza de la contraseña (débil, intermedio o fuerte)
const validarFortalezaContrasena = (password) => {
    let fortaleza = 0;
    if (password.length >= 8) fortaleza++;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) fortaleza++;
    if (password.match(/[0-9]/)) fortaleza++;
    if (password.match(/[^A-Za-z0-9]/)) fortaleza++; // Símbolos

    if (fortaleza < 2) return "débil";
    if (fortaleza === 4) return "fuerte";
    return "intermedio";
};

// --- 👥 Funciones de Autenticación ---

export const registrar = async (req, res) => {
    const { nombre_usuario, password, rol } = req.body;

    // Validación de fortaleza (Requerido)
    const fortaleza = validarFortalezaContrasena(password);
    if (fortaleza === "débil") {
        return res.status(400).json({ mensaje: "La contraseña es débil. Debe ser de al menos 8 caracteres, contener mayúsculas, minúsculas, números y símbolos." });
    }

    try {
        const usuarioExistente = await obtUsuarioPorNombre(nombre_usuario);
        if (usuarioExistente) {
            return res.status(409).json({ mensaje: "El nombre de usuario ya está en uso." });
        }

        // Encriptar la contraseña (Requisito: Contraseña encriptada)
        const password_hash = await bcrypt.hash(password, SAL_ROUNDS);

        const nuevoUsuario = { nombre_usuario, password_hash, rol: rol || 'docente' };
        await insertaUsuario(nuevoUsuario);

        res.status(201).json({ mensaje: `Usuario registrado. Fortaleza: ${fortaleza}`, rol: nuevoUsuario.rol });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al registrar el usuario" });
    }
};

export const login = async (req, res) => {
    const { nombre_usuario, password } = req.body;

    if (!nombre_usuario || !password) {
        return res.status(400).json({ mensaje: "Usuario y contraseña son requeridos." });
    }

    try {
        const usuario = await obtUsuarioPorNombre(nombre_usuario);
        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        const esValido = await bcrypt.compare(password, usuario.password_hash);
        if (!esValido) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        // Generar token JWT
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1h' });

        // Registrar Log de Ingreso (Requisito: Log de Acceso)
        const logData = {
            usuario_id: usuario.id,
            ip_acceso: req.clientIp, // Usando el middleware de /server.js
            evento: 'ingreso',
            browser_agente: req.userAgent
        };
        await registrarLogAcceso(logData);

        res.json({ token, usuario: usuario.nombre_usuario, rol: usuario.rol });

    } catch (err) {
        res.status(500).json({ mensaje: "Error en el servidor durante el login" });
    }
};

export const logout = async (req, res) => {
    // Registrar Log de Salida (Requisito: Log de Acceso)
    try {
        // req.usuario_id viene del middleware protegerRuta
        if (req.usuario_id) {
            const logData = {
                usuario_id: req.usuario_id,
                ip_acceso: req.clientIp,
                evento: 'salida',
                browser_agente: req.userAgent
            };
            await registrarLogAcceso(logData);
        }
        res.json({ mensaje: "Sesión cerrada con éxito" });

    } catch (err) {
        res.status(500).json({ mensaje: "Error al registrar el log de salida" });
    }
};

// Middleware para proteger rutas y obtener el ID/Rol del usuario
export const protegerRuta = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ mensaje: "Acceso denegado. No se proporcionó token." });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario_id = payload.id;
        req.usuario_rol = payload.rol;
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: "Token inválido o expirado." });
    }
};

// Middleware para verificar ROLES (Permisos)
export const permitirRol = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario_rol)) {
            return res.status(403).json({ mensaje: "Permisos insuficientes para esta acción." });
        }
        next();
    };
};

// Obtener lista de usuarios (solo para admin)
export const obtenerUsuarios = async (req, res) => {
    try {
        const db = (await import("../config/db.js")).default.pool;
        const [usuarios] = await db.query("SELECT id, nombre_usuario, rol, activo FROM usuario ORDER BY nombre_usuario");
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener usuarios", error: err.message });
    }
};