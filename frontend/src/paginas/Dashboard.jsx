// /frontend/src/paginas/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

// Registrar los elementos de ChartJS (necesario para React)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [chartData, setChartData] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);

    // Función para generar el PDF (Requisito)
    const generarLibretaPDF = (idEstudiante, nombre) => {
        // Llama directamente al endpoint de descarga del backend
        window.open(`http://localhost:3000/reportes/pdf/libreta/${idEstudiante}`, '_blank');
        alert(`Generando libreta para ${nombre}. Revise su carpeta de descargas.`);
    };

    // Cargar datos para el gráfico y lista de estudiantes
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtener datos para el gráfico (Asumiendo que es el promedio del 1er trimestre)
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

                // 2. Obtener lista de estudiantes para el reporte individual
                const resEstudiantes = await getEstudiantes();
                setEstudiantes(resEstudiantes.data.filter(e => e.activo === 1));

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
                max: 110, // Máximo de nota (100 base + 10 autoevaluación)
                title: { display: true, text: 'Nota Promedio' }
            }
        }
    };

    return (
        <div className="container">
            <h2>📊 Dashboard y Reportes</h2>

            <div style={{ width: '70%', margin: '20px auto' }}>
                {chartData ?
                    <>
                        <Bar options={options} data={chartData} />
                    </>
                    : <p>Cargando datos estadísticos...</p>
                }
            </div>

            <hr />

            {/* --- Generación de Reporte Individual (Libreta PDF) --- */}
            <h3 style={{ marginTop: '30px' }}>Generación de Libretas Individuales (PDF)</h3>
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