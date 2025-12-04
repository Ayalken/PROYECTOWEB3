import { db } from "../config/db.js";

export const obtCamposExtra = async () => {
    const [resultado] = await db.query("SELECT * FROM campos_extra");
    return resultado;
};

export const insertaCampoExtra = async (data) => {
    const [resultado] = await db.query("INSERT INTO campos_extra SET ?", data);
    return { id: resultado.insertId, ...data };
};

export const eliminaCampoExtra = async (id) => {
    await db.query("DELETE FROM campos_extra WHERE id=?", [id]);
    return id;
};
