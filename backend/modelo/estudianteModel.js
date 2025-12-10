import dbExport from "../config/db.js";
const db = dbExport.pool;

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

export const buscarPorCI = async (carnet_identidad) => {
    const [resultado] = await db.query("SELECT id FROM estudiante WHERE carnet_identidad = ? LIMIT 1", [carnet_identidad]);
    return resultado[0] || null;
};

export const actualizaEstudiante = async (id, data) => {
    await db.query("UPDATE estudiante SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

export const eliminaLogicoEstudiante = async (id) => {
    await db.query("UPDATE estudiante SET activo = 0 WHERE id = ?", [id]);
    return id;
};

// Asignar un docente a todos los estudiantes de un curso determinado (activo)
export const asignarDocentePorCurso = async (idDocente, curso) => {
    const [resultado] = await db.query("UPDATE estudiante SET docente_id = ? WHERE curso = ? AND activo = 1", [idDocente, curso]);
    return resultado;
};