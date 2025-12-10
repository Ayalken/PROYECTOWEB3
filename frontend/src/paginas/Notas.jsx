import React, { useState, useEffect } from 'react';
import { api } from '../api/index';
import { getEstudiantes } from '../api/estudiantes';

const Notas = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [notasPorEstudiante, setNotasPorEstudiante] = useState({});
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
    const [trimestre, setTrimestre] = useState(1);
    const [message, setMessage] = useState('');
    const [cargando, setCargando] = useState(false);

    // Subcolumnas dinámicas
    const [tareasActuales, setTareasActuales] = useState(["Tarea 1"]);
    const [proyectosActuales, setProyectosActuales] = useState(["Proyecto 1"]);
    const [examenesActuales, setExamenesActuales] = useState(["Examen 1"]);

    // Reemplazo simplificado: usar las listas locales actuales para evitar inconsistencias
    const tareas = tareasActuales;
    const proyectos = proyectosActuales;
    const examenes = examenesActuales;

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

    // Cargar materias disponibles
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const res = await api.get('/materias');
                setMaterias(res.data || []);
                if ((res.data || []).length > 0 && materiaSeleccionada === null) {
                    setMateriaSeleccionada(res.data[0].id);
                }
            } catch (err) {
                console.warn('No se pudieron cargar materias', err);
            }
        };
        fetchMaterias();
    }, []);

    // Cargar notas cuando cambia área o trimestre
    useEffect(() => {
        const fetchNotas = async () => {
            if (estudiantes.length === 0) return;
            if (!materiaSeleccionada) return; // no cargamos si no hay materia seleccionada
            // Al cambiar materia, iniciamos con vista limpia y cargamos solo notas de esa materia
            setCargando(true);
            try {
                const notasData = {};

                // Obtener todas las notas para cada estudiante
                for (const estudiante of estudiantes) {
                    try {
                        const response = await api.get('/notas-detalle', {
                            params: { idEstudiante: estudiante.id, semestre: trimestre, materia_id: materiaSeleccionada }
                        });

                        if (response.data && Array.isArray(response.data)) {
                            // Agrupar notas por tipo y conservar el id y descripción
                            const notasPorTipo = { tareas: [], proyectos: [], examenes: [] };

                            response.data.forEach(nota => {
                                const item = { id: nota.id, descripcion: nota.descripcion, nota: Number(nota.nota) };
                                if (nota.tipo === 'tarea') {
                                    notasPorTipo.tareas.push(item);
                                } else if (nota.tipo === 'proyecto') {
                                    notasPorTipo.proyectos.push(item);
                                } else if (nota.tipo === 'examen') {
                                    notasPorTipo.examenes.push(item);
                                }
                            });

                            // Alinear con las subcolumnas actuales (por descripción)
                            const tareasObjs = tareas.map(t => {
                                const found = notasPorTipo.tareas.find(n => n.descripcion === t);
                                return found ? { id: found.id, descripcion: t, nota: found.nota } : { id: null, descripcion: t, nota: 0 };
                            });
                            const proyectosObjs = proyectos.map(p => {
                                const found = notasPorTipo.proyectos.find(n => n.descripcion === p);
                                return found ? { id: found.id, descripcion: p, nota: found.nota } : { id: null, descripcion: p, nota: 0 };
                            });
                            const examenesObjs = examenes.map(ex => {
                                const found = notasPorTipo.examenes.find(n => n.descripcion === ex);
                                return found ? { id: found.id, descripcion: ex, nota: found.nota } : { id: null, descripcion: ex, nota: 0 };
                            });

                            notasData[estudiante.id] = {
                                tareas: tareasObjs,
                                proyectos: proyectosObjs,
                                examenes: examenesObjs
                            };
                        } else {
                            notasData[estudiante.id] = {
                                tareas: tareas.map(t => ({ id: null, descripcion: t, nota: 0 })),
                                proyectos: proyectos.map(p => ({ id: null, descripcion: p, nota: 0 })),
                                examenes: examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 }))
                            };
                        }
                    } catch (error) {
                        // Estudiante sin notas aún
                        notasData[estudiante.id] = {
                            tareas: tareas.map(t => ({ id: null, descripcion: t, nota: 0 })),
                            proyectos: proyectos.map(p => ({ id: null, descripcion: p, nota: 0 })),
                            examenes: examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 }))
                        };
                    }
                }

                setNotasPorEstudiante(notasData);
            } catch (error) {
                console.log('Error al cargar notas:', error.message);
            } finally {
                setCargando(false);
            }
        };

        fetchNotas();
    }, [areaSeleccionada, trimestre, estudiantes, tareas.length, proyectos.length, examenes.length, materiaSeleccionada]);

    // Funciones para agregar/eliminar subcolumnas
    const agregarTarea = () => {
        const newName = `Tarea ${tareas.length + 1}`;
        setTareasActuales(prev => {
            const next = [...prev, newName];
            // Añadir campo para cada estudiante en el estado de notas
            setNotasPorEstudiante(prevNotas => {
                const copy = { ...prevNotas };
                estudiantes.forEach(s => {
                    if (!copy[s.id]) {
                        copy[s.id] = { tareas: [], proyectos: [], examenes: [] };
                    }
                    const cur = copy[s.id];
                    copy[s.id] = { ...cur, tareas: [...(cur.tareas || []), { id: null, descripcion: newName, nota: 0 }] };
                });
                return copy;
            });
            return next;
        });
    };

    const eliminarTarea = async (idx) => {
        const desc = tareas[idx];
        // eliminar en backend si existe id
        for (const s of estudiantes) {
            const item = (notasPorEstudiante[s.id]?.tareas || [])[idx];
            if (item && item.id) {
                try {
                    await api.delete(`/notas-detalle/${item.id}`);
                } catch (err) {
                    console.warn('No se pudo eliminar nota detalle', err?.message || err);
                }
            }
        }
        // actualizar estado local
        setNotasPorEstudiante(prev => {
            const copy = { ...prev };
            Object.keys(copy).forEach(k => {
                const list = copy[k];
                copy[k] = { ...list, tareas: (list.tareas || []).filter((_, i) => i !== idx) };
            });
            return copy;
        });
        setTareasActuales(prev => prev.filter((_, i) => i !== idx));
    };

    const agregarProyecto = () => {
        const newName = `Proyecto ${proyectos.length + 1}`;
        setProyectosActuales(prev => {
            const next = [...prev, newName];
            setNotasPorEstudiante(prevNotas => {
                const copy = { ...prevNotas };
                estudiantes.forEach(s => {
                    if (!copy[s.id]) copy[s.id] = { tareas: [], proyectos: [], examenes: [] };
                    const cur = copy[s.id];
                    copy[s.id] = { ...cur, proyectos: [...(cur.proyectos || []), { id: null, descripcion: newName, nota: 0 }] };
                });
                return copy;
            });
            return next;
        });
    };

    const eliminarProyecto = async (idx) => {
        for (const s of estudiantes) {
            const item = (notasPorEstudiante[s.id]?.proyectos || [])[idx];
            if (item && item.id) {
                try { await api.delete(`/notas-detalle/${item.id}`); } catch (err) { console.warn(err); }
            }
        }
        setNotasPorEstudiante(prev => {
            const copy = { ...prev };
            Object.keys(copy).forEach(k => {
                const list = copy[k];
                copy[k] = { ...list, proyectos: (list.proyectos || []).filter((_, i) => i !== idx) };
            });
            return copy;
        });
        setProyectosActuales(prev => prev.filter((_, i) => i !== idx));
    };

    const agregarExamen = () => {
        const newName = `Examen ${examenes.length + 1}`;
        setExamenesActuales(prev => {
            const next = [...prev, newName];
            setNotasPorEstudiante(prevNotas => {
                const copy = { ...prevNotas };
                estudiantes.forEach(s => {
                    if (!copy[s.id]) copy[s.id] = { tareas: [], proyectos: [], examenes: [] };
                    const cur = copy[s.id];
                    copy[s.id] = { ...cur, examenes: [...(cur.examenes || []), { id: null, descripcion: newName, nota: 0 }] };
                });
                return copy;
            });
            return next;
        });
    };

    const eliminarExamen = async (idx) => {
        for (const s of estudiantes) {
            const item = (notasPorEstudiante[s.id]?.examenes || [])[idx];
            if (item && item.id) {
                try { await api.delete(`/notas-detalle/${item.id}`); } catch (err) { console.warn(err); }
            }
        }
        setNotasPorEstudiante(prev => {
            const copy = { ...prev };
            Object.keys(copy).forEach(k => {
                const list = copy[k];
                copy[k] = { ...list, examenes: (list.examenes || []).filter((_, i) => i !== idx) };
            });
            return copy;
        });
        setExamenesActuales(prev => prev.filter((_, i) => i !== idx));
    };

    // Obtener nota por descripción
    const obtenerNota = (idEstudiante, tipo, descripcion) => {
        const notas = notasPorEstudiante[idEstudiante] || [];
        const nota = notas.find(n => n.tipo === tipo && n.descripcion === descripcion);
        return nota ? nota.nota : '';
    };

    // Actualizar nota temporal
    const handleChangeNota = (idEstudiante, tipo, descripcion, value) => {
        const notasData = { ...notasPorEstudiante };
        if (!notasData[idEstudiante]) notasData[idEstudiante] = [];

        const index = notasData[idEstudiante].findIndex(n => n.tipo === tipo && n.descripcion === descripcion);
        if (index >= 0) {
            notasData[idEstudiante][index].nota = parseFloat(value) || 0;
        } else {
            notasData[idEstudiante].push({
                idEstudiante,
                semestre: trimestre,
                tipo,
                descripcion,
                nota: parseFloat(value) || 0
            });
        }
        setNotasPorEstudiante(notasData);
    };

    // Actualizar nota usando índices de subcolumnas (tareas/proyectos/examenes)
    const handleNotaDinamica = (idEstudiante, tipoGrupo, idx, value) => {
        const notasData = { ...notasPorEstudiante };
        if (!notasData[idEstudiante]) {
            notasData[idEstudiante] = {
                tareas: tareas.map(t => ({ id: null, descripcion: t, nota: 0 })),
                proyectos: proyectos.map(p => ({ id: null, descripcion: p, nota: 0 })),
                examenes: examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 }))
            };
        }

        const val = value === '' ? 0 : Number(value);

        if (tipoGrupo === 'tareas') {
            const arr = Array.from(notasData[idEstudiante].tareas || tareas.map(t => ({ id: null, descripcion: t, nota: 0 })));
            arr[idx] = { ...arr[idx], nota: val };
            notasData[idEstudiante].tareas = arr;
        } else if (tipoGrupo === 'proyectos') {
            const arr = Array.from(notasData[idEstudiante].proyectos || proyectos.map(p => ({ id: null, descripcion: p, nota: 0 })));
            arr[idx] = { ...arr[idx], nota: val };
            notasData[idEstudiante].proyectos = arr;
        } else if (tipoGrupo === 'examenes') {
            const arr = Array.from(notasData[idEstudiante].examenes || examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 })));
            arr[idx] = { ...arr[idx], nota: val };
            notasData[idEstudiante].examenes = arr;
        }

        setNotasPorEstudiante(notasData);
    };

    // Calcular promedios
    const promedioGrupo = (arr) => {
        if (!arr || arr.length === 0) return 0;
        // arr puede ser array de números o array de objetos {nota}
        const valores = arr.map(x => (typeof x === 'number' ? x : (x?.nota || 0)));
        const sum = valores.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        return valores.length ? sum / valores.length : 0;
    };

    // Guardar nota
    const handleSaveNota = async (idEstudiante) => {
        const notaData = notasPorEstudiante[idEstudiante];
        if (!notaData) return;

        try {
            // Guardar cada tarea, proyecto y examen como registro individual
            const registrosAGuardar = [];

            if (notaData.tareas && Array.isArray(notaData.tareas)) {
                notaData.tareas.forEach((item) => {
                    if (item) {
                        registrosAGuardar.push({
                            id: item.id,
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'tarea',
                            descripcion: item.descripcion,
                            nota: item.nota
                        });
                    }
                });
            }

            if (notaData.proyectos && Array.isArray(notaData.proyectos)) {
                notaData.proyectos.forEach((item) => {
                    if (item) {
                        registrosAGuardar.push({
                            id: item.id,
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'proyecto',
                            descripcion: item.descripcion,
                            nota: item.nota
                        });
                    }
                });
            }

            if (notaData.examenes && Array.isArray(notaData.examenes)) {
                notaData.examenes.forEach((item) => {
                    if (item) {
                        registrosAGuardar.push({
                            id: item.id,
                            idEstudiante,
                            semestre: trimestre,
                            tipo: 'examen',
                            descripcion: item.descripcion,
                            nota: item.nota
                        });
                    }
                });
            }

            // Guardar/actualizar todos los registros
            for (const registro of registrosAGuardar) {
                if (registro.id) {
                    // actualizar
                    await api.put(`/notas-detalle/${registro.id}`, { nota: registro.nota, descripcion: registro.descripcion });
                } else {
                    // crear
                    const res = await api.post('/notas-detalle', {
                        idEstudiante: registro.idEstudiante,
                        semestre: registro.semestre,
                        tipo: registro.tipo,
                        descripcion: registro.descripcion,
                        nota: registro.nota,
                        materia_id: materiaSeleccionada || null
                    });
                    // actualizar el id en el estado si el backend devuelve insertId
                    const insertId = res.data?.insertId || res.data?.id || null;
                    if (insertId) {
                        // buscar y asignar id en notasPorEstudiante
                        setNotasPorEstudiante(prev => {
                            const copy = { ...prev };
                            const list = copy[idEstudiante];
                            if (list) {
                                ['tareas', 'proyectos', 'examenes'].forEach(group => {
                                    if (Array.isArray(list[group])) {
                                        for (let i = 0; i < list[group].length; i++) {
                                            if (!list[group][i].id && list[group][i].descripcion === registro.descripcion) {
                                                list[group][i] = { ...list[group][i], id: insertId };
                                                break;
                                            }
                                        }
                                    }
                                });
                            }
                            return copy;
                        });
                    }
                }
            }

            setMessage(`✅ Notas de ${estudiantes.find(e => e.id === idEstudiante)?.apellidos_nombres} guardadas con éxito.`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.mensaje || error.message;
            console.error("Error detallado:", error.response?.data);
            setMessage(`❌ Error al guardar notas: ${errorMsg}`);
        }
    };

    return (
        <div className="container">
            <h2>📝 Registro de Notas{materiaSeleccionada ? ` - ${materias.find(m => m.id === materiaSeleccionada)?.nombre || ''}` : ''}</h2>
            {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}
            {cargando && <p style={{ color: 'blue' }}>Cargando notas...</p>}

            {/* Controles de Filtro */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <label>Área:</label>
                <select value={areaSeleccionada} onChange={(e) => setAreaSeleccionada(e.target.value)}>
                    {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
                <label>Materia:</label>
                <select value={materiaSeleccionada || ''} onChange={(e) => { setMateriaSeleccionada(e.target.value ? parseInt(e.target.value, 10) : null); setNotasPorEstudiante({}); }}>
                    <option value="">-- Seleccionar materia --</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
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
                        const currentNota = notasPorEstudiante[e.id] || {
                            tareas: tareas.map(t => ({ id: null, descripcion: t, nota: 0 })),
                            proyectos: proyectos.map(p => ({ id: null, descripcion: p, nota: 0 })),
                            examenes: examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 }))
                        };
                        const arrTareas = currentNota.tareas || tareas.map(t => ({ id: null, descripcion: t, nota: 0 }));
                        const arrProyectos = currentNota.proyectos || proyectos.map(p => ({ id: null, descripcion: p, nota: 0 }));
                        const arrExamenes = currentNota.examenes || examenes.map(ex => ({ id: null, descripcion: ex, nota: 0 }));

                        const promTareas = promedioGrupo(arrTareas);
                        const promProyectos = promedioGrupo(arrProyectos);
                        const promExamenes = promedioGrupo(arrExamenes);
                        const promedioSemestre = ((promTareas + promProyectos + promExamenes) / 3).toFixed(2);

                        return (
                            <tr key={e.id}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'left' }}>{e.apellidos_nombres}</td>
                                {tareas.map((_, idx) => (
                                    <td key={`t-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrTareas[idx]?.nota ?? ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'tareas', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                {proyectos.map((_, idx) => (
                                    <td key={`p-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrProyectos[idx]?.nota ?? ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'proyectos', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                {examenes.map((_, idx) => (
                                    <td key={`e-${idx}`}>
                                        <input type="number" className="table-input" min="0" max="100"
                                            value={arrExamenes[idx]?.nota ?? ''}
                                            onChange={ev => handleNotaDinamica(e.id, 'examenes', idx, ev.target.value)}
                                        />
                                    </td>
                                ))}
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promTareas.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promProyectos.toFixed(2)}</td>
                                <td style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>{promExamenes.toFixed(2)}</td>
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