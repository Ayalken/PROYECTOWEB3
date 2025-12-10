-- Tabla de Asistencia (Registro de asistencia por estudiante)
CREATE TABLE IF NOT EXISTS asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    idDocente INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora TIME NOT NULL,
    estado ENUM('presente', 'ausente', 'retardo') DEFAULT 'presente',
    observaciones TEXT,
    FOREIGN KEY (idEstudiante) REFERENCES estudiante(id),
    FOREIGN KEY (idDocente) REFERENCES docente(id),
    INDEX idx_fecha (fecha),
    INDEX idx_estudiante (idEstudiante)
);
