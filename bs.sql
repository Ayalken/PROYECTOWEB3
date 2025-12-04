CREATE DATABASE registro_notas;
USE registro_notas;

-- Tabla de estudiantes
-- MODIFICAR la tabla estudiante
CREATE TABLE estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Datos del Estudiante
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
    exp_tutor VARCHAR(5),
    ocupacion_tutor VARCHAR(50),
    telefono_celular_tutor VARCHAR(20),
    domicilio VARCHAR(150),
    -- Otros datos
    curso VARCHAR(10),
    docente_id INT, -- FK a la nueva tabla docente
    activo TINYINT DEFAULT 1
);

-- Datos iniciales (opcional)
INSERT INTO estudiante(nombre, apellido, ci) VALUES 
('Juan', 'Pérez', '123456'),
('María', 'Lopez', '789012'),
('Luis', 'García', '456789');

-------------------------------------------------------

-- Tabla de notas
-- Nueva Tabla de Docentes
CREATE TABLE docente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellidos_nombres VARCHAR(100) NOT NULL,
    ci VARCHAR(20),
    -- Otros campos similares a la tabla estudiante para consistencia 
    activo TINYINT DEFAULT 1
);

-- MODIFICAR la tabla notas para reflejar los subcampos de la libreta
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    idDocente INT,
    area VARCHAR(50) NOT NULL, -- Lenguaje, Matemática, etc.
    trimestre INT NOT NULL, -- 1, 2, o 3
    
    -- Subcampos SER (Ser, Prom_Ser) [cite: 19]
    ser_nota DECIMAL(5,2),
    prom_ser DECIMAL(5,2),
    
    -- Subcampos SABER (Examen, Prom_Saber) [cite: 19]
    examen_nota DECIMAL(5,2),
    prom_saber DECIMAL(5,2),
    
    -- Subcampos HACER (Hacer, Prom_Hacer) [cite: 19]
    hacer_nota DECIMAL(5,2),
    prom_hacer DECIMAL(5,2),
    
    -- Subcampos DECIDIR (Decidir, Prom_Decidir) [cite: 19]
    decidir_nota DECIMAL(5,2),
    prom_decidir DECIMAL(5,2),
    
    -- Autoevaluación y Nota Final [cite: 19]
    autoeval_nota DECIMAL(5,2),
    nota_trimestral DECIMAL(5,2),
    cualitativo VARCHAR(5),
    
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id),
    FOREIGN KEY (idDocente) REFERENCES docente(id)

    -- Tabla de Usuarios para Autenticación
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Para guardar la contraseña encriptada
    rol VARCHAR(20) DEFAULT 'docente', -- Para gestionar permisos
    activo TINYINT DEFAULT 1
);

-- Tabla para el Log de Acceso (Seguridad Requerida)
CREATE TABLE log_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    ip_acceso VARCHAR(45) NOT NULL,
    evento ENUM('ingreso', 'salida') NOT NULL,
    browser_agente VARCHAR(255) NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
);

-- Datos iniciales (opcional)
INSERT INTO notas(idEstudiante, materia, nota1, nota2, notaFinal) VALUES
(1, 'Matemática', 80, 70, 75),
(2, 'Física', 90, 85, 88),
(3, 'Programación', 60, 70, 65);

-------------------------------------------------------

-- Tabla de campos extra (para agregar campos dinámicos)
CREATE TABLE campos_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombreCampo VARCHAR(50),
    tipoCampo VARCHAR(20)
);

-- Ejemplos de campos extra
INSERT INTO campos_extra(nombreCampo, tipoCampo) VALUES
('asistencia', 'number'),
('proyecto_final', 'number');
