// /modelo/authModel.js
import dbExport from "../config/db.js";
const db = dbExport.pool;

// Busca un usuario para el login
export const obtUsuarioPorNombre = async (nombre_usuario) => {
    const [resultado] = await db.query(
        "SELECT * FROM usuario WHERE nombre_usuario = ? AND activo = 1",
        [nombre_usuario]
    );
    return resultado[0];
};

// Inserta un nuevo usuario (Registro)
export const insertaUsuario = async (data) => {
    const [resultado] = await db.query("INSERT INTO usuario SET ?", data);
    return { id: resultado.insertId, ...data };
};

// Registra el log de acceso (Requisito: Log de Acceso)
export const registrarLogAcceso = async (logData) => {
    const [resultado] = await db.query("INSERT INTO log_acceso SET ?", logData);
    return { id: resultado.insertId, ...logData };
};