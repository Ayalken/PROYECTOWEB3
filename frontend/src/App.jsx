// /frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, logout, getUserRole } from './api/auth';

import Login from './componentes/login.jsx';
import Menu from './componentes/Menu';
import Dashboard from './paginas/Dashboard';
import Estudiantes from './paginas/Estudiantes';
import Notas from './paginas/NotasNew';
import Asistencia from './componentes/Asistencia.jsx';
import GestionDocentes from './componentes/GestionDocentes.jsx';
import GestionUsuarios from './componentes/GestionUsuarios.jsx';
import Materias from './componentes/Materias.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getUserRole();
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        alert(`Acceso denegado. Su rol (${userRole}) no tiene permiso para acceder a esta sección.`);
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const App = () => {
    const [loggedIn, setLoggedIn] = useState(isAuthenticated());
    const role = getUserRole();

    const handleLogout = () => {
        logout();
        setLoggedIn(false);
    };

    const handleLogin = () => {
        setLoggedIn(true);
    };

    return (
        <Router>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {loggedIn && <Menu onLogout={handleLogout} userRole={role} />}
                <div className="content">
                    <Routes>
                        {/* Ruta de Login */}
                        <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />

                        {/* Rutas Principales Protegidas */}
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                        {/* CRUD Estudiantes (Rol: Docente o Admin) */}
                        <Route path="/estudiantes" element={<ProtectedRoute allowedRoles={['admin', 'docente']}><Estudiantes /></ProtectedRoute>} />

                        {/* Registro de Notas (Rol: Docente o Admin) */}
                        <Route path="/notas" element={<ProtectedRoute allowedRoles={['admin', 'docente']}><Notas /></ProtectedRoute>} />

                        {/* Registro de Asistencia (Rol: Docente o Admin) */}
                        <Route path="/asistencia" element={<ProtectedRoute allowedRoles={['admin', 'docente']}><Asistencia /></ProtectedRoute>} />

                        {/* Gestión de Docentes (Solo Admin) */}
                        <Route path="/gestion-docentes" element={<ProtectedRoute allowedRoles={['admin']}><GestionDocentes /></ProtectedRoute>} />

                        {/* Gestión de Usuarios (Solo Admin) */}
                        <Route path="/gestion-usuarios" element={<ProtectedRoute allowedRoles={['admin']}><GestionUsuarios /></ProtectedRoute>} />

                        {/* Gestión de materias (Solo Admin) */}
                        <Route path="/materias" element={<ProtectedRoute allowedRoles={["admin"]}><Materias /></ProtectedRoute>} />

                        {/* Ruta por defecto: redirige al dashboard si está logueado, sino al login */}
                        <Route path="*" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;