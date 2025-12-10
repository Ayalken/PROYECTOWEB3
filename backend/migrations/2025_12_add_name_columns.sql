START TRANSACTION;

ALTER TABLE estudiante
  ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS nombres VARCHAR(200) NULL;


UPDATE estudiante
SET
  apellido_paterno = TRIM(SUBSTRING_INDEX(apellidos_nombres, ' ', 1)),
  apellido_materno = TRIM(
    IF((CHAR_LENGTH(apellidos_nombres) - CHAR_LENGTH(REPLACE(apellidos_nombres, ' ', ''))) >= 1,
       SUBSTRING_INDEX(SUBSTRING_INDEX(apellidos_nombres, ' ', 2), ' ', -1),
       ''
    )
  ),
  nombres = TRIM(
    IF((CHAR_LENGTH(apellidos_nombres) - CHAR_LENGTH(REPLACE(apellidos_nombres, ' ', ''))) >= 2,
       SUBSTRING(apellidos_nombres, LOCATE(' ', apellidos_nombres, LOCATE(' ', apellidos_nombres) + 1) + 1),
       ''
    )
  )
WHERE apellidos_nombres IS NOT NULL AND apellidos_nombres <> '';

-- 3) Añadir columnas a `docente`
ALTER TABLE docente
  ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS nombres VARCHAR(200) NULL;

-- 4) Población para docentes
UPDATE docente
SET
  apellido_paterno = TRIM(SUBSTRING_INDEX(apellidos_nombres, ' ', 1)),
  apellido_materno = TRIM(
    IF((CHAR_LENGTH(apellidos_nombres) - CHAR_LENGTH(REPLACE(apellidos_nombres, ' ', ''))) >= 1,
       SUBSTRING_INDEX(SUBSTRING_INDEX(apellidos_nombres, ' ', 2), ' ', -1),
       ''
    )
  ),
  nombres = TRIM(
    IF((CHAR_LENGTH(apellidos_nombres) - CHAR_LENGTH(REPLACE(apellidos_nombres, ' ', ''))) >= 2,
       SUBSTRING(apellidos_nombres, LOCATE(' ', apellidos_nombres, LOCATE(' ', apellidos_nombres) + 1) + 1),
       ''
    )
  )
WHERE apellidos_nombres IS NOT NULL AND apellidos_nombres <> '';

COMMIT;

