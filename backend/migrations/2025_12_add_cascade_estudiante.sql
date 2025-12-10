START TRANSACTION;

DROP TABLE IF EXISTS notas_tmp;
CREATE TABLE notas_tmp (
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
    INDEX idx_notas_estudiante (idEstudiante),
    INDEX idx_notas_docente (idDocente),
    CONSTRAINT fk_notas_estudiante FOREIGN KEY (idEstudiante) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_notas_docente FOREIGN KEY (idDocente) REFERENCES docente(id) ON DELETE SET NULL
);
-- Copiar datos si existe la tabla original
INSERT INTO notas_tmp (id, idEstudiante, idDocente, area, trimestre, prom_ser, prom_saber, prom_hacer, prom_decidir, examen_nota, autoeval_nota, nota_trimestral, cualitativo)
SELECT id, idEstudiante, idDocente, area, trimestre, prom_ser, prom_saber, prom_hacer, prom_decidir, examen_nota, autoeval_nota, nota_trimestral, cualitativo FROM notas;
DROP TABLE IF EXISTS notas;
RENAME TABLE notas_tmp TO notas;

-- 2) asistencia -> re-crear con ON DELETE CASCADE
DROP TABLE IF EXISTS asistencia_tmp;
CREATE TABLE asistencia_tmp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    idDocente INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora TIME NOT NULL,
    estado ENUM('presente', 'ausente', 'retardo') DEFAULT 'presente',
    observaciones TEXT,
    INDEX idx_asistencia_fecha (fecha),
    INDEX idx_asistencia_estudiante (idEstudiante),
    CONSTRAINT fk_asistencia_estudiante FOREIGN KEY (idEstudiante) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_asistencia_docente FOREIGN KEY (idDocente) REFERENCES docente(id) ON DELETE SET NULL
);
INSERT INTO asistencia_tmp (id, idEstudiante, idDocente, fecha, hora, estado, observaciones)
SELECT id, idEstudiante, idDocente, fecha, hora, estado, observaciones FROM asistencia;
DROP TABLE IF EXISTS asistencia;
RENAME TABLE asistencia_tmp TO asistencia;

-- 3) nota_detalle -> re-crear con ON DELETE CASCADE
DROP TABLE IF EXISTS nota_detalle_tmp;
CREATE TABLE nota_detalle_tmp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEstudiante INT NOT NULL,
    semestre INT NOT NULL,
    tipo ENUM('tarea','examen','proyecto') NOT NULL,
    descripcion VARCHAR(100),
    nota DECIMAL(5,2) NOT NULL,
    fecha DATE,
    materia_id INT NULL,
    INDEX idx_notadet_estudiante (idEstudiante),
    CONSTRAINT fk_notadet_estudiante FOREIGN KEY (idEstudiante) REFERENCES estudiante(id) ON DELETE CASCADE
);
INSERT INTO nota_detalle_tmp (id, idEstudiante, semestre, tipo, descripcion, nota, fecha, materia_id)
SELECT id, idEstudiante, semestre, tipo, descripcion, nota, fecha, materia_id FROM nota_detalle;
DROP TABLE IF EXISTS nota_detalle;
RENAME TABLE nota_detalle_tmp TO nota_detalle;

COMMIT;
