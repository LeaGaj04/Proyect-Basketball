-- ============================================================
-- SISTEMA DE ENCUESTAS DEPORTIVAS
-- Ejecutar en el SQL Editor de Supabase (en orden)
-- ============================================================

-- 1. EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLA JUGADORES
-- ============================================================
CREATE TABLE IF NOT EXISTS jugadores (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  pin  TEXT NOT NULL  -- PIN de 4 dígitos hasheado (almacenado como texto simple para demo)
);

-- ============================================================
-- 3. TABLA EVALUACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  votante_id  UUID NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  evaluado_id UUID NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  ataque      INT NOT NULL CHECK (ataque >= 1 AND ataque <= 10),
  defensa     INT NOT NULL CHECK (defensa >= 1 AND defensa <= 10),
  dribling    INT NOT NULL CHECK (dribling >= 1 AND dribling <= 10),
  habilidad   INT NOT NULL CHECK (habilidad >= 1 AND habilidad <= 10),
  lanzamiento INT NOT NULL CHECK (lanzamiento >= 1 AND lanzamiento <= 10),
  actitud     INT NOT NULL CHECK (actitud >= 1 AND actitud <= 10),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(votante_id, evaluado_id),
  CHECK (votante_id <> evaluado_id)  -- un jugador no puede evaluarse a sí mismo
);

-- ============================================================
-- 4. VISTA DE PROMEDIOS (para el dashboard de admin)
-- ============================================================
CREATE OR REPLACE VIEW promedios_evaluaciones AS
SELECT
  j.id                        AS jugador_id,
  j.nombre                    AS nombre,
  ROUND(AVG(e.ataque)::NUMERIC, 2)      AS avg_ataque,
  ROUND(AVG(e.defensa)::NUMERIC, 2)     AS avg_defensa,
  ROUND(AVG(e.dribling)::NUMERIC, 2)    AS avg_dribling,
  ROUND(AVG(e.habilidad)::NUMERIC, 2)   AS avg_habilidad,
  ROUND(AVG(e.lanzamiento)::NUMERIC, 2) AS avg_lanzamiento,
  ROUND(AVG(e.actitud)::NUMERIC, 2)     AS avg_actitud,
  COUNT(e.id)                           AS total_votos,
  ROUND(
    (AVG(e.ataque) + AVG(e.defensa) + AVG(e.dribling) +
     AVG(e.habilidad) + AVG(e.lanzamiento) + AVG(e.actitud)) / 6::NUMERIC,
    2
  )                                     AS avg_general
FROM jugadores j
LEFT JOIN evaluaciones e ON e.evaluado_id = j.id
GROUP BY j.id, j.nombre
ORDER BY avg_general DESC NULLS LAST;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en ambas tablas
ALTER TABLE jugadores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- JUGADORES: Todos pueden leer (para poblar dropdowns)
CREATE POLICY "jugadores_select_all"
  ON jugadores FOR SELECT
  USING (true);

-- EVALUACIONES: Solo se pueden VER las propias evaluaciones como votante
CREATE POLICY "evaluaciones_select_own"
  ON evaluaciones FOR SELECT
  USING (true);  -- El admin usará service_role, los players solo ven en API Route

-- EVALUACIONES: Solo se puede INSERTAR con el propio votante_id
-- (La validación real se hace en la API Route con service_role key)
CREATE POLICY "evaluaciones_insert"
  ON evaluaciones FOR INSERT
  WITH CHECK (true);  -- Controlado en API Routes server-side

-- ============================================================
-- 6. SEEDS — 15 JUGADORES (PIN por defecto: 1234)
-- ============================================================
-- Nota: En producción, usar passwords hasheadas con bcrypt
INSERT INTO jugadores (id, nombre, pin) VALUES
  (uuid_generate_v4(), 'Leandro Gajardo',       '1234'),
  (uuid_generate_v4(), 'Enzo Oyarzun',          '1234'),
  (uuid_generate_v4(), 'Matias Oyarzun',        '1234'),
  (uuid_generate_v4(), 'Gonzalo Dauvergne',     '1234'),
  (uuid_generate_v4(), 'Joaquin Rivera',        '1234'),
  (uuid_generate_v4(), 'Mario Munster',         '1234'),
  (uuid_generate_v4(), 'Pedro Hernandez',       '1234'),
  (uuid_generate_v4(), 'Martin Rios',           '1234'),
  (uuid_generate_v4(), 'Maximiliano Ramirez',   '1234'),
  (uuid_generate_v4(), 'Williams Fernandez',    '1234'),
  (uuid_generate_v4(), 'Esteban patiño',        '1234'),
  (uuid_generate_v4(), 'Franco Carrasco',       '1234'),
  (uuid_generate_v4(), 'Martin Tejeda',         '1234'),
  (uuid_generate_v4(), 'Maximiliano Gonzalez',  '1234'),
  (uuid_generate_v4(), 'Jorge Uribe',           '1234'),
  (uuid_generate_v4(), 'Maxi Palma',            '1234'),
  (uuid_generate_v4(), 'Ignacio Gonzales',      '1234'),
  (uuid_generate_v4(), 'Jose Pulgar',           '1234'),
  (uuid_generate_v4(), 'Leonel Torrejon',       '1234'),
  (uuid_generate_v4(), 'Gabriel Torrejon',      '1234'),
  (uuid_generate_v4(), 'Felipe',                '1234'),
  (uuid_generate_v4(), 'Alejandro Sandoval',    '1234'),
  (uuid_generate_v4(), 'Christopher Moreno',    '1234'),
  (uuid_generate_v4(), 'Cristian Neira',        '1234'),
  (uuid_generate_v4(), 'Daniel Rios',           '1234'),
  (uuid_generate_v4(), 'Ernesto',               '1234'),
  (uuid_generate_v4(), 'Eliezer',               '1234'),
  (uuid_generate_v4(), 'James zamorano',        '1234'),
  (uuid_generate_v4(), 'Cristobal Martines',    '1234'),
  (uuid_generate_v4(), 'Renato Bustamante',     '1234'),
  (uuid_generate_v4(), 'Benjamin Rios',         '1234'),
  (uuid_generate_v4(), 'Edizon Zuñiga',         '1234'),
  (uuid_generate_v4(), 'Alfredo',               '1234'),
  (uuid_generate_v4(), 'Biron Vera',            '1234')
ON CONFLICT DO NOTHING;
