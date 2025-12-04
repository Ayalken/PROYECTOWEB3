// /frontend/src/componentes/Login.jsx
import React, { useState } from 'react';
import { login } from '../api/auth';
// Aquí iría la importación del CAPTCHA

const Login = ({ onLogin }) => {
    // MOCK_TOKEN temporal hasta implementar el CAPTCHA
    const [data, setData] = useState({ nombre_usuario: '', password: '', captcha_token: 'MOCK_TOKEN' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    // const handleCaptcha = (token) => { ... lógica real de CAPTCHA ... };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(data);
            onLogin(true);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error de conexión o credenciales inválidas.');
        }
    };

    return (
        <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '400px' }}>
                <h2>Registro Pedagógico Web</h2>
                <form onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
                    <input type="text" name="nombre_usuario" placeholder="Usuario" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />

                    {/* Aquí va el Componente CAPTCHA real */}
                    <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #ccc' }}>

                        ESPACIO PARA CAPTCHA (Requisito)
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Ingresar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;