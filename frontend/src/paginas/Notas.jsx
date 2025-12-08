import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

const AREAS = ['LENGUAJE', 'MATEMÁTICAS', 'CIENCIAS SOCIALES', 'CIENCIAS NATURALES', 'ARTES PLASTICAS Y VISUALES'];

const Notas = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [notas, setNotas] = useState({});
    const [areaSeleccionada, setAreaSeleccionada] = useState(AREAS[0]);
    const [trimestre, setTrimestre] = useState(1);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const response = await getEstudiantes();
                setEstudiantes(response.data.filter(e => e.activo === 1));
            } catch (error) {
                setMessage('Error al cargar estudiantes para el registro de notas.');
            }
        };
        fetchEstudiantes();
    }, []);

    const fetchNotas = useCallback(async () => {
        if (estudiantes.length === 0) return;
        try {
            const response = await api.get('/notas', {
                params: { area: areaSeleccionada, trimestre: trimestre }
            });
            const notasMap = response.data.reduce((acc, nota) => {
                acc[nota.idEstudiante] = nota;
                return acc;
            }, {});
            setNotas(notasMap);
        } catch (error) {
            setMessage('Error al cargar notas.');
        }
    }, [areaSeleccionada, trimestre, estudiantes]);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    const handleNotaChange = (idEstudiante, field, value) => {
        const numericValue = parseFloat(value) || 0;

        const updatedNotas = { ...notas };

        const currentNota = updatedNotas[idEstudiante] ||
            { idEstudiante, area: areaSeleccionada, trimestre, nota_trimestral: 0, prom_ser: 0, prom_saber: 0, prom_hacer: 0, prom_decidir: 0 };

        currentNota[field] = numericValue;

        const total =
            currentNota.prom_ser +
            currentNota.prom_saber +
            currentNota.prom_hacer +
            currentNota.prom_decidir;

        currentNota.nota_trimestral = total;

        updatedNotas[idEstudiante] = currentNota;
        setNotas(updatedNotas);
    };

    const handleSaveNota = async (idEstudiante) => {
        const notaData = notas[idEstudiante];
        if (!notaData) return;

        try {
            if (notaData.id) {
                await api.put(`/notas/${notaData.id}`, notaData);
            } else {
                await api.post('/notas', notaData);
            }
            setMessage(`Notas de ${estudiantes.find(e => e.id === idEstudiante)?.apellidos_nombres} guardadas con éxito.`);
            fetchNotas();
        } catch (error) {
            setMessage(`Error al guardar notas: ${error.response?.data?.mensaje || 'Verifique los datos y asegure que no excedan el máximo (Ser: 35, Saber: 35, Hacer: 30, Decidir: 10). T. Total: 110.'}`);
        }
    };

    return (
        <div className="container">
            <h2>📝 Registro de Notas - {areaSeleccionada}</h2>
            {message && <p className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</p>}

            {/* --- Controles de Filtro --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <label>Área:</label>
                <select value={areaSeleccionada} onChange={(e) => setAreaSeleccionada(e.target.value)}>
                    {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>

                <label>Trimestre:</label>
                <select value={trimestre} onChange={(e) => setTrimestre(parseInt(e.target.value))}>
                    <option value={1}>Primer Trimestre</option>
                    <option value={2}>Segundo Trimestre</option>
                    <option value={3}>Tercer Trimestre</option>
                </select>
            </div>

            {/* --- Tabla de Registro (Simulando la estructura del Excel) --- */}
            <table style={{ minWidth: '1000px' }}>
                <thead>
                    <tr>
                        <th rowSpan="2" style={{ width: '30px' }}>N°</th>
                        <th rowSpan="2" style={{ width: '250px', textAlign: 'left' }}>Apellidos y Nombres</th>
                        <th colSpan="1">SER (35)</th>
                        <th colSpan="1">SABER (35)</th>
                        <th colSpan="1">HACER (30)</th>
                        <th colSpan="1">DECIDIR (10)</th>
                        <th rowSpan="2" style={{ backgroundColor: '#e0f7fa' }}>NOTA TRIM. (110)</th>
                        <th rowSpan="2">Acciones</th>
                    </tr>
                    <tr>
                        <th>Prom. SER</th>
                        <th>Prom. SABER</th>
                        <th>Prom. HACER</th>
                        <th>Prom. DECIDIR</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e, index) => {
                        const currentNota = notas[e.id] || {};
                        const notaTotal = currentNota.nota_trimestral || 0;

                        return (
                            <tr key={e.id} style={notaTotal > 51 ? { backgroundColor: '#e6ffe6' } : {}}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'left' }}>{e.apellidos_nombres}</td>

                                {/* SER */}
                                <td><input type="number" className="table-input" min="0" max="35" value={currentNota.prom_ser || ''} onChange={(ev) => handleNotaChange(e.id, 'prom_ser', ev.target.value)} /></td>

                                {/* SABER */}
                                <td><input type="number" className="table-input" min="0" max="35" value={currentNota.prom_saber || ''} onChange={(ev) => handleNotaChange(e.id, 'prom_saber', ev.target.value)} /></td>

                                {/* HACER */}
                                <td><input type="number" className="table-input" min="0" max="30" value={currentNota.prom_hacer || ''} onChange={(ev) => handleNotaChange(e.id, 'prom_hacer', ev.target.value)} /></td>

                                {/* DECIDIR (Autoevaluación) */}
                                <td><input type="number" className="table-input" min="0" max="10" value={currentNota.prom_decidir || ''} onChange={(ev) => handleNotaChange(e.id, 'prom_decidir', ev.target.value)} /></td>

                                {/* NOTA TRIMESTRAL (CÁLCULO) */}
                                <td style={{ fontWeight: 'bold', backgroundColor: '#e0f7fa' }}>{notaTotal.toFixed(2)}</td>

                                <td>
                                    <button onClick={() => handleSaveNota(e.id)}>Guardar</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Notas;