// /frontend/src/componentes/Menu.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Menu = ({ onLogout, userRole }) => {
    const isAdmin = userRole === 'admin';
    const isDocente = userRole === 'docente' || isAdmin;

    return (
        <nav className="main-menu">
            <Link to="/dashboard">📊 Dashboard</Link>

            {isDocente && (
                <Link to="/estudiantes">📋 Filiación Estudiantes</Link>
            )}

            {isDocente && (
                <Link to="/notas">📝 Registro de Notas</Link>
            )}

            {isAdmin && (
                <Link to="/docentes">👤 Gestión Docentes (WIP)</Link>
            )}

            <div style={{ marginTop: 'auto' }}>
                <button onClick={onLogout}>🚪 Cerrar Sesión</button>
                <span>Usuario: {localStorage.getItem('user')} ({userRole})</span>
            </div>
        </nav>
    );
};

export default Menu;