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
    const [rows] = await db.query("SELECT * FROM estudiante WHERE activo = 1");

    // Ordenar en JS para evitar errores si las columnas separadas no existen.
    const pickParts = (r) => {
        const apellidos_nombres = r.apellidos_nombres || '';
        const parts = apellidos_nombres.trim().split(/\s+/).filter(Boolean);
        const apellido_paterno = (r.apellido_paterno || parts[0] || '').toString();
        const apellido_materno = (r.apellido_materno || parts[1] || '').toString();
        const nombres = (r.nombres || (parts.length > 2 ? parts.slice(2).join(' ') : parts.slice(2).join(' ')) || '').toString();
        const normalize = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
        return [normalize(apellido_paterno), normalize(apellido_materno), normalize(nombres)];
    };

    rows.sort((a, b) => {
        const pa = pickParts(a);
        const pb = pickParts(b);
        for (let i = 0; i < 3; i++) {
            if (pa[i] < pb[i]) return -1;
            if (pa[i] > pb[i]) return 1;
        }
        return 0;
    });

    return rows;
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

export const obtEstudiantePorCI = async (carnet_identidad) => {
    const [rows] = await db.query("SELECT * FROM estudiante WHERE carnet_identidad = ? LIMIT 1", [carnet_identidad]);
    return rows[0] || null;
};

export const obtEstudiantePorId = async (id) => {
    const [rows] = await db.query("SELECT * FROM estudiante WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
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