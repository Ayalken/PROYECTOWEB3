import React, { useState, useEffect } from 'react';
import { api } from '../api/index';

const GestionDocentes = () => {
    const [docentes, setDocentes] = useState([]);
    const [formData, setFormData] = useState({
        apellido_paterno: '',
        apellido_materno: '',
        nombres: '',
        ci: '',
        telefono: '',
        materia: '',
        curso_asignado: ''
    });
    const AREAS = ['LENGUAJE', 'MATEMÁTICAS', 'CIENCIAS SOCIALES', 'CIENCIAS NATURALES', 'ARTES PLASTICAS Y VISUALES'];
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        cargarDocentes();
    }, []);

    const cargarDocentes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/docentes');
            setDocentes(response.data);
        } catch (error) {
            console.error('Error cargando docentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const validarDatos = (data) => {
        if (data.apellido_paterno || data.apellido_materno || data.nombres) {
            if (!data.apellido_paterno || !data.apellido_materno || !data.nombres) {
                return "Apellido paterno, apellido materno y nombres son obligatorios";
            }
        } else {
            return "Debe ingresar apellido paterno, apellido materno y nombres";
        }
        if (!data.ci) {
            return "Carnet de identidad requerido";
        }
        return null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const error = validarDatos(formData);
        if (error) {
            setMessage('⚠️ ' + error);
            return;
        }

        try {
            setLoading(true);
            if (editando) {
                await api.put(`/docentes/${editando}`, formData);
                setMessage('✅ Docente actualizado correctamente');
            } else {
                await api.post('/docentes', formData);
                setMessage('✅ Docente registrado correctamente');
            }
            cargarDocentes();
            resetForm();
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.mensaje || 'No se pudo guardar'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ apellido_paterno: '', apellido_materno: '', nombres: '', ci: '', telefono: '' });
        setShowForm(false);
        setEditando(null);
    };

    const handleEditar = (docente) => {
        const parts = (docente.apellidos_nombres || '').trim().split(/\s+/);
        const apellido_paterno = parts[0] || '';
        const apellido_materno = parts[1] || '';
        const nombres = parts.length > 2 ? parts.slice(2).join(' ') : '';

        setFormData({
            apellido_paterno,
            apellido_materno,
            nombres,
            ci: docente.ci,
            telefono: docente.telefono || ''
        });
        setEditando(docente.id);
        setShowForm(true);
    };

    const handleEliminar = async (id) => {
        if (confirm('¿Está seguro de eliminar este docente?')) {
            try {
                await api.delete(`/docentes/${id}`);
                setMessage('✅ Docente eliminado');
                cargarDocentes();
            } catch (error) {
                setMessage('❌ Error al eliminar');
            }
        }
    };

    return (
        <div className="container">
            <h1>👨‍🏫 Gestión de Docentes</h1>

            {/* Botón para mostrar/ocultar formulario */}
            <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
                {showForm ? '❌ Cancelar' : '➕ Agregar Nuevo Docente'}
            </button>

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h3>{editando ? 'Editar Docente' : 'Agregar Nuevo Docente'}</h3>

                    <label>Apellido Paterno:</label>
                    <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} placeholder="ej: Pérez" required />
                    <label>Apellido Materno:</label>
                    <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} placeholder="ej: García" required />
                    <label>Nombres:</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="ej: Juan Carlos" required />

                    <label>Carnet de Identidad:</label>
                    <input
                        type="text"
                        name="ci"
                        value={formData.ci}
                        onChange={handleChange}
                        placeholder="ej: 1234567"
                        required
                    />

                    <label>Teléfono (Opcional):</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="ej: +591 76543210"
                    />

                    <label>Materia asignada (opcional):</label>
                    <select name="materia" value={formData.materia} onChange={handleChange}>
                        <option value="">-- Seleccionar materia --</option>
                        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <label>Curso asignado (opcional):</label>
                    <input type="text" name="curso_asignado" value={formData.curso_asignado} onChange={handleChange} placeholder={'ej: 5 "B"'} />

                    {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar Docente'}
                    </button>
                </form>
            )}

            {/* Tabla de docentes */}
            <h3>Lista de Docentes</h3>
            {docentes.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Apellido Paterno</th>
                            <th>Apellido Materno</th>
                            <th>Nombres</th>
                            <th>Carnet</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {docentes.map((docente) => (
                            <tr key={docente.id}>
                                <td>{docente.id}</td>
                                <td>{docente.apellido_paterno || (docente.apellidos_nombres ? docente.apellidos_nombres.split(' ')[0] : '')}</td>
                                <td>{docente.apellido_materno || (docente.apellidos_nombres ? (docente.apellidos_nombres.split(' ')[1] || '') : '')}</td>
                                <td>{docente.nombres || (docente.apellidos_nombres ? docente.apellidos_nombres.split(' ').slice(2).join(' ') : '')}</td>
                                <td>{docente.ci}</td>
                                <td>{docente.telefono || '-'}</td>
                                <td>{docente.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditar(docente)}
                                        style={{ padding: '5px 10px', fontSize: '0.9em', marginRight: '5px' }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="danger-btn"
                                        onClick={() => handleEliminar(docente.id)}
                                        style={{ padding: '5px 10px', fontSize: '0.9em' }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay docentes registrados.</p>
            )}
        </div>
    );
};

export default GestionDocentes;
