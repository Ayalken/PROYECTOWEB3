import dbExport from "../config/db.js";
const db = dbExport.pool;

// Obtener todas las notas detalle por estudiante y semestre
export const obtNotasDetallePorEstudiante = async (idEstudiante, semestre, materia_id = null) => {
    // Si se provee materia_id, filtramos por ella; si no, devolvemos todas las materias para ese estudiante/semestre
    let query = "SELECT * FROM nota_detalle WHERE idEstudiante = ? AND semestre = ?";
    const params = [idEstudiante, semestre];
    if (materia_id !== null && materia_id !== undefined) {
        query += " AND materia_id = ?";
        params.push(materia_id);
    }
    query += " ORDER BY tipo";
    const [resultado] = await db.query(query, params);
    return resultado;
};

// Insertar nota detalle (tarea, examen, proyecto)
export const insertaNotaDetalle = async (data) => {
    const { idEstudiante, semestre, tipo, descripcion, nota, materia_id } = data;

    // Validar datos requeridos
    if (!idEstudiante || idEstudiante === undefined || idEstudiante === null) {
        throw new Error('idEstudiante es requerido');
    }
    if (!semestre && semestre !== 0) {
        throw new Error('semestre es requerido');
    }
    if (!tipo) {
        throw new Error('tipo es requerido (tarea, examen, proyecto)');
    }
    if (nota === undefined || nota === null) {
        throw new Error('nota es requerida');
    }

    // Convertir a números
    const idEstudianteNum = parseInt(idEstudiante, 10);
    const semestreNum = parseInt(semestre, 10);
    const notaNum = parseFloat(nota);

    if (isNaN(idEstudianteNum) || isNaN(semestreNum) || isNaN(notaNum)) {
        throw new Error('idEstudiante, semestre y nota deben ser números');
    }

    const query = "INSERT INTO nota_detalle (idEstudiante, semestre, tipo, descripcion, nota, materia_id) VALUES (?, ?, ?, ?, ?, ?)";
    const [resultado] = await db.query(query, [idEstudianteNum, semestreNum, tipo, descripcion || null, notaNum, materia_id || null]);
    return { id: resultado.insertId, ...data };
};

// Actualizar nota detalle
export const actualizaNotaDetalle = async (id, data) => {
    await db.query("UPDATE nota_detalle SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

// Eliminar nota detalle
export const eliminaNotaDetalle = async (id) => {
    await db.query("DELETE FROM nota_detalle WHERE id = ?", [id]);
    return id;
};