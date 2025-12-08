import dbExport from "../config/db.js";
const db = dbExport.pool;

export const obtTodosDocentes = async () => {
    const [resultado] = await db.query("SELECT * FROM docente WHERE activo = 1");
    return resultado;
};

export const insertaDocente = async (data) => {
    const [resultado] = await db.query("INSERT INTO docente SET ?", data);
    return { id: resultado.insertId, ...data };
};

export const actualizaDocente = async (id, data) => {
    await db.query("UPDATE docente SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

// Eliminación lógica (Requisito: CRUD con eliminación lógica)
export const eliminaLogicoDocente = async (id) => {
    await db.query("UPDATE docente SET activo = 0 WHERE id = ?", [id]);
    return id;
};