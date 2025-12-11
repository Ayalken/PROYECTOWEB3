import React, { useState, useEffect } from 'react';
import { api } from '../api/index';

const Asistencia = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [fechas, setFechas] = useState([]);
    const [asistenciaRegistrada, setAsistenciaRegistrada] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [trimestre, setTrimestre] = useState(1);
    const idDocente = localStorage.getItem('docente_id') || '1';

    useEffect(() => {
        cargarEstudiantes();
        cargarFechasGuardadas();
    }, []);

    // Cargar fechas guardadas en localStorage (persistencia simple)
    const cargarFechasGuardadas = () => {
        const guardadas = localStorage.getItem('asist_fechas');
        if (guardadas) {
            setFechas(JSON.parse(guardadas));
        }
    };

    // Guardar fechas en localStorage
    const guardarFechas = (nuevasFechas) => {
        setFechas(nuevasFechas);
        localStorage.setItem('asist_fechas', JSON.stringify(nuevasFechas));
        cargarAsistenciaDelPeriodo(nuevasFechas);
    };

    const cargarEstudiantes = async () => {
        try {
            const response = await api.get('/estudiantes');
            setEstudiantes(response.data);
        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            setMessage('❌ Error al cargar estudiantes');
        }
    };

    const cargarAsistenciaDelPeriodo = async (fechasParam) => {
        const fechasCargar = fechasParam || fechas;
        if (!fechasCargar.length) return;
        try {
            setLoading(true);
            // Traer todos los registros de esas fechas
            const response = await api.get('/asistencia/fecha-docente', {
                params: {
                    fechas: fechasCargar.join(','),
                    idDocente
                }
            });
            // Convertir array a objeto anidado: { idEstudiante: { fecha: { estado, id } } }
            const mapa = {};
            response.data.forEach(asist => {
                if (!mapa[asist.idEstudiante]) {
                    mapa[asist.idEstudiante] = {};
                }
                mapa[asist.idEstudiante][asist.fecha] = {
                    id: asist.id,
                    estado: asist.estado
                };
            });
            setAsistenciaRegistrada(mapa);
        } catch (error) {
            console.error('Error cargando asistencia:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarFecha = (idEstudiante, fecha, valor) => {
        setAsistenciaRegistrada({
            ...asistenciaRegistrada,
            [idEstudiante]: {
                ...asistenciaRegistrada[idEstudiante],
                [fecha]: {
                    ...asistenciaRegistrada[idEstudiante]?.[fecha],
                    estado: valor
                }
            }
        });
    };

    const handleGuardarFecha = async (idEstudiante, fecha) => {
        const asist = asistenciaRegistrada[idEstudiante]?.[fecha];
        if (!asist?.estado) {
            setMessage('⚠️ Selecciona un estado');
            setTimeout(() => setMessage(''), 2000);
            return;
        }
        try {
            if (asist.id) {
                await api.put(`/asistencia/${asist.id}`, {
                    idEstudiante,
                    idDocente,
                    fecha,
                    estado: asist.estado,
                    observaciones: ''
                });
            } else {
                const response = await api.post('/asistencia', {
                    idEstudiante,
                    idDocente,
                    fecha,
                    estado: asist.estado,
                    observaciones: ''
                });
                setAsistenciaRegistrada({
                    ...asistenciaRegistrada,
                    [idEstudiante]: {
                        ...asistenciaRegistrada[idEstudiante],
                        [fecha]: {
                            ...asist,
                            id: response.data.resultado?.id || response.data.id
                        }
                    }
                });
            }
            setMessage('✅ Guardado');
            setTimeout(() => setMessage(''), 1500);
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.mensaje || 'Error'));
        }
    };

    const handleEliminar = async (idEstudiante, fecha) => {
        const asist = asistenciaRegistrada[idEstudiante]?.[fecha];
        if (!asist?.id) return;

        if (confirm('¿Eliminar este registro?')) {
            try {
                await api.delete(`/asistencia/${asist.id}`);

                const nuevoRegistro = { ...asistenciaRegistrada };
                delete nuevoRegistro[idEstudiante][fecha];
                setAsistenciaRegistrada(nuevoRegistro);
                setMessage('✅ Eliminado');
                setTimeout(() => setMessage(''), 1500);
            } catch (error) {
                setMessage('❌ Error al eliminar');
            }
        }
    };

    // Mapear estado a letra
    const getLetra = (estado) => {
        switch (estado) {
            case 'presente':
                return 'P';
            case 'retardo':
                return 'A';
            case 'ausente':
                return 'L';
            default:
                return '';
        }
    };

    // Mapear letra a estado
    const getEstadoDelLetra = (letra) => {
        switch (letra) {
            case 'P':
                return 'presente';
            case 'A':
                return 'retardo';
            case 'L':
                return 'ausente';
            default:
                return '';
        }
    };

    // Color por estado
    const getColorLetra = (letra) => {
        switch (letra) {
            case 'P':
                return '#28a745'; // Verde
            case 'A':
                return '#ffc107'; // Amarillo
            case 'L':
                return '#dc3545'; // Rojo
            default:
                return '#6c757d'; // Gris
        }
    };

    // Contar asistencias por estudiante
    const contarAsistencias = (idEstudiante) => {
        const registros = asistenciaRegistrada[idEstudiante] || {};
        let presentes = 0, atrasos = 0, licencias = 0;

        Object.values(registros).forEach(reg => {
            if (reg.estado === 'presente') presentes++;
            else if (reg.estado === 'retardo') atrasos++;
            else if (reg.estado === 'ausente') licencias++;
        });

        return { presentes, atrasos, licencias };
    };

    // Formato fecha para mostrar
    const formatearFecha = (fecha) => {
        const d = new Date(fecha + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { month: 'short', day: '2-digit' });
    };


    // Agregar nueva fecha como columna
    const handleAgregarFecha = () => {
        if (!nuevaFecha || fechas.includes(nuevaFecha)) return;
        const nuevasFechas = [...fechas, nuevaFecha].sort();
        guardarFechas(nuevasFechas);
        setNuevaFecha('');
    };

    // Aplicar asistencia como nota: convierte asistencias en entradas en nota_detalle (tipo 'asistencia')
    // con peso ponderado del 10% sobre 100 (es decir, máximo 10 puntos)
    const aplicarAsistenciaComoNota = async () => {
        if (!fechas || fechas.length === 0) {
            setMessage('⚠️ No hay fechas seleccionadas para calcular asistencia');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (!confirm('¿Desea convertir la asistencia del período seleccionado en notas para el trimestre ' + trimestre + '?\nSe reemplazarán las notas de tipo "asistencia" del mismo trimestre.')) return;

        setLoading(true);
        try {
            const PESO_ASISTENCIA = 0.10; // 10% del total semestral
            
            for (const est of estudiantes) {
                const registros = asistenciaRegistrada[est.id] || {};
                let presentes = 0, atrasos = 0, licencias = 0;
                Object.values(registros).forEach(r => {
                    if (r.estado === 'presente') presentes++;
                    else if (r.estado === 'retardo') atrasos++;
                    else if (r.estado === 'ausente') licencias++;
                });
                const total = presentes + atrasos + licencias;
                if (total === 0) continue; // nada que convertir

                // Calcular puntaje: presente=1, retardo=0.5, ausente=0
                const scorePercent = ((presentes + 0.5 * atrasos) / total) * 100;
                // Aplicar peso: si máximo es 100% en asistencia y vale 10%, entonces
                // guardamos: scorePercent * PESO_ASISTENCIA (p. ej. 90% * 0.10 = 9 puntos)
                const notaPonderada = Math.round((scorePercent * PESO_ASISTENCIA) * 100) / 100;
                const descripcion = `Asistencia (${fechas[0]} - ${fechas[fechas.length - 1]})`;

                // Eliminar notas de tipo 'asistencia' previas para este estudiante y trimestre
                try {
                    const existing = await api.get('/notas-detalle', { params: { idEstudiante: est.id, semestre: trimestre } });
                    if (Array.isArray(existing.data)) {
                        for (const n of existing.data) {
                            if (n.tipo === 'asistencia') {
                                try { await api.delete(`/notas-detalle/${n.id}`); } catch (err) { /* ignore */ }
                            }
                        }
                    }
                } catch (err) {
                    // ignorar errores al listar
                }

                // Crear nueva nota de asistencia (ponderada: máximo 10 puntos)
                try {
                    await api.post('/notas-detalle', {
                        idEstudiante: est.id,
                        semestre: trimestre,
                        tipo: 'asistencia',
                        descripcion,
                        nota: notaPonderada,
                        materia_id: null
                    });
                } catch (err) {
                    console.warn('No se pudo crear nota de asistencia para', est.id, err?.message || err);
                }
            }

            setMessage('✅ Asistencia aplicada como nota (10% del total)');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error aplicando asistencia como nota', error);
            setMessage('❌ Error al aplicar asistencia como nota');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar columna de fecha
    const handleEliminarColumna = (fecha) => {
        const nuevasFechas = fechas.filter(f => f !== fecha);
        guardarFechas(nuevasFechas);
        // Opcional: limpiar registros de esa fecha
        const nuevoRegistro = { ...asistenciaRegistrada };
        Object.keys(nuevoRegistro).forEach(idEst => {
            if (nuevoRegistro[idEst]) {
                delete nuevoRegistro[idEst][fecha];
            }
        });
        setAsistenciaRegistrada(nuevoRegistro);
    };

    return (
        <div className="container">
            <h1>📋 Registro de Asistencia por Fechas</h1>

            {/* Agregar fecha manualmente */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <input
                    type="date"
                    value={nuevaFecha}
                    onChange={e => setNuevaFecha(e.target.value)}
                    min="2020-01-01"
                />
                <button onClick={handleAgregarFecha} style={{ padding: '6px 16px', fontWeight: 'bold' }}>Agregar fecha</button>
                <span style={{ fontSize: '0.9em', color: '#666' }}>Total columnas: {fechas.length}</span>

                <label style={{ marginLeft: 20 }}>Trimestre:</label>
                <select value={trimestre} onChange={e => setTrimestre(parseInt(e.target.value, 10))}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                </select>

                <button onClick={() => aplicarAsistenciaComoNota()} style={{ marginLeft: 10, padding: '6px 12px' }}>Aplicar asistencia como nota</button>
            </div>

            {message && (
                <p className={message.includes('✅') ? 'success-message' : 'error-message'}>
                    {message}
                </p>
            )}

            {/* Leyenda */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Leyenda:</strong>
                <span style={{ marginLeft: '20px' }}>
                    <strong style={{ color: '#28a745' }}>P</strong> = Presente
                </span>
                <span style={{ marginLeft: '20px' }}>
                    <strong style={{ color: '#ffc107' }}>A</strong> = Atraso
                </span>
                <span style={{ marginLeft: '20px' }}>
                    <strong style={{ color: '#dc3545' }}>L</strong> = Licencia
                </span>
            </div>

            {/* Tabla de asistencia */}
            <div style={{ overflowX: 'auto', marginTop: '30px' }}>
                <table style={{ fontSize: '0.9em' }}>
                    <thead>
                        <tr style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                            <th style={{ minWidth: '200px' }}>Estudiante</th>
                            {fechas.map(fecha => (
                                <th key={fecha} style={{ minWidth: '60px', textAlign: 'center', position: 'relative' }}>
                                    {formatearFecha(fecha)}
                                    <button
                                        onClick={() => handleEliminarColumna(fecha)}
                                        style={{
                                            position: 'absolute',
                                            top: 2,
                                            right: 2,
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 18,
                                            height: 18,
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            lineHeight: '16px',
                                            padding: 0
                                        }}
                                        title="Eliminar columna"
                                    >✕</button>
                                </th>
                            ))}
                            <th style={{ minWidth: '100px', textAlign: 'center' }}>Presentes</th>
                            <th style={{ minWidth: '100px', textAlign: 'center' }}>Atrasos</th>
                            <th style={{ minWidth: '100px', textAlign: 'center' }}>Licencias</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estudiantes.length > 0 ? (
                            estudiantes.map((est, idx) => {
                                const conteos = contarAsistencias(est.id);
                                return (
                                    <tr key={est.id}>
                                        <td style={{ fontWeight: 'bold' }}>
                                            {idx + 1}. {est.apellidos_nombres}
                                        </td>
                                        {fechas.map(fecha => {
                                            const asist = asistenciaRegistrada[est.id]?.[fecha];
                                            const letra = getLetra(asist?.estado);

                                            return (
                                                <td key={fecha} style={{ textAlign: 'center', padding: '4px' }}>
                                                    <select
                                                        value={letra}
                                                        onChange={(e) => {
                                                            const newEstado = getEstadoDelLetra(e.target.value);
                                                            handleMarcarFecha(est.id, fecha, newEstado);
                                                        }}
                                                        onBlur={() => {
                                                            const newAsist = asistenciaRegistrada[est.id]?.[fecha];
                                                            if (newAsist?.estado) {
                                                                handleGuardarFecha(est.id, fecha);
                                                            }
                                                        }}
                                                        style={{
                                                            width: '40px',
                                                            padding: '4px',
                                                            fontSize: '0.9em',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center',
                                                            backgroundColor: letra ? getColorLetra(letra) + '20' : 'white',
                                                            borderColor: letra ? getColorLetra(letra) : '#ccc',
                                                            border: '2px solid',
                                                            borderRadius: '3px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value=""> - </option>
                                                        <option value="P">P</option>
                                                        <option value="A">A</option>
                                                        <option value="L">L</option>
                                                    </select>
                                                    {asist?.id && (
                                                        <button
                                                            onClick={() => handleEliminar(est.id, fecha)}
                                                            style={{
                                                                marginLeft: '2px',
                                                                padding: '2px 4px',
                                                                fontSize: '0.75em',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '2px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td style={{ textAlign: 'center', backgroundColor: '#28a74520', fontWeight: 'bold' }}>
                                            {conteos.presentes}
                                        </td>
                                        <td style={{ textAlign: 'center', backgroundColor: '#ffc10720', fontWeight: 'bold' }}>
                                            {conteos.atrasos}
                                        </td>
                                        <td style={{ textAlign: 'center', backgroundColor: '#dc354520', fontWeight: 'bold' }}>
                                            {conteos.licencias}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={fechas.length + 4} style={{ textAlign: 'center', padding: '20px' }}>
                                    {loading ? 'Cargando...' : 'No hay estudiantes registrados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Asistencia;
