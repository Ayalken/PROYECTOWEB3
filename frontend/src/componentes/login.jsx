
import React, { useState } from 'react';
import { login } from '../api/auth';

const Login = ({ onLogin }) => {
    const [data, setData] = useState({ nombre_usuario: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Enviar login sin captcha
            await login(data);
            onLogin(true);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error de conexión o credenciales inválidas.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '400px' }}>
                <h2>🔐 Registro Pedagógico Web</h2>
                <form onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
                    <input
                        type="text"
                        name="nombre_usuario"
                        placeholder="Usuario"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;