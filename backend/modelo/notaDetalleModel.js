import dbExport from "../config/db.js";
const db = dbExport.pool;

// Obtener todas las notas detalle por estudiante y semestre
export const obtNotasDetallePorEstudiante = async (idEstudiante, semestre) => {
    const [resultado] = await db.query(
        "SELECT * FROM nota_detalle WHERE idEstudiante = ? AND semestre = ? ORDER BY tipo",
        [idEstudiante, semestre]
    );
    return resultado;
};

// Insertar nota detalle (tarea, examen, proyecto)
export const insertaNotaDetalle = async (data) => {
    const { idEstudiante, semestre, tipo, descripcion, nota } = data;

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

    const query = "INSERT INTO nota_detalle (idEstudiante, semestre, tipo, descripcion, nota) VALUES (?, ?, ?, ?, ?)";
    const [resultado] = await db.query(query, [idEstudianteNum, semestreNum, tipo, descripcion || null, notaNum]);
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