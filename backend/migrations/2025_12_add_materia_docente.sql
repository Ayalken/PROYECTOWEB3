-- Migration: Añadir columna 'materia' a la tabla docente
-- Fecha: 2025-12-10

START TRANSACTION;

ALTER TABLE docente
  ADD COLUMN IF NOT EXISTS materia VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS curso_asignado VARCHAR(100) NULL;

COMMIT;

-- Nota: 'curso_asignado' permite guardar el curso que el docente atenderá (ej: 5 "B").
