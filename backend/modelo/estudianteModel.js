import dbExport from "../config/db.js";
const db = dbExport.pool;

const normalizeText = (s) => {
    if (!s && s !== '') return '';
    return String(s)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

export const obtTodosEstudiantes = async () => {
    // La consulta trae solo los activos (Requisito: Eliminación lógica)
    // Ordenar alfabéticamente por apellido: prioriza columnas separadas si existen,
    // de lo contrario extrae partes desde `apellidos_nombres`.
    const orderExpr = `COALESCE(NULLIF(apellido_paterno,''), SUBSTRING_INDEX(apellidos_nombres,' ',1)) ASC,
                       COALESCE(NULLIF(apellido_materno,''), SUBSTRING_INDEX(SUBSTRING_INDEX(apellidos_nombres,' ',2),' ',-1)) ASC,
                       COALESCE(NULLIF(nombres,''), SUBSTRING_INDEX(apellidos_nombres,' ',-1)) ASC`;
    const [resultado] = await db.query(`SELECT * FROM estudiante WHERE activo = 1 ORDER BY ${orderExpr}`);
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

export const buscarPorNombre = async (apellidos_nombres) => {
    // Traer los activos y comparar normalizado en JS para evitar problemas con acentos/espacios
    const [rows] = await db.query("SELECT id, apellidos_nombres FROM estudiante WHERE activo = 1");
    const target = normalizeText(apellidos_nombres || '');
    for (const r of rows) {
        if (normalizeText(r.apellidos_nombres || '') === target) return { id: r.id };
    }
    return null;
};

export const buscarPorCIExcludingId = async (carnet_identidad, id) => {
    const [resultado] = await db.query("SELECT id FROM estudiante WHERE carnet_identidad = ? AND id != ? LIMIT 1", [carnet_identidad, id]);
    return resultado[0] || null;
};

export const buscarPorNombreExcludingId = async (apellidos_nombres, id) => {
    const [rows] = await db.query("SELECT id, apellidos_nombres FROM estudiante WHERE activo = 1 AND id != ?", [id]);
    const target = normalizeText(apellidos_nombres || '');
    for (const r of rows) {
        if (normalizeText(r.apellidos_nombres || '') === target) return { id: r.id };
    }
    return null;
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