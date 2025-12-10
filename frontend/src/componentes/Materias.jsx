import React, { useEffect, useState } from 'react';
import { api } from '../api/index';

const Materias = () => {
    const [materias, setMaterias] = useState([]);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');

    const fetchMaterias = async () => {
        try {
            const res = await api.get('/materias');
            setMaterias(res.data || []);
        } catch (err) {
            console.error('No se pudieron cargar materias', err);
        }
    };

    useEffect(() => { fetchMaterias(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/materias/${editingId}`, form);
                setMsg('✅ Materia actualizada');
            } else {
                await api.post('/materias', form);
                setMsg('✅ Materia creada');
            }
            setForm({ nombre: '', descripcion: '' });
            setEditingId(null);
            fetchMaterias();
            setTimeout(() => setMsg(''), 2500);
        } catch (err) {
            console.error(err);
            setMsg('❌ Error al guardar materia');
        }
    };

    const handleEdit = (m) => { setForm({ nombre: m.nombre, descripcion: m.descripcion || '' }); setEditingId(m.id); };

    const handleDelete = async (id) => {
        if (!confirm('Eliminar materia y todas las referencias asociadas?')) return;
        try {
            await api.delete(`/materias/${id}`);
            setMsg('✅ Materia eliminada');
            fetchMaterias();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            console.error(err);
            setMsg('❌ Error al eliminar materia');
        }
    };

    return (
        <div className="container">
            <h2>Materias</h2>
            {msg && <p className={msg.includes('✅') ? 'success-message' : 'error-message'}>{msg}</p>}
            <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
                <input name="nombre" placeholder="Nombre materia" value={form.nombre} onChange={handleChange} required />
                <input name="descripcion" placeholder="Descripción (opcional)" value={form.descripcion} onChange={handleChange} />
                <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ nombre: '', descripcion: '' }); }}>Cancelar</button>}
            </form>

            <table>
                <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
                <tbody>
                    {materias.map(m => (
                        <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.nombre}</td>
                            <td>{m.descripcion}</td>
                            <td>
                                <button onClick={() => handleEdit(m)}>Editar</button>
                                <button onClick={() => handleDelete(m.id)} style={{ marginLeft: 8, color: 'red' }}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Materias;
