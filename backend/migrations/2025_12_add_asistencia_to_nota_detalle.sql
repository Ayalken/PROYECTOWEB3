-- Agregar 'asistencia' al ENUM de tipo en tabla nota_detalle
ALTER TABLE nota_detalle MODIFY COLUMN tipo ENUM('tarea','examen','proyecto','asistencia') NOT NULL;
