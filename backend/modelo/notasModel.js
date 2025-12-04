// /modelo/notasModel.js
import { db } from "../config/db.js";

export const obtNotasPorEstudiante = async (id) => {
    // Trae las notas con la estructura de Ser, Saber, Hacer, Decidir
    const [resultado] = await db.query("SELECT * FROM notas WHERE idEstudiante=? ORDER BY trimestre, area", [id]);
    return resultado;
};

export const insertaNota = async (data) => {
    // Inserta la nota detallada
    const [resultado] = await db.query("INSERT INTO notas SET ?", data);
    return { id: resultado.insertId, ...data };
};

export const actualizaNota = async (id, data) => {
    await db.query("UPDATE notas SET ? WHERE id=?", [data, id]);
    return { id, ...data };
};