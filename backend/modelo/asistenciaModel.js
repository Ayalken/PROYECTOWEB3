import dbExport from "../config/db.js";
const db = dbExport.pool;

// Obtener todas las asistencias
export const obtAsistencias = async () => {
    const [resultado] = await db.query(`
        SELECT a.*, e.apellidos_nombres, d.apellidos_nombres as docente_nombre 
        FROM asistencia a
        LEFT JOIN estudiante e ON a.idEstudiante = e.id
        LEFT JOIN docente d ON a.idDocente = d.id
        ORDER BY a.fecha DESC, a.hora DESC
    `);
    return resultado;
};

// Obtener asistencias por estudiante
export const obtAsistenciasPorEstudiante = async (idEstudiante) => {
    const [resultado] = await db.query(`
        SELECT * FROM asistencia 
        WHERE idEstudiante = ? 
        ORDER BY fecha DESC, hora DESC
    `, [idEstudiante]);
    return resultado;
};

// Obtener asistencias por fecha y docente
export const obtAsistenciasPorFechaDocente = async (fecha, idDocente) => {
    const [resultado] = await db.query(`
        SELECT a.*, e.apellidos_nombres, e.carnet_identidad
        FROM asistencia a
        LEFT JOIN estudiante e ON a.idEstudiante = e.id
        WHERE DATE(a.fecha) = DATE(?) AND a.idDocente = ?
        ORDER BY a.hora DESC
    `, [fecha, idDocente]);
    return resultado;
};

// Insertar asistencia
export const insertaAsistencia = async (data) => {
    const [resultado] = await db.query("INSERT INTO asistencia SET ?", data);
    return { id: resultado.insertId, ...data };
};

// Actualizar asistencia
export const actualizaAsistencia = async (id, data) => {
    await db.query("UPDATE asistencia SET ? WHERE id = ?", [data, id]);
    return { id, ...data };
};

// Eliminar asistencia
export const eliminaAsistencia = async (id) => {
    await db.query("DELETE FROM asistencia WHERE id = ?", [id]);
    return id;
};

// Obtener reporte de asistencia por período
export const obtReporteAsistencia = async (idEstudiante, fechaInicio, fechaFin) => {
    const [resultado] = await db.query(`
        SELECT 
            DATE(fecha) as fecha,
            COUNT(*) as total_registros,
            SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes,
            SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
            SUM(CASE WHEN estado = 'retardo' THEN 1 ELSE 0 END) as retardos
        FROM asistencia
        WHERE idEstudiante = ? AND fecha BETWEEN ? AND ?
        GROUP BY DATE(fecha)
        ORDER BY fecha DESC
    `, [idEstudiante, fechaInicio, fechaFin]);
    return resultado;
};
