START TRANSACTION;

-- Crear tabla materias
CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columna materia_id a nota_detalle (si no existe)
ALTER TABLE nota_detalle
  ADD COLUMN IF NOT EXISTS materia_id INT NULL;

COMMIT;
