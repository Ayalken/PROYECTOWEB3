
import React, { useState } from 'react';
import { login } from '../api/auth';

const Login = ({ onLogin }) => {
    const [data, setData] = useState({ nombre_usuario: '', password: '', captcha_token: '' });
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
            // Obtener token de reCAPTCHA v3 de forma segura
            const captchaToken = await new Promise((resolve, reject) => {
                if (!window.grecaptcha) return reject(new Error('reCAPTCHA no cargado'));
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', { action: 'login' })
                        .then(token => resolve(token))
                        .catch(reject);
                });
            });

            // Enviar login con captcha_token
            await login({ ...data, captcha_token: captchaToken });
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

                    {/* Indicador de reCAPTCHA v3 */}
                    <div style={{
                        textAlign: 'center',
                        padding: '10px',
                        border: '1px dashed #6c757d',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '0.85em',
                        color: '#6c757d'
                    }}>
                        🛡️ Protegido por reCAPTCHA v3
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;