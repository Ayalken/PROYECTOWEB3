import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

const AREAS = ['LENGUAJE', 'MATEMÁTICAS', 'CIENCIAS SOCIALES', 'CIENCIAS NATURALES', 'ARTES PLASTICAS Y VISUALES'];

const Notas = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [notasPorArea, setNotasPorArea] = useState({});
    const [areaSeleccionada, setAreaSeleccionada] = useState(AREAS[0]);
    const [trimestre, setTrimestre] = useState(1);
    const [message, setMessage] = useState('');
    const [cargando, setCargando] = useState(false);

    const getKey = (area, tri) => `${area}_${tri}`;
    const [tareasMap, setTareasMap] = useState({});
    const [proyectosMap, setProyectosMap] = useState({});
    const [examenesMap, setExamenesMap] = useState({});

    const currentKey = getKey(areaSeleccionada, trimestre);
    const tareas = tareasMap[currentKey] || ["Tarea 1"];
    const proyectos = proyectosMap[currentKey] || ["Proyecto 1"];
    const examenes = examenesMap[currentKey] || ["Examen 1"];
    
    // Estado para nota de asistencia (tipo: 'asistencia')
    const [notasAsistencia, setNotasAsistencia] = useState({});

    const setTareas = (arr) => setTareasMap(prev => ({ ...prev, [currentKey]: arr }));
    const setProyectos = (arr) => setProyectosMap(prev => ({ ...prev, [currentKey]: arr }));
    const setExamenes = (arr) => setExamenesMap(prev => ({ ...prev, [currentKey]: arr }));

    // Cargar estudiantes al montar
    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const response = await getEstudiantes();
                setEstudiantes(response.data.filter(e => e.activo === 1));
            } catch (error) {
                console.log('No se pudieron cargar estudiantes');
            }
        };
        fetchEstudiantes();
    }, []);

    // Cargar notas cuando cambia área o trimestre
    useEffect(() => {
        const fetchNotas = async () => {
            if (estudiantes.length === 0) return;

            setCargando(true);
            try {
                const notasData = {};
                const asistenciaData = {};

                // Obtener todas las notas para cada estudiante
                for (const estudiante of estudiantes) {
                    try {
                        const response = await api.get('/notas-detalle', {
                            params: { idEstudiante: estudiante.id, semestre: trimestre }
                        });

                        if (response.data && Array.isArray(response.data)) {
                            // Agrupar notas por tipo
                            const notasPorTipo = { tareas: [], proyectos: [], examenes: [] };
                            const columnasUsadas = { tareas: new Set(), proyectos: new Set(), examenes: new Set() };
                            let notaAsistencia = 0;

                            response.data.forEach(nota => {
                                if (nota.tipo === 'asistencia') {
                                    // Guardar nota de asistencia por separado
                                    notaAsistencia = nota.nota;
                                } else if (nota.tipo === 'tarea') {
                                    notasPorTipo.tareas.push(nota.nota);
                                    columnasUsadas.tareas.add(nota.descripcion);
                                } else if (nota.tipo === 'proyecto') {
                                    notasPorTipo.proyectos.push(nota.nota);
                                    columnasUsadas.proyectos.add(nota.descripcion);
                                } else if (nota.tipo === 'examen') {
                                    notasPorTipo.examenes.push(nota.nota);
                                    columnasUsadas.examenes.add(nota.descripcion);
                                }
                            });

                            notasData[estudiante.id] = notasPorTipo;
                            asistenciaData[estudiante.id] = notaAsistencia;

                            // Actualizar columnas si hay datos guardados
                            if (columnasUsadas.tareas.size > 0) {
                                setTareasMap(prev => ({
                                    ...prev,
                                    [currentKey]: Array.from(columnasUsadas.tareas)
                                }));
                            }
                            if (columnasUsadas.proyectos.size > 0) {
                                setProyectosMap(prev => ({
                                    ...prev,
                                    [currentKey]: Array.from(columnasUsadas.proyectos)
                                }));
                            }
                            if (columnasUsadas.examenes.size > 0) {
                                setExamenesMap(prev => ({
                                    ...prev,
                                    [currentKey]: Array.from(columnasUsadas.examenes)
                                }));
                            }
                        }
                    } catch (error) {
                        // Estudiante sin notas aún
                    }
                }

                setNotasPorArea(prev => ({
                    ...prev,
                    [currentKey]: notasData
                }));
                setNotasAsistencia(asistenciaData);
            } catch (error) {
                console.log('Error al cargar notas:', error.message);
            } finally {
                setCargando(false);
            }
        };

        fetchNotas();
    }, [areaSeleccionada, trimestre, estudiantes, currentKey]);

    // Funciones para agregar/eliminar subcolumnas
    const agregarTarea = () => setTareas([...tareas, `Tarea ${tareas.length + 1}`]);
    const eliminarTarea = (idx) => setTareas(tareas.filter((_, i) => i !== idx));
    const agregarProyecto = () => setProyectos([...proyectos, `Proyecto ${proyectos.length + 1}`]);
    const eliminarProyecto = (idx) => setProyectos(proyectos.filter((_, i) => i !== idx));
    const agregarExamen = () => setExamenes([...examenes, `Examen ${examenes.length + 1}`]);
    const eliminarExamen = (idx) => setExamenes(examenes.filter((_, i) => i !== idx));

    // Manejo de notas dinámicas
    const handleNotaDinamica = (idEstudiante, tipo, idx, value) => {
        const updatedNotasPorArea = { ...notasPorArea };
        if (!updatedNotasPorArea[currentKey]) updatedNotasPorArea[currentKey] = {};
        const currentNota = updatedNotasPorArea[currentKey][idEstudiante] || { tareas: [], proyectos: [], examenes: [] };
        if (!currentNota[tipo]) currentNota[tipo] = [];
        currentNota[tipo][idx] = parseFloat(value) || 0;
        updatedNotasPorArea[currentKey][idEstudiante] = currentNota;
        setNotasPorArea(updatedNotasPorArea);
    };

    // Calcular promedios
    const promedioGrupo = (arr) => {
        if (!arr || arr.length === 0) return 0;
        const sum = arr.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        return arr.length ? sum / arr.length : 0;
    };

    // Guardar nota
    const handleSaveNota = async (idEstudiante) => {
        const notaData = notasPorArea[currentKey] && notasPorArea[currentKey][idEstudiante];
        if (!notaData) return;

        try {
            // Obtener notas previas del estudiante para este semestre
            const previas = await api.get('/notas-detalle', {
                params: { idEstudiante, semestre: trimestre }
            });
            const notasPrevias = Array.isArray(previas.data) ? previas.data : [];

            // Guardar cada tarea, proyecto y examen como registro individual
            const registrosAGuardar = [];

            if (notaData.tareas && Array.isArray(notaData.tareas)) {
                notaData.tareas.forEach((nota, idx) => {
                    if (nota) {
                        registrosAGuardar.push({
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'tarea',
                            descripcion: tareas[idx],
                            nota: nota
                        });
                    }
                });
            }

            if (notaData.proyectos && Array.isArray(notaData.proyectos)) {
                notaData.proyectos.forEach((nota, idx) => {
                    if (nota) {
                        registrosAGuardar.push({
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'proyecto',
                            descripcion: proyectos[idx],
                            nota: nota
                        });
                    }
                });
            }

            if (notaData.examenes && Array.isArray(notaData.examenes)) {
                notaData.examenes.forEach((nota, idx) => {
                    if (nota) {
                        registrosAGuardar.push({
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'examen',
                            descripcion: examenes[idx],
                            nota: nota
                        });
                    }
                });
            }

            // Guardar/actualizar todos los registros
            for (const registro of registrosAGuardar) {
                // Buscar si existe una nota con el mismo tipo y descripción
                const existe = notasPrevias.find(n => 
                    n.tipo === registro.tipo && 
                    n.descripcion === registro.descripcion
                );

                if (existe) {
                    // Actualizar
                    await api.put(`/notas-detalle/${existe.id}`, { nota: registro.nota });
                } else {
                    // Crear
                    await api.post('/notas-detalle', registro);
                }
            }

            setMessage(`✅ Notas de ${estudiantes.find(e => e.id === idEstudiante)?.apellidos_nombres} guardadas con éxito.`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.mensaje || error.message;
            console.error("Error al guardar:", error);
            setMessage(`❌ Error al guardar notas: ${errorMsg}`);
        }
    };

    return (
        <div className="container">
            <h2>📝 Registro de Notas - {areaSeleccionada}</h2>
            {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}
            {cargando && <p style={{ color: 'blue' }}>Cargando notas...</p>}

            {/* Controles de Filtro */}
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

            {/* Controles para agregar/eliminar subcolumnas */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
                <div>
                    <b>Tareas:</b>
                    <button onClick={agregarTarea} style={{ marginLeft: 8 }}>+ Tarea</button>
                </div>
                <div>
                    <b>Proyectos:</b>
                    <button onClick={agregarProyecto} style={{ marginLeft: 8 }}>+ Proyecto</button>
                </div>
                <div>
                    <b>Exámenes:</b>
                    <button onClick={agregarExamen} style={{ marginLeft: 8 }}>+ Examen</button>
                </div>
            </div>

            <table style={{ minWidth: '1200px' }}>
                <thead>
                    <tr>
                        <th rowSpan="2">N°</th>
                        <th rowSpan="2" style={{ textAlign: 'left' }}>Apellidos y Nombres</th>
                        <th colSpan={tareas.length}>Tareas</th>
                        <th colSpan={proyectos.length}>Proyectos</th>
                        <th colSpan={examenes.length}>Exámenes</th>
                        <th rowSpan="2" style={{ backgroundColor: '#e0f7fa' }}>Prom. Tareas</th>
                        <th rowSpan="2" style={{ backgroundColor: '#e0f7fa' }}>Prom. Proy.</th>
                        <th rowSpan="2" style={{ backgroundColor: '#e0f7fa' }}>Prom. Exam.</th>
                        <th rowSpan="2" style={{ backgroundColor: '#fff3e0' }}>Asistencia</th>
                        <th rowSpan="2" style={{ backgroundColor: '#b2ebf2' }}>Promedio Semestre</th>
                        <th rowSpan="2">Acciones</th>
                    </tr>
                    <tr>
                        {tareas.map((t, idx) => (
                            <th key={`t-${idx}`}>
                                {t}
                                <button onClick={() => eliminarTarea(idx)} style={{ marginLeft: 4, color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                            </th>
                        ))}
                        {proyectos.map((p, idx) => (
                            <th key={`p-${idx}`}>
                                {p}
                                <button onClick={() => eliminarProyecto(idx)} style={{ marginLeft: 4, color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                            </th>
                        ))}
                        {examenes.map((ex, idx) => (
                            <th key={`e-${idx}`}>
                                {ex}
                                <button onClick={() => eliminarExamen(idx)} style={{ marginLeft: 4, color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e, index) => {
                        const currentNota = (notasPorArea[currentKey] && notasPorArea[currentKey][e.id]) || { tareas: [], proyectos: [], examenes: [] };
                        const arrTareas = currentNota.tareas || Array(tareas.length).fill(0);
                        const arrProyectos = currentNota.proyectos || Array(proyectos.length).fill(0);
                        const arrExamenes = currentNota.examenes || Array(examenes.length).fill(0);

                        const promTareas = promedioGrupo(arrTareas);
                        const promProyectos = promedioGrupo(arrProyectos);
                        const promExamenes = promedioGrupo(arrExamenes);
                        const notaAsistencia = notasAsistencia[e.id] || 0;
                        // Promedio final: (promTareas + promProyectos + promExamenes) / 3 + nota de asistencia
                        const promedioSemestre = ((promTareas + promProyectos + promExamenes) / 3 + notaAsistencia).toFixed(2);

                        return (
                            <tr key={e.id}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'left' }}>{e.apellidos_nombres}</td>
                                {tareas.map((_, idx) => (
                                    <td key={`t-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrTareas[idx] || ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'tareas', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                {proyectos.map((_, idx) => (
                                    <td key={`p-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrProyectos[idx] || ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'proyectos', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                {examenes.map((_, idx) => (
                                    <td key={`e-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrExamenes[idx] || ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'examenes', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promTareas.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promProyectos.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promExamenes.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#fff3e0', fontWeight: 'bold' }}>{notaAsistencia.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#b2ebf2', fontWeight: 'bold' }}>{promedioSemestre}</td>
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
