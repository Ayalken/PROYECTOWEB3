
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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                width: '400px',
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    color: '#212529',
                    marginBottom: '30px',
                    fontSize: '24px'
                }}>🔐 Registro Pedagógico Web</h2>
                <form onSubmit={handleSubmit} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '15px',
                    padding: '0'
                }}>
                    <input
                        type="text"
                        name="nombre_usuario"
                        placeholder="Usuario"
                        onChange={handleChange}
                        required
                        style={{
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        onChange={handleChange}
                        required
                        style={{
                            padding: '12px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />

                    {error && <p style={{
                        color: '#dc3545',
                        marginTop: '10px',
                        fontSize: '13px'
                    }}>{error}</p>}
                    <button type="submit" disabled={loading} style={{
                        padding: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}>
                        {loading ? 'Iniciando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;