import dbExport from "../config/db.js";
const db = dbExport.pool;

export const obtTodasMaterias = async () => {
    const [rows] = await db.query("SELECT * FROM materias ORDER BY nombre");
    return rows;
};

export const obtMateriaPorId = async (id) => {
    const [rows] = await db.query("SELECT * FROM materias WHERE id = ?", [id]);
    return rows[0];
};

export const insertaMateria = async (data) => {
    const { nombre, descripcion } = data;
    if (!nombre) throw new Error('nombre es requerido');
    const [res] = await db.query("INSERT INTO materias (nombre, descripcion) VALUES (?, ?)", [nombre, descripcion || null]);
    return { id: res.insertId, nombre, descripcion };
};

export const actualizaMateria = async (id, data) => {
    await db.query("UPDATE materias SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

export const eliminaMateria = async (id) => {
    await db.query("DELETE FROM materias WHERE id = ?", [id]);
    return id;
};
