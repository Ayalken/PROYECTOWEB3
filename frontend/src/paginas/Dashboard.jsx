import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [chartData, setChartData] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);
    const [estadisticasPorSemestre, setEstadisticasPorSemestre] = useState([]);
    const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

    const generarLibretaPDF = (idEstudiante, nombre) => {
        window.open(`http://localhost:3000/reportes/pdf/libreta/${idEstudiante}`, '_blank');
        alert(`Generando libreta para ${nombre}. Revise su carpeta de descargas.`);
    };

    const generarReportePDFGeneral = () => {
        window.open(`http://localhost:3000/reportes/pdf/general`, '_blank');
        alert('Generando reporte PDF general. Revise su carpeta de descargas.');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener gráfico de aprovechamiento
                const resReportes = await api.get('/reportes/datos/aprovechamiento');
                const datos = resReportes.data;

                setChartData({
                    labels: datos.map(item => item.area),
                    datasets: [
                        {
                            label: 'Promedio Trimestral (1er Trimestre)',
                            data: datos.map(item => item.promedio),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

                // Obtener estudiantes
                const resEstudiantes = await getEstudiantes();
                setEstudiantes(resEstudiantes.data.filter(e => e.activo === 1));

                // Obtener estadísticas por semestre
                const resEstadisticas = await api.get('/reportes/datos/por-semestre');
                setEstadisticasPorSemestre(resEstadisticas.data);

            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
                setChartData(null);
            }
        };
        fetchData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Aprovechamiento Académico Promedio por Área' },
        },
        scales: {
            y: {
                min: 0,
                max: 110,
                title: { display: true, text: 'Nota Promedio' }
            }
        }
    };

    // Obtener semestres únicos disponibles
    const semestresDisponibles = [...new Set(
        estadisticasPorSemestre.flatMap(est => 
            Object.keys(est.semestres).map(s => parseInt(s))
        )
    )].sort();

    // Filtrar estudiantes para el semestre seleccionado
    const estudiantesFiltrados = semestreSeleccionado 
        ? estadisticasPorSemestre.filter(est => est.semestres[semestreSeleccionado])
        : [];

    return (
        <div className="container">
            <h2>📊 Panel de Control y Reportes</h2>

            <div style={{ width: '70%', margin: '20px auto' }}>
                {chartData ?
                    <>
                        <Bar options={options} data={chartData} />
                    </>
                    : <p>Cargando datos estadísticos...</p>
                }
            </div>

            <hr />

            {/* --- Estadísticas por Semestre --- */}
            <h3 style={{ marginTop: '30px' }}>📈 Estadísticas por Semestre</h3>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="semestre-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                    Seleccionar Semestre:
                </label>
                <select
                    id="semestre-select"
                    value={semestreSeleccionado || ''}
                    onChange={(e) => setSemestreSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                >
                    <option value="">-- Seleccione un semestre --</option>
                    {semestresDisponibles.map(sem => (
                        <option key={sem} value={sem}>Semestre {sem}</option>
                    ))}
                </select>
            </div>

            {semestreSeleccionado && estudiantesFiltrados.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Estudiante</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Curso</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Área</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Nota</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Cualitativo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estudiantesFiltrados.map(est => (
                            est.semestres[semestreSeleccionado].map((nota, idx) => (
                                <tr key={`${est.id}-${idx}`}>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{est.nombre}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{est.curso}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{nota.area}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{nota.notaTrimestral}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{nota.cualitativo || 'N/A'}</td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            )}

            {semestreSeleccionado && estudiantesFiltrados.length === 0 && (
                <p style={{ color: '#999', marginBottom: '30px' }}>No hay datos disponibles para el semestre seleccionado.</p>
            )}

            <hr />

            {/* --- Generación de Reporte PDF General --- */}
            <h3 style={{ marginTop: '30px' }}>📄 Reporte General</h3>
            <button 
                onClick={generarReportePDFGeneral}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '30px'
                }}
            >
                📥 Descargar Reporte PDF General
            </button>

            <hr />

            {/* --- Generación de Reporte Individual (Libreta PDF) --- */}
            <h3 style={{ marginTop: '30px' }}>📝 Generación de Libretas Individuales (PDF)</h3>
            <table style={{ width: '500px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Estudiante</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map(e => (
                        <tr key={e.id}>
                            <td style={{ textAlign: 'left' }}>{e.apellidos_nombres}</td>
                            <td>
                                <button onClick={() => generarLibretaPDF(e.id, e.apellidos_nombres)}>
                                    Descargar Libreta PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;