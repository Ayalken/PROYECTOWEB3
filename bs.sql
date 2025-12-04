-- #######################################################################
-- # ARCHIVO: bs.sql (Script de Base de Datos para Registro de Notas)
-- # CUMPLE CON: Seguridad, Log de Acceso, Eliminación Lógica, Tablas Detalladas
-- #######################################################################

-- 1. CREACIÓN Y USO DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS registro_notas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE registro_notas;

-- 2. SEGURIDAD Y LOG DE ACCESO (Requisitos del Licenciado)
-- --------------------------------------------------------

-- Tabla de Usuarios para Autenticación (Login y Permisos)
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Para la contraseña encriptada (bcrypt)
    rol VARCHAR(20) DEFAULT 'docente', -- Roles: 'admin', 'docente', 'estudiante'
    activo TINYINT DEFAULT 1
);

-- Tabla para el Log de Acceso (Registro de Ingreso y Salida)
CREATE TABLE IF NOT EXISTS log_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    ip_acceso VARCHAR(45) NOT NULL,
    evento ENUM('ingreso', 'salida') NOT NULL, -- Requisito: evento [ingreso, salida]
    browser_agente VARCHAR(255) NOT NULL, -- Requisito: browser
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP, -- Requisito: fecha y hora
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- 3. TABLA DE DOCENTES (Requisito: CRUD para datos de docente)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS docente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellidos_nombres VARCHAR(100) NOT NULL,
    ci VARCHAR(20),
    telefono VARCHAR(20),
    activo TINYINT DEFAULT 1 -- Requisito: Eliminación lógica
);

-- 4. TABLA DE ESTUDIANTES (Requisito: Campos de Filiación y Eliminación Lógica)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Datos del Estudiante (Cuadro de Filiación)
    apellidos_nombres VARCHAR(100) NOT NULL,
    carnet_identidad VARCHAR(20) NOT NULL,
    expedido VARCHAR(5),
    fecha_nac_dia INT,
    fecha_nac_mes INT,
    fecha_nac_anio INT,
    edad INT,
    sexo CHAR(1),
    desviado_procedencia VARCHAR(50),
    -- Datos del Tutor
    apellidos_nombres_tutor VARCHAR(100),
    ci_tutor VARCHAR(20),
    ocupacion_tutor VARCHAR(50),
    telefono_celular_tutor VARCHAR(20),
    domicilio VARCHAR(150),
    -- Otros datos
    unidad_educativa VARCHAR(100),
    curso VARCHAR(10),
    docente_id INT, -- Relación con el docente asignado
    activo TINYINT DEFAULT 1, -- Requisito: Eliminación Lógica
    
    FOREIGN KEY (docente_id) REFERENCES docente(id)
);

-- 5. TABLA DE CAMPOS EXTRA (Requisito: Habilitar nuevos campos dinámicos)
-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS campos_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreCampo VARCHAR(50), -- Nombre de la nueva columna (ej. "proyecto_final")
    tipoCampo VARCHAR(20) -- Tipo de dato (ej. "number", "text")
);

-- 6. TABLA DE NOTAS (Requisito: Estructura detallada Ser, Saber, Hacer, Decidir)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    idDocente INT,
    area VARCHAR(50) NOT NULL, -- Área/Materia (ej. Lenguaje, Matemática)
    trimestre INT NOT NULL, -- 1, 2, o 3
    
    -- Campos y subcampos según libreta
    prom_ser DECIMAL(5,2), -- SER (35 Pts.)
    prom_saber DECIMAL(5,2), -- SABER (35 Pts.)
    prom_hacer DECIMAL(5,2), -- HACER (30 Pts.)
    prom_decidir DECIMAL(5,2), -- DECIDIR (Autoev. 10)
    
    examen_nota DECIMAL(5,2), -- Una de las notas de Saber
    
    autoeval_nota DECIMAL(5,2),
    nota_trimestral DECIMAL(5,2), -- Suma total (sobre 100)
    cualitativo VARCHAR(50), -- Valoración Cualitativa
    
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id),
    FOREIGN KEY (idDocente) REFERENCES docente(id)
);