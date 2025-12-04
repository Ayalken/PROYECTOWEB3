// /frontend/src/paginas/Estudiantes.jsx
import React, { useState, useEffect } from 'react';
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../api/estudiantes';
import { getUserRole } from '../api/auth';

// Estado inicial del formulario (Basado en la tabla 'estudiante')
const initialFormData = {
    apellidos_nombres: '', carnet_identidad: '', expedido: '',
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (estudiante) => {
        setEditingId(estudiante.id);
        setFormData({
            ...estudiante,
            fecha_nac_dia: estudiante.fecha_nac_dia || '', // Asegurar que no es null
            fecha_nac_mes: estudiante.fecha_nac_mes || '',
            fecha_nac_anio: estudiante.fecha_nac_anio || '',
        });
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        } catch (error) {
            setMessage(`Error al guardar: ${error.response?.data?.mensaje || 'Verifique los datos.'}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar lógicamente este estudiante?')) {
            try {
                // Llama al DELETE lógico
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
            <h2>📋 Cuadro de Filiación y Registro de Estudiantes (CRUD)</h2>
            {message && <p className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</p>}

            {/* --- Formulario de Edición/Creación --- */}
            <form onSubmit={handleSubmit} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <h3 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    {editingId ? 'Editar Datos de Filiación' : 'Registrar Nuevo Estudiante'}
                </h3>

                {/* CAMPOS DEL ESTUDIANTE */}
                <input type="text" name="apellidos_nombres" placeholder="Apellidos y Nombres" value={formData.apellidos_nombres} onChange={handleChange} required />
                <input type="text" name="carnet_identidad" placeholder="CI" value={formData.carnet_identidad} onChange={handleChange} required />
                <select name="expedido" value={formData.expedido} onChange={handleChange}>
                    <option value="">Expedido</option><option value="LP">LP</option><option value="SC">SC</option><option value="CB">CB</option>
                </select>
                <select name="sexo" value={formData.sexo} onChange={handleChange}>
                    <option value="M">Masculino</option><option value="F">Femenino</option>
                </select>

                {/* FECHA DE NACIMIENTO */}
                <input type="number" name="fecha_nac_dia" placeholder="Día Nac." value={formData.fecha_nac_dia} onChange={handleChange} min="1" max="31" />
                <input type="number" name="fecha_nac_mes" placeholder="Mes Nac." value={formData.fecha_nac_mes} onChange={handleChange} min="1" max="12" />
                <input type="number" name="fecha_nac_anio" placeholder="Año Nac." value={formData.fecha_nac_anio} onChange={handleChange} min="1990" max="2024" />

                <input type="text" name="desviado_procedencia" placeholder="Procedencia" value={formData.desviado_procedencia} onChange={handleChange} />

                {/* CAMPOS DEL TUTOR */}
                <h3 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Datos del Tutor</h3>
                <input type="text" name="apellidos_nombres_tutor" placeholder="A. y N. Tutor" value={formData.apellidos_nombres_tutor} onChange={handleChange} />
                <input type="text" name="ci_tutor" placeholder="CI Tutor" value={formData.ci_tutor} onChange={handleChange} />
                <input type="text" name="telefono_celular_tutor" placeholder="Teléfono" value={formData.telefono_celular_tutor} onChange={handleChange} />
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
                        <th style={{ minWidth: '200px' }}>Apellidos y Nombres</th>
                        <th>CI</th>
                        <th>F. Nac.</th>
                        <th>Tutor</th>
                        <th>Teléfono</th>
                        <th style={{ minWidth: '150px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.map((e, index) => (
                        <tr key={e.id}>
                            <td>{index + 1}</td>
                            <td>{e.apellidos_nombres}</td>
                            <td>{e.carnet_identidad}</td>
                            <td>{`${e.fecha_nac_dia || '00'}/${e.fecha_nac_mes || '00'}/${e.fecha_nac_anio || '0000'}`}</td>
                            <td>{e.apellidos_nombres_tutor}</td>
                            <td>{e.telefono_celular_tutor}</td>
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