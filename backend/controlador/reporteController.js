// /controlador/reporteController.js
import PDFDocument from 'pdfkit'; // npm install pdfkit
import dbExport from "../config/db.js";
const db = dbExport.pool;

// Requisito: Por lo menos un reporte en pdf
export const generarLibretaPDF = async (req, res) => {
    const idEstudiante = req.params.id;

    try {
        // Obtener datos del estudiante (Ejemplo: Juan Pérez - 5to B)
        const [estudiante] = await db.query("SELECT * FROM estudiante WHERE id = ?", [idEstudiante]);
        if (!estudiante.length) return res.status(404).json({ mensaje: "Estudiante no encontrado" });

        // Obtener todas las notas del estudiante
        const [notas] = await db.query("SELECT * FROM notas WHERE idEstudiante = ? ORDER BY trimestre, area", [idEstudiante]);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="libreta_notas_${idEstudiante}.pdf"`);

        doc.pipe(res);

        doc.fontSize(16).text(`LIBRETA DE NOTAS - ${estudiante[0].apellidos_nombres}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Curso: ${estudiante[0].curso || 'N/A'}`);
        doc.moveDown();

        // Tabla de Notas (simplificada)
        notas.forEach(nota => {
            doc.fontSize(10).text(`Área: ${nota.area} - Trimestre ${nota.trimestre}:`);
            doc.text(`   SER: ${nota.prom_ser}, SABER: ${nota.prom_saber}, HACER: ${nota.prom_hacer}, DECIDIR: ${nota.prom_decidir}`);
            doc.text(`   NOTA TRIMESTRAL: ${nota.nota_trimestral} | CUALITATIVO: ${nota.cualitativo || 'N/A'}`, { continued: true });
            doc.moveDown();
        });

        doc.end();

    } catch (err) {
        console.error("Error al generar PDF:", err);
        res.status(500).json({ mensaje: "Error al generar el reporte PDF" });
    }
};

// Requisito: Por lo menos un gráfico estadístico
export const obtenerDatosGrafico = async (req, res) => {
    try {
        // Ejemplo: Obtener el promedio de notas finales por área en el 1er trimestre
        const [promedios] = await db.query(`
            SELECT 
                area, 
                AVG(nota_trimestral) as promedio 
            FROM notas 
            WHERE trimestre = 1 
            GROUP BY area
        `);

        // Estos datos (promedios) son los que React usará para dibujar el Chart.js o Recharts.
        res.json(promedios);

    } catch (err) {
        res.status(500).json({ mensaje: "Error al obtener datos para el gráfico" });
    }
};

// Obtener estadísticas por semestre y notas de estudiantes
export const obtenerEstadisticasPorSemestre = async (req, res) => {
    try {
        const [estadisticas] = await db.query(`
            SELECT 
                e.id as idEstudiante,
                e.apellidos_nombres,
                e.curso,
                n.trimestre as semestre,
                n.area,
                n.nota_trimestral,
                n.cualitativo,
                n.prom_ser,
                n.prom_saber,
                n.prom_hacer,
                n.prom_decidir
            FROM estudiante e
            LEFT JOIN notas n ON e.id = n.idEstudiante
            WHERE e.activo = 1
            ORDER BY e.apellidos_nombres, n.trimestre, n.area
        `);

        // Agrupar por estudiante y semestre
        const datosAgrupados = {};
        estadisticas.forEach(item => {
            if (!datosAgrupados[item.idEstudiante]) {
                datosAgrupados[item.idEstudiante] = {
                    id: item.idEstudiante,
                    nombre: item.apellidos_nombres,
                    curso: item.curso,
                    semestres: {}
                };
            }
            if (item.semestre) {
                if (!datosAgrupados[item.idEstudiante].semestres[item.semestre]) {
                    datosAgrupados[item.idEstudiante].semestres[item.semestre] = [];
                }
                datosAgrupados[item.idEstudiante].semestres[item.semestre].push({
                    area: item.area,
                    notaTrimestral: item.nota_trimestral,
                    cualitativo: item.cualitativo,
                    promSer: item.prom_ser,
                    promSaber: item.prom_saber,
                    promHacer: item.prom_hacer,
                    promDecidir: item.prom_decidir
                });
            }
        });

        res.json(Object.values(datosAgrupados));
    } catch (err) {
        console.error("Error al obtener estadísticas por semestre:", err);
        res.status(500).json({ mensaje: "Error al obtener estadísticas por semestre" });
    }
};

// Generar reporte PDF general (todos los estudiantes)
export const generarReportePDFGeneral = async (req, res) => {
    try {
        const [estudiantes] = await db.query(`
            SELECT 
                e.id,
                e.apellidos_nombres,
                e.curso,
                AVG(n.nota_trimestral) as promedio_general
            FROM estudiante e
            LEFT JOIN notas n ON e.id = n.idEstudiante
            WHERE e.activo = 1
            GROUP BY e.id, e.apellidos_nombres, e.curso
            ORDER BY e.apellidos_nombres
        `);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_general_estudiantes_${Date.now()}.pdf"`);

        doc.pipe(res);

        // Título
        doc.fontSize(18).text('REPORTE GENERAL DE ESTUDIANTES', { align: 'center' });
        doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
        doc.moveDown();

        // Tabla de estudiantes
        doc.fontSize(11).text('Listado de Estudiantes y Promedios Generales:', { underline: true });
        doc.moveDown(0.5);

        estudiantes.forEach((estudiante, index) => {
            doc.fontSize(9);
            doc.text(`${index + 1}. ${estudiante.apellidos_nombres}`);
            doc.text(`   Curso: ${estudiante.curso || 'N/A'} | Promedio General: ${estudiante.promedio_general ? estudiante.promedio_general.toFixed(2) : 'Sin notas'}`, { continued: false });
            doc.moveDown(0.3);
        });

        doc.end();

    } catch (err) {
        console.error("Error al generar reporte PDF general:", err);
        res.status(500).json({ mensaje: "Error al generar el reporte PDF general" });
    }
};

