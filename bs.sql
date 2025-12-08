-- 1. CREACIÓN Y USO DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS registro_notas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE registro_notas;

-- 2. SEGURIDAD Y LOG DE ACCESO (Requisitos del Licenciado)

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
    evento ENUM('ingreso', 'salida') NOT NULL, 
    browser_agente VARCHAR(255) NOT NULL, 
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- 3. TABLA DE DOCENTES 
CREATE TABLE IF NOT EXISTS docente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellidos_nombres VARCHAR(100) NOT NULL,
    ci VARCHAR(20),
    telefono VARCHAR(20),
    activo TINYINT DEFAULT 1 
);

-- 4. TABLA DE ESTUDIANTES 
CREATE TABLE IF NOT EXISTS estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellidos_nombres VARCHAR(100) NOT NULL,
    carnet_identidad VARCHAR(20) NOT NULL,
    expedido VARCHAR(5),
    fecha_nac_dia INT,
    fecha_nac_mes INT,
    fecha_nac_anio INT,
    edad INT,
    sexo CHAR(1),
    desviado_procedencia VARCHAR(50),
    apellidos_nombres_tutor VARCHAR(100),
    ci_tutor VARCHAR(20),
    ocupacion_tutor VARCHAR(50),
    telefono_celular_tutor VARCHAR(20),
    domicilio VARCHAR(150),
    unidad_educativa VARCHAR(100),
    curso VARCHAR(10),
    docente_id INT, 
    activo TINYINT DEFAULT 1, 
    
    FOREIGN KEY (docente_id) REFERENCES docente(id)
);

-- 5. TABLA DE CAMPOS EXTRA

CREATE TABLE IF NOT EXISTS campos_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreCampo VARCHAR(50), 
    tipoCampo VARCHAR(20) 
);

-- 6. TABLA DE NOTAS (Requisito: Estructura detallada Ser, Saber, Hacer, Decidir)

CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    idDocente INT,
    area VARCHAR(50) NOT NULL, 
    trimestre INT NOT NULL, 
    
    prom_ser DECIMAL(5,2), 
    prom_saber DECIMAL(5,2), 
    prom_hacer DECIMAL(5,2), 
    prom_decidir DECIMAL(5,2), 
    
    examen_nota DECIMAL(5,2), 
    
    autoeval_nota DECIMAL(5,2),
    nota_trimestral DECIMAL(5,2), 
    cualitativo VARCHAR(50), 
    
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id),
    FOREIGN KEY (idDocente) REFERENCES docente(id)
);