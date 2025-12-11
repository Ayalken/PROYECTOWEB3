import React, { useState, useEffect } from 'react';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

const Reportes = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [notasReporte, setNotasReporte] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            const response = await getEstudiantes();
            setEstudiantes(response.data.filter(e => e.activo === 1));
        } catch (error) {
            console.error('Error cargando estudiantes:', error);
        }
    };

    const cargarNotasReporte = async () => {
        if (!estudianteSeleccionado && !semestreSeleccionado) {
            setNotasReporte([]);
            return;
        }

        setLoading(true);
        try {
            const params = {};
            if (estudianteSeleccionado) params.idEstudiante = estudianteSeleccionado;
            if (semestreSeleccionado) params.semestre = semestreSeleccionado;

            const response = await api.get('/reportes/notas', { params });
            setNotasReporte(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error cargando notas de reporte:', error);
            setNotasReporte([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarNotasReporte();
    }, [estudianteSeleccionado, semestreSeleccionado]);

    const calcularPromedios = (notas) => {
        if (!notas || notas.length === 0) return { promedio: 0, tareas: 0, proyectos: 0, examenes: 0, asistencia: 0 };

        const tareas = notas.filter(n => n.tipo === 'tarea').map(n => parseFloat(n.nota) || 0);
        const proyectos = notas.filter(n => n.tipo === 'proyecto').map(n => parseFloat(n.nota) || 0);
        const examenes = notas.filter(n => n.tipo === 'examen').map(n => parseFloat(n.nota) || 0);
        const asistencia = notas.find(n => n.tipo === 'asistencia');

        const promTareas = tareas.length > 0 ? tareas.reduce((a, b) => a + b, 0) / tareas.length : 0;
        const promProyectos = proyectos.length > 0 ? proyectos.reduce((a, b) => a + b, 0) / proyectos.length : 0;
        const promExamenes = examenes.length > 0 ? examenes.reduce((a, b) => a + b, 0) / examenes.length : 0;
        const notaAsistencia = asistencia ? parseFloat(asistencia.nota) || 0 : 0;

        const promedio = ((promTareas + promProyectos + promExamenes) / 3 + notaAsistencia).toFixed(2);

        return {
            promedio,
            tareas: promTareas.toFixed(2),
            proyectos: promProyectos.toFixed(2),
            examenes: promExamenes.toFixed(2),
            asistencia: notaAsistencia.toFixed(2)
        };
    };

    return (
        <div className="container">
            <h2>📊 Reporte de Notas</h2>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <label>Estudiante:</label>
                    <select
                        value={estudianteSeleccionado || ''}
                        onChange={(e) => setEstudianteSeleccionado(e.target.value ? parseInt(e.target.value, 10) : null)}
                        style={{ marginLeft: '10px', padding: '8px' }}
                    >
                        <option value="">-- Todos los estudiantes --</option>
                        {estudiantes.map(est => (
                            <option key={est.id} value={est.id}>
                                {est.apellidos_nombres} ({est.carnet_identidad})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Semestre/Trimestre:</label>
                    <select
                        value={semestreSeleccionado || ''}
                        onChange={(e) => setSemestreSeleccionado(e.target.value ? parseInt(e.target.value, 10) : null)}
                        style={{ marginLeft: '10px', padding: '8px' }}
                    >
                        <option value="">-- Todos los semestres --</option>
                        <option value={1}>Primer Trimestre</option>
                        <option value={2}>Segundo Trimestre</option>
                        <option value={3}>Tercer Trimestre</option>
                    </select>
                </div>
            </div>

            {loading && <p style={{ color: 'blue' }}>Cargando reportes...</p>}

            {/* Tabla de Reportes */}
            {notasReporte.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>N°</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Estudiante</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>CI</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Semestre</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Tipo</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Descripción</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notasReporte.map((estudiante, idxEst) =>
                                estudiante.notas && estudiante.notas.length > 0 ? (
                                    estudiante.notas.map((nota, idxNota) => (
                                        <tr key={`${idxEst}-${idxNota}`}>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                                {idxNota === 0 ? idxEst + 1 : ''}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                                {idxNota === 0 ? estudiante.nombres : ''}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                                {idxNota === 0 ? estudiante.ci : ''}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                                {nota.semestre || '-'}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 
                                                        nota.tipo === 'tarea' ? '#e3f2fd' :
                                                        nota.tipo === 'proyecto' ? '#f3e5f5' :
                                                        nota.tipo === 'examen' ? '#fff3e0' :
                                                        nota.tipo === 'asistencia' ? '#e8f5e9' : '#f5f5f5'
                                                }}>
                                                    {nota.tipo || '-'}
                                                </span>
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                                {nota.descripcion || '-'}
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                                {nota.nota !== null ? parseFloat(nota.nota).toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr key={idxEst}>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{idxEst + 1}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{estudiante.nombres}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{estudiante.ci}</td>
                                        <td colSpan="4" style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', color: '#999' }}>
                                            Sin notas registradas
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>
                    {loading ? 'Cargando...' : 'No hay notas para mostrar'}
                </p>
            )}

            {/* Resumen de Promedios (si está filtrado por un estudiante) */}
            {estudianteSeleccionado && notasReporte.length > 0 && (
                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h3>📈 Resumen de Promedios por Semestre</h3>
                    {[1, 2, 3].map(sem => {
                        const notasSemestre = notasReporte[0]?.notas?.filter(n => n.semestre === sem) || [];
                        if (notasSemestre.length === 0) return null;

                        const promedios = calcularPromedios(notasSemestre);
                        return (
                            <div key={`resumen-${sem}`} style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                                <h4>Semestre {sem}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                    <div>
                                        <strong>Prom. Tareas:</strong> {promedios.tareas}
                                    </div>
                                    <div>
                                        <strong>Prom. Proyectos:</strong> {promedios.proyectos}
                                    </div>
                                    <div>
                                        <strong>Prom. Exámenes:</strong> {promedios.examenes}
                                    </div>
                                    <div>
                                        <strong>Asistencia:</strong> {promedios.asistencia}
                                    </div>
                                    <div style={{ backgroundColor: '#b2ebf2', padding: '10px', borderRadius: '4px' }}>
                                        <strong>Promedio Semestre:</strong> {promedios.promedio}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Reportes;
