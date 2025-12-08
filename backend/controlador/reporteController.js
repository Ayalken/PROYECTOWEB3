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