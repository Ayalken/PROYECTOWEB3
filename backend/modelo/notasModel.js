import { db } from "../config/db.js";

export const obtNotasPorEstudiante = async (id) => {
    const [resultado] = await db.query("SELECT * FROM notas WHERE idEstudiante=?", [id]);
    return resultado;
};

export const insertaNota = async (data) => {
    const [resultado] = await db.query("INSERT INTO notas SET ?", data);
    return { id: resultado.insertId, ...data };
};

export const actualizaNota = async (id, data) => {
    await db.query("UPDATE notas SET ? WHERE id=?", [data, id]);
    return { id, ...data };
};
