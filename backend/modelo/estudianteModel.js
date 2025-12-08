import { db } from "../config/db.js";

export const obtTodosEstudiantes = async () => {
    // La consulta trae solo los activos (Requisito: Eliminación lógica)
    const [resultado] = await db.query("SELECT * FROM estudiante WHERE activo = 1");
    return resultado;
};

export const insertaEstudiante = async (data) => {
    // Insertar datos del formulario de filiación
    const [resultado] = await db.query("INSERT INTO estudiante SET ?", data);
    return { id: resultado.insertId, ...data };
};

export const actualizaEstudiante = async (id, data) => {
    await db.query("UPDATE estudiante SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

export const eliminaLogicoEstudiante = async (id) => {
    await db.query("UPDATE estudiante SET activo = 0 WHERE id = ?", [id]);
    return id;
};