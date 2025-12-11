import {
    obtAsistencias,
    obtAsistenciasPorEstudiante,
    obtAsistenciasPorFechaDocente,
    insertaAsistencia,
    actualizaAsistencia,
    eliminaAsistencia,
    obtReporteAsistencia
} from "../modelo/asistenciaModel.js";


const validarAsistencia = (data) => {
    if (!data.idEstudiante) return "ID del estudiante es requerido";
    if (!data.idDocente) return "ID del docente es requerido";
    if (!data.fecha) return "Fecha es requerida";
    if (!data.hora) return "Hora es requerida";
    if (!data.estado || !['presente', 'ausente', 'retardo'].includes(data.estado)) {
        return "Estado debe ser: presente, ausente o retardo";
    }
    return null;
};

// Obtiene todas las asistencias
export const listar = async (req, res) => {
    try {
        const resultado = await obtAsistencias();
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener asistencias", error: err.message });
    }
};

// Obtener asistencias por estudiante
export const obtenerPorEstudiante = async (req, res) => {
    try {
        const resultado = await obtAsistenciasPorEstudiante(req.params.idEstudiante);
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener asistencias del estudiante", error: err.message });
    }
};

// Obtener asistencias por fecha y docente
export const obtenerPorFechaDocente = async (req, res) => {
    try {
        const { fecha, idDocente } = req.query;
        if (!fecha || !idDocente) {
            return res.status(400).json({ mensaje: "Fecha e idDocente son requeridos" });
        }
        const resultado = await obtAsistenciasPorFechaDocente(fecha, idDocente);
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener asistencias", error: err.message });
    }
};

// Registrar asistencia
export const crear = async (req, res) => {
    const error = validarAsistencia(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const resultado = await insertaAsistencia(req.body);
        res.json({ mensaje: "Asistencia registrada", resultado });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al registrar asistencia", error: err.message });
    }
};

// Actualizar asistencia
export const actualizar = async (req, res) => {
    const error = validarAsistencia(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const resultado = await actualizaAsistencia(req.params.id, req.body);
        res.json({ mensaje: "Asistencia actualizada", resultado });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al actualizar asistencia", error: err.message });
    }
};

// Eliminar asistencia
export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaAsistencia(req.params.id);
        res.json({ mensaje: "Asistencia eliminada", resultado });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al eliminar asistencia", error: err.message });
    }
};

// Obtener reporte de asistencia
export const obtenerReporte = async (req, res) => {
    try {
        const { idEstudiante, fechaInicio, fechaFin } = req.query;
        if (!idEstudiante || !fechaInicio || !fechaFin) {
            return res.status(400).json({ mensaje: "idEstudiante, fechaInicio y fechaFin son requeridos" });
        }
        const resultado = await obtReporteAsistencia(idEstudiante, fechaInicio, fechaFin);
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener reporte", error: err.message });
    }
};
