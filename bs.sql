CREATE DATABASE registro_notas;
USE registro_notas;

-- Tabla de estudiantes
CREATE TABLE estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    ci VARCHAR(20),
    activo TINYINT DEFAULT 1
);

-- Datos iniciales (opcional)
INSERT INTO estudiante(nombre, apellido, ci) VALUES 
('Juan', 'Pérez', '123456'),
('María', 'Lopez', '789012'),
('Luis', 'García', '456789');

-------------------------------------------------------

-- Tabla de notas
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT,
    materia VARCHAR(50),
    nota1 DECIMAL(5,2),
    nota2 DECIMAL(5,2),
    notaFinal DECIMAL(5,2),
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id)
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