// Obtener notas de detalle para reporte (tabla de notas registradas)
export const obtenerNotasReporte = async (req, res) => {
    try {
        const { idEstudiante, semestre } = req.query;
        
        let query = `
            SELECT 
                e.id as idEstudiante,
                e.apellidos_nombres,
                e.carnet_identidad,
                nd.semestre,
                nd.tipo,
                nd.descripcion,
                nd.nota,
                nd.materia_id
            FROM estudiante e
            LEFT JOIN nota_detalle nd ON e.id = nd.idEstudiante
            WHERE e.activo = 1
        `;
        
        const params = [];
        
        if (idEstudiante) {
            query += ` AND e.id = ?`;
            params.push(idEstudiante);
        }
        
        if (semestre) {
            query += ` AND nd.semestre = ?`;
            params.push(semestre);
        }
        
        query += ` ORDER BY e.apellidos_nombres, nd.semestre, nd.tipo`;
        
        const [notas] = await db.query(query, params);
        
        // Agrupar por estudiante
        const datosAgrupados = {};
        notas.forEach(item => {
            if (!datosAgrupados[item.idEstudiante]) {
                datosAgrupados[item.idEstudiante] = {
                    id: item.idEstudiante,
                    nombres: item.apellidos_nombres,
                    ci: item.carnet_identidad,
                    notas: []
                };
            }
            if (item.semestre) {
                datosAgrupados[item.idEstudiante].notas.push({
                    semestre: item.semestre,
                    tipo: item.tipo,
                    descripcion: item.descripcion,
                    nota: item.nota,
                    materiaId: item.materia_id
                });
            }
        });
        
        res.json(Object.values(datosAgrupados));
    } catch (err) {
        console.error("Error al obtener notas para reporte:", err);
        res.status(500).json({ mensaje: "Error al obtener notas para reporte", error: err.message });
    }
};