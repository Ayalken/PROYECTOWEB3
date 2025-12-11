import React, { useState, useEffect } from 'react';
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante, checkCI, checkNombre, getEstudianteByCI } from '../api/estudiantes';
import { useRef } from 'react';
import { getUserRole } from '../api/auth';

const initialFormData = {
    apellido_paterno: '', apellido_materno: '', nombres: '', carnet_identidad: '', expedido: '',
    fecha_nac_dia: '', fecha_nac_mes: '', fecha_nac_anio: '',
    sexo: 'M', desviado_procedencia: '',
    apellidos_nombres_tutor: '', ci_tutor: '', ocupacion_tutor: '',
    telefono_celular_tutor: '', domicilio: '',
    unidad_educativa: 'U.E. CALAMA', curso: '5 "B"',
};

const Estudiantes = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const userRole = getUserRole();

    const fetchEstudiantes = async () => {
        try {
            const response = await getEstudiantes();
            setEstudiantes(response.data.filter(e => e.activo === 1)); // Solo activos (Eliminación Lógica)
        } catch (error) {
            setMessage('Error al cargar la lista de estudiantes.');
        }
    };

    useEffect(() => {
        fetchEstudiantes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    };

    const ciCheckRef = useRef(null);
    const nameCheckRef = useRef(null);
    const [ciFound, setCiFound] = useState(null);

    // Debounced check for CI duplicado
    useEffect(() => {
        const ci = formData.carnet_identidad;
        if (ciCheckRef.current) clearTimeout(ciCheckRef.current);
        if (!ci || ci.toString().trim() === '') {
            // clear any ci error
            setFieldErrors(prev => { const copy = { ...prev }; delete copy.carnet_identidad; return copy; });
            setCiFound(null);
            return;
        }
        ciCheckRef.current = setTimeout(async () => {
            try {
                const res = await checkCI(ci, editingId);
                if (res.data && res.data.exists) {
                    // Obtener datos completos
                    try {
                        const full = await getEstudianteByCI(ci);
                        const estudianteFull = full.data || null;
                        setFieldErrors(prev => ({ ...prev, carnet_identidad: 'CI ya registrado en el sistema.' }));
                        // Si no estamos editando otro registro, cargar automáticamente
                        if (!editingId && estudianteFull) {
                            loadFoundByCI(estudianteFull);
                            return;
                        }
                        // si hay edición en curso, guardar para posible carga manual
                        setCiFound(estudianteFull);
                    } catch (e) {
                        setCiFound(null);
                    }
                    
                } else {
                    setFieldErrors(prev => { const copy = { ...prev }; delete copy.carnet_identidad; return copy; });
                    setCiFound(null);
                }
            } catch (err) {
                // ignore network errors for CI check
            }
        }, 600);
        return () => { if (ciCheckRef.current) clearTimeout(ciCheckRef.current); };
    }, [formData.carnet_identidad]);

    // Debounced check for nombre/apellidos duplicado (construido desde campos separados)
    useEffect(() => {
        const { apellido_paterno, apellido_materno, nombres } = formData;
        const full = (apellido_paterno || apellido_materno || nombres) ? `${apellido_paterno} ${apellido_materno} ${nombres}`.trim() : '';
        if (nameCheckRef.current) clearTimeout(nameCheckRef.current);
        if (!full || full.length < 5) {
            setFieldErrors(prev => { const copy = { ...prev }; delete copy.apellidos_nombres; return copy; });
            return;
        }
        nameCheckRef.current = setTimeout(async () => {
            try {
                const res = await checkNombre(full, editingId);
                if (res.data && res.data.exists) {
                    setFieldErrors(prev => ({ ...prev, apellidos_nombres: 'Nombre y apellidos ya registrados.' }));
                } else {
                    setFieldErrors(prev => { const copy = { ...prev }; delete copy.apellidos_nombres; return copy; });
                }
            } catch (err) {
                // ignore network errors
            }
        }, 600);
        return () => { if (nameCheckRef.current) clearTimeout(nameCheckRef.current); };
    }, [formData.apellido_paterno, formData.apellido_materno, formData.nombres, editingId]);

    const computeProgress = () => {
        const required = ['apellido_paterno','apellido_materno','nombres','carnet_identidad'];
        let filled = 0;
        required.forEach(f => { if (formData[f] && String(formData[f]).trim().length>0 && !fieldErrors[f]) filled++; });
        return Math.round((filled / required.length) * 100);
    };

    const validateForm = (data) => {
        const errors = {};
        // Nombre y apellidos (si se usan separados)
        if (data.apellido_paterno || data.apellido_materno || data.nombres) {
            if (!data.apellido_paterno) errors.apellido_paterno = 'Apellido paterno requerido.';
            if (!data.apellido_materno) errors.apellido_materno = 'Apellido materno requerido.';
            if (!data.nombres) errors.nombres = 'Nombres requeridos.';
        } else {
            if (!data.apellidos_nombres || data.apellidos_nombres.trim().length < 5) {
                errors.apellidos_nombres = 'Apellidos y nombres obligatorios (o complete los campos separados).';
            }
        }

        // CI: solo números y longitud razonable
        if (!data.carnet_identidad) {
            errors.carnet_identidad = 'CI es obligatorio.';
        } else if (!/^[0-9]{6,12}$/.test(String(data.carnet_identidad))) {
            errors.carnet_identidad = 'CI debe ser numérico (6-12 dígitos).';
        }

        // Fecha nacimiento: si se completa, validar rango
        if (data.fecha_nac_anio) {
            const anio = parseInt(data.fecha_nac_anio, 10);
            if (isNaN(anio) || anio < 1900 || anio > new Date().getFullYear()) errors.fecha_nac_anio = 'Año inválido.';
        }
        if (data.fecha_nac_mes) {
            const mes = parseInt(data.fecha_nac_mes, 10);
            if (isNaN(mes) || mes < 1 || mes > 12) errors.fecha_nac_mes = 'Mes inválido.';
        }
        if (data.fecha_nac_dia) {
            const dia = parseInt(data.fecha_nac_dia, 10);
            if (isNaN(dia) || dia < 1 || dia > 31) errors.fecha_nac_dia = 'Día inválido.';
        }

        // Teléfono tutor (opcional) pero si está, validar formato
        if (data.telefono_celular_tutor) {
            if (!/^[0-9()+\-\s]{6,20}$/.test(String(data.telefono_celular_tutor))) {
                errors.telefono_celular_tutor = 'Teléfono inválido.';
            }
        }

        return errors;
    };

    const fieldLabels = {
        apellido_paterno: 'Apellido paterno',
        apellido_materno: 'Apellido materno',
        nombres: 'Nombres',
        apellidos_nombres: 'Apellidos y nombres',
        carnet_identidad: 'CI',
        fecha_nac_dia: 'Día de nacimiento',
        fecha_nac_mes: 'Mes de nacimiento',
        fecha_nac_anio: 'Año de nacimiento',
        telefono_celular_tutor: 'Teléfono del tutor'
    };

    const handleEdit = (estudiante) => {
        setEditingId(estudiante.id);
        // Intentar descomponer apellidos_nombres en paterno/materno/nombres
        const parts = (estudiante.apellidos_nombres || '').trim().split(/\s+/);
        const apellido_paterno = parts[0] || '';
        const apellido_materno = parts[1] || '';
        const nombres = parts.length > 2 ? parts.slice(2).join(' ') : '';

        setFormData({
            ...initialFormData,
            apellido_paterno,
            apellido_materno,
            nombres,
            carnet_identidad: estudiante.carnet_identidad || '',
            expedido: estudiante.expedido || '',
            fecha_nac_dia: estudiante.fecha_nac_dia || '',
            fecha_nac_mes: estudiante.fecha_nac_mes || '',
            fecha_nac_anio: estudiante.fecha_nac_anio || '',
            desviado_procedencia: estudiante.desviado_procedencia || '',
            apellidos_nombres_tutor: estudiante.apellidos_nombres_tutor || '',
            ci_tutor: estudiante.ci_tutor || '',
            telefono_celular_tutor: estudiante.telefono_celular_tutor || '',
            domicilio: estudiante.domicilio || '',
            unidad_educativa: estudiante.unidad_educativa || 'U.E. CALAMA',
            curso: estudiante.curso || '5 "B"'
        });
        setMessage('');
    };

    const loadFoundByCI = (estudianteParam = null) => {
        const estudiante = estudianteParam || ciFound;
        if (!estudiante) return;
        const parts = (estudiante.apellidos_nombres || '').trim().split(/\s+/);
        const apellido_paterno = parts[0] || '';
        const apellido_materno = parts[1] || '';
        const nombres = parts.length > 2 ? parts.slice(2).join(' ') : '';

        setEditingId(estudiante.id);
        setFormData({
            ...initialFormData,
            apellido_paterno,
            apellido_materno,
            nombres,
            carnet_identidad: estudiante.carnet_identidad || '',
            expedido: estudiante.expedido || '',
            fecha_nac_dia: estudiante.fecha_nac_dia || '',
            fecha_nac_mes: estudiante.fecha_nac_mes || '',
            fecha_nac_anio: estudiante.fecha_nac_anio || '',
            desviado_procedencia: estudiante.desviado_procedencia || '',
            apellidos_nombres_tutor: estudiante.apellidos_nombres_tutor || '',
            ci_tutor: estudiante.ci_tutor || '',
            telefono_celular_tutor: estudiante.telefono_celular_tutor || '',
            domicilio: estudiante.domicilio || '',
            unidad_educativa: estudiante.unidad_educativa || 'U.E. CALAMA',
            curso: estudiante.curso || '5 "B"'
        });
        setMessage('Estudiante cargado para edición.');
        setFieldErrors({});
        setCiFound(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validación cliente
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            // Construir mensaje instructivo
            const lines = Object.keys(errors).map(k => `- ${fieldLabels[k] || k}: ${errors[k]}`);
            setMessage(`Corrija los siguientes errores:\n${lines.join('\n')}`);
            return;
        }

        try {
            if (editingId) {
                // Actualizar
                await updateEstudiante(editingId, formData);
                setMessage('Estudiante actualizado con éxito.');
                setEditingId(null);
            } else {
                // Crear
                await createEstudiante(formData);
                setMessage('Estudiante creado con éxito.');
            }
            setFormData(initialFormData);
            fetchEstudiantes();
            setFieldErrors({});
        } catch (error) {
            const resp = error.response?.data;
            if (resp && resp.field) {
                setFieldErrors(prev => ({ ...prev, [resp.field]: resp.mensaje }));
                setMessage(`Error al guardar: ${resp.mensaje}`);
            } else {
                const errMsg = resp?.mensaje || resp?.error || error.message || 'Verifique los datos.';
                setMessage(`Error al guardar: ${errMsg}`);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar lógicamente este estudiante?')) {
            try {
                await deleteEstudiante(id);
                setMessage('Estudiante eliminado lógicamente.');
                fetchEstudiantes();
            } catch (error) {
                setMessage('Error al eliminar el estudiante.');
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(initialFormData);
    };

    return (
        <div className="container">
            <h2>📋 Cuadro de Filiación y Registro de Estudiantes</h2>
            {message && <p className={message.includes('Error') || message.startsWith('Corrija') ? 'error-message' : 'success-message'} style={{ whiteSpace: 'pre-line' }}>{message}</p>}

            {/* Lista detallada de errores por campo (si los hay) */}
            {Object.keys(fieldErrors).length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    <strong>Cómo corregir:</strong>
                    <ul>
                        {Object.keys(fieldErrors).map(key => (
                            <li key={key}>{(fieldLabels[key] || key) + ': ' + fieldErrors[key]}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Progress bar */}
            <div style={{ margin: '10px 0' }}>
                <div style={{ background: '#e9ecef', height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${computeProgress()}%`, height: '100%', background: '#28a745', transition: 'width 200ms' }} />
                </div>
                <small>Progreso del formulario: {computeProgress()}%</small>
            </div>

            {/* --- Formulario de Edición/Creación --- */}
            <form onSubmit={handleSubmit} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <h3 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    {editingId ? 'Editar Datos de Filiación' : 'Registrar Nuevo Estudiante'}
                </h3>

                {/* CAMPOS DEL ESTUDIANTE */}
                <div>
                    <input
                        type="text"
                        name="apellido_paterno"
                        placeholder="Apellido Paterno"
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        required
                        className={fieldErrors.apellido_paterno ? 'input-error' : (formData.apellido_paterno ? 'input-ok' : '')}
                    />
                    {fieldErrors.apellido_paterno && <div className="error-message">{fieldErrors.apellido_paterno}</div>}
                </div>
                <div>
                    <input
                        type="text"
                        name="apellido_materno"
                        placeholder="Apellido Materno"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        required
                        className={fieldErrors.apellido_materno ? 'input-error' : (formData.apellido_materno ? 'input-ok' : '')}
                    />
                    {fieldErrors.apellido_materno && <div className="error-message">{fieldErrors.apellido_materno}</div>}
                </div>
                <div>
                    <input
                        type="text"
                        name="nombres"
                        placeholder="Nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        required
                        className={fieldErrors.nombres ? 'input-error' : (formData.nombres ? 'input-ok' : '')}
                    />
                    {fieldErrors.nombres && <div className="error-message">{fieldErrors.nombres}</div>}
                </div>
                <div>
                    <input
                        type="text"
                        name="carnet_identidad"
                        placeholder="CI"
                        value={formData.carnet_identidad}
                        onChange={handleChange}
                        required
                        className={fieldErrors.carnet_identidad ? 'input-error' : (formData.carnet_identidad ? 'input-ok' : '')}
                    />
                    {fieldErrors.carnet_identidad && <div className="error-message">{fieldErrors.carnet_identidad}</div>}
                    {/* Si se encontró un estudiante con este CI, ofrecer carga de datos */}
                    {ciFound && (
                        <div style={{ marginTop: '6px' }}>
                            <strong>Estudiante existente:</strong> {ciFound.apellidos_nombres} — {ciFound.domicilio}
                            <button type="button" onClick={loadFoundByCI} style={{ marginLeft: '8px' }}>Cargar datos</button>
                        </div>
                    )}
                </div>
                <select name="expedido" value={formData.expedido} onChange={handleChange}>
                    <option value="">Expedido</option><option value="LP">LP</option><option value="SC">SC</option><option value="CB">CB</option>
                </select>
                <select name="sexo" value={formData.sexo} onChange={handleChange}>
                    <option value="M">Masculino</option><option value="F">Femenino</option>
                </select>

                {/* FECHA DE NACIMIENTO */}
                <div>
                    <input
                        type="number"
                        name="fecha_nac_dia"
                        placeholder="Día Nac."
                        value={formData.fecha_nac_dia}
                        onChange={handleChange}
                        min="1"
                        max="31"
                        className={fieldErrors.fecha_nac_dia ? 'input-error' : (formData.fecha_nac_dia ? 'input-ok' : '')}
                    />
                    {fieldErrors.fecha_nac_dia && <div className="error-message">{fieldErrors.fecha_nac_dia}</div>}
                </div>
                <div>
                    <input
                        type="number"
                        name="fecha_nac_mes"
                        placeholder="Mes Nac."
                        value={formData.fecha_nac_mes}
                        onChange={handleChange}
                        min="1"
                        max="12"
                        className={fieldErrors.fecha_nac_mes ? 'input-error' : (formData.fecha_nac_mes ? 'input-ok' : '')}
                    />
                    {fieldErrors.fecha_nac_mes && <div className="error-message">{fieldErrors.fecha_nac_mes}</div>}
                </div>
                <div>
                    <input
                        type="number"
                        name="fecha_nac_anio"
                        placeholder="Año Nac."
                        value={formData.fecha_nac_anio}
                        onChange={handleChange}
                        min="1990"
                        max="2024"
                        className={fieldErrors.fecha_nac_anio ? 'input-error' : (formData.fecha_nac_anio ? 'input-ok' : '')}
                    />
                    {fieldErrors.fecha_nac_anio && <div className="error-message">{fieldErrors.fecha_nac_anio}</div>}
                </div>

                <input type="text" name="desviado_procedencia" placeholder="Procedencia" value={formData.desviado_procedencia} onChange={handleChange} />

                {/* CAMPOS DEL TUTOR */}
                <h3 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Datos del Tutor</h3>
                <input type="text" name="apellidos_nombres_tutor" placeholder="A. y N. Tutor" value={formData.apellidos_nombres_tutor} onChange={handleChange} />
                <input type="text" name="ci_tutor" placeholder="CI Tutor" value={formData.ci_tutor} onChange={handleChange} />
                <div>
                    <input
                        type="text"
                        name="telefono_celular_tutor"
                        placeholder="Teléfono"
                        value={formData.telefono_celular_tutor}
                        onChange={handleChange}
                        className={fieldErrors.telefono_celular_tutor ? 'input-error' : (formData.telefono_celular_tutor ? 'input-ok' : '')}
                    />
                    {fieldErrors.telefono_celular_tutor && <div className="error-message">{fieldErrors.telefono_celular_tutor}</div>}
                </div>
                <input type="text" name="domicilio" placeholder="Domicilio" value={formData.domicilio} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />

                <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <button type="submit">{editingId ? 'Guardar Cambios' : 'Registrar Estudiante'}</button>
                    {editingId && <button type="button" onClick={handleCancelEdit} className="danger-btn" style={{ marginLeft: '10px' }}>Cancelar Edición</button>}
                </div>
            </form>

            {/* --- Tabla de Listado de Estudiantes --- */}
            <h3>Listado Actual ({estudiantes.length} Registros)</h3>
            <table style={{ textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Nombres</th>
                        <th>CI</th>
                        <th>F. Nac.</th>
                        <th>Tutor</th>
                        <th>Teléfono</th>
                        <th>Domicilio</th>
                        <th style={{ minWidth: '150px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e, index) => (
                        <tr key={e.id}>
                            <td>{index + 1}</td>
                            <td>{e.apellido_paterno || (e.apellidos_nombres ? e.apellidos_nombres.split(' ')[0] : '')}</td>
                            <td>{e.apellido_materno || (e.apellidos_nombres ? (e.apellidos_nombres.split(' ')[1] || '') : '')}</td>
                            <td>{e.nombres || (e.apellidos_nombres ? e.apellidos_nombres.split(' ').slice(2).join(' ') : '')}</td>
                            <td>{e.carnet_identidad}</td>
                            <td>{`${e.fecha_nac_dia || '00'}/${e.fecha_nac_mes || '00'}/${e.fecha_nac_anio || '0000'}`}</td>
                            <td>{e.apellidos_nombres_tutor}</td>
                            <td>{e.telefono_celular_tutor}</td>
                            <td>{e.domicilio}</td>
                            <td>
                                <button onClick={() => handleEdit(e)}>Editar</button>
                                <button onClick={() => handleDelete(e.id)} className="danger-btn" style={{ marginLeft: '5px' }}>Elim. Lógica</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default Estudiantes;