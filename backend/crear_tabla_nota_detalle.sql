-- Tabla para tareas, exámenes y proyectos por estudiante y semestre
CREATE TABLE IF NOT EXISTS nota_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    semestre INT NOT NULL,
    tipo ENUM('tarea','examen','proyecto') NOT NULL,
    descripcion VARCHAR(100),
    nota DECIMAL(5,2) NOT NULL,
    fecha DATE,
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id)
);