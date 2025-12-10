import React, { useState, useEffect } from 'react';
import { api } from '../api/index';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        password: '',
        rol: 'docente'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            // Nota: Esta ruta necesita ser creada en el backend
            const response = await api.get('/auth/usuarios');
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const validarContrasena = (password) => {
        let fortaleza = 0;
        if (password.length >= 8) fortaleza++;
        if (password.match(/[A-Z]/) && password.match(/[a-z]/)) fortaleza++;
        if (password.match(/[0-9]/)) fortaleza++;
        if (password.match(/[^A-Za-z0-9]/)) fortaleza++;

        if (fortaleza < 2) return 'débil';
        if (fortaleza === 4) return 'fuerte';
        return 'intermedio';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!formData.nombre_usuario || !formData.password) {
            setMessage('Usuario y contraseña son requeridos');
            return;
        }

        const fortaleza = validarContrasena(formData.password);
        if (fortaleza === 'débil') {
            setMessage('⚠️ Contraseña débil. Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/auth/register', formData);
            setMessage(`✅ Usuario ${formData.nombre_usuario} creado correctamente (Fortaleza: ${fortaleza})`);
            cargarUsuarios();
            setFormData({ nombre_usuario: '', password: '', rol: 'docente' });
            setShowForm(false);
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.mensaje || 'No se pudo crear usuario'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>👥 Gestión de Usuarios</h1>

            {/* Botón para mostrar/ocultar formulario */}
            <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
                {showForm ? '❌ Cancelar' : '➕ Crear Nuevo Usuario'}
            </button>

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h3>Crear Nuevo Usuario (Docente)</h3>

                    <label>Nombre de usuario:</label>
                    <input
                        type="text"
                        name="nombre_usuario"
                        value={formData.nombre_usuario}
                        onChange={handleChange}
                        placeholder="ej: juan_docente"
                        required
                    />

                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mín. 8 caracteres con mayús, minús, números y símbolos"
                        required
                    />
                    <small style={{ color: '#6c757d' }}>
                        Fortaleza: <strong>{formData.password ? validarContrasena(formData.password) : 'N/A'}</strong>
                    </small>

                    <label>Rol:</label>
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                    >
                        <option value="docente">Docente</option>
                        <option value="admin">Administrador</option>
                    </select>

                    {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
            )}

            {/* Tabla de usuarios */}
            <h3>Lista de Usuarios</h3>
            {usuarios.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombre_usuario}</td>
                                <td>{user.rol}</td>
                                <td>{user.activo ? '✅ Activo' : '❌ Inactivo'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay usuarios registrados.</p>
            )}
        </div>
    );
};

export default GestionUsuarios;
