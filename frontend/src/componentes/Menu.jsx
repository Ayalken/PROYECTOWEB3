import React from 'react';
import { Link } from 'react-router-dom';

const Menu = ({ onLogout, userRole }) => {
    const isAdmin = userRole === 'admin';
    const isDocente = userRole === 'docente' || isAdmin;

    return (
        <nav className="main-menu">
            <Link to="/dashboard">📊 Panel de Control</Link>

            {isDocente && (
                <Link to="/estudiantes">📋 Filiación Estudiantes</Link>
            )}

            {isDocente && (
                <Link to="/notas">📝 Registro de Notas</Link>
            )}

            {isDocente && (
                <Link to="/asistencia">✅ Registro de Asistencia</Link>
            )}

            {isDocente && (
                <Link to="/reportes">📊 Reporte de Notas</Link>
            )}

            {isAdmin && (
                <Link to="/gestion-docentes">👨‍🏫 Gestión de Docentes</Link>
            )}

            {isAdmin && (
                <Link to="/materias">📚 Gestión de Materias</Link>
            )}

            {isAdmin && (
                <Link to="/gestion-usuarios">👥 Gestión de Usuarios</Link>
            )}

            <div style={{ marginTop: 'auto' }}>
                <button onClick={onLogout}>🚪 Cerrar Sesión</button>
                <span>Usuario: {localStorage.getItem('user')} ({userRole})</span>
            </div>
        </nav>
    );
};

export default Menu;