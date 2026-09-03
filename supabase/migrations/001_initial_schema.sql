-- ============================================================
-- THULIR - Supabase Database Migration
-- ============================================================
-- RUN THIS ONLY IF the tables do not already exist.
-- INSPECT the live schema first before executing.
-- ============================================================

-- ============================================================
-- sensor_data table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sensor_data (
  id            BIGSERIAL PRIMARY KEY,
  node_id       TEXT NOT NULL DEFAULT 'NODE_01',
  event_id      TEXT,
  tilt_x        DOUBLE PRECISION,
  tilt_y        DOUBLE PRECISION,
  pressure      DOUBLE PRECISION,
  gas_raw       INTEGER,
  temperature   DOUBLE PRECISION,
  humidity      DOUBLE PRECISION,
  distance_cm   DOUBLE PRECISION,
  vib_rms       DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sensor_data_node_id ON public.sensor_data (node_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON public.sensor_data (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_event_id ON public.sensor_data (event_id);

-- Unique constraint for duplicate protection
-- ALTER TABLE public.sensor_data ADD CONSTRAINT uq_sensor_data_event_id UNIQUE (event_id);
-- NOTE: Uncomment above only if event_id is guaranteed unique and non-null.

-- ============================================================
-- alerts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id            BIGSERIAL PRIMARY KEY,
  node_id       TEXT NOT NULL DEFAULT 'NODE_01',
  sensor        TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'INFO',
  message       TEXT,
  value         DOUBLE PRECISION,
  threshold     DOUBLE PRECISION,
  status        TEXT NOT NULL DEFAULT 'ACTIVE',
  acknowledged  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_node_id ON public.alerts (node_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts (created_at DESC);

-- ============================================================
-- ml_predictions table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id              BIGSERIAL PRIMARY KEY,
  node_id         TEXT NOT NULL DEFAULT 'NODE_01',
  prediction      TEXT NOT NULL,
  confidence      DOUBLE PRECISION,
  model_version   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_node_id ON public.ml_predictions (node_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON public.ml_predictions (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

-- sensor_data: anon can INSERT (ESP8266) and SELECT (dashboard)
CREATE POLICY IF NOT EXISTS "anon_insert_sensor_data"
  ON public.sensor_data
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_select_sensor_data"
  ON public.sensor_data
  FOR SELECT
  TO anon
  USING (true);

-- alerts: anon can full CRUD for prototype
-- SECURITY NOTE: In production, restrict INSERT/UPDATE to authenticated roles
CREATE POLICY IF NOT EXISTS "anon_select_alerts"
  ON public.alerts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "anon_insert_alerts"
  ON public.alerts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_update_alerts"
  ON public.alerts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ml_predictions: anon can SELECT only
CREATE POLICY IF NOT EXISTS "anon_select_ml_predictions"
  ON public.ml_predictions
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable Supabase Realtime for sensor_data inserts
-- Run this in the Supabase SQL editor:
--
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
--
-- NOTE: This may already be configured in your Supabase project.
-- Check Database → Replication in the Supabase dashboard.

-- ============================================================
-- SECURITY NOTES
-- ============================================================
-- This prototype uses anon key for both ESP8266 and browser.
-- The anon key is a public/publishable key designed for client use.
--
-- LIMITATIONS:
-- - Anyone with the anon key can INSERT into sensor_data
-- - Anyone with the anon key can read all sensor data
-- - For production: implement authentication + more restrictive RLS
-- - For production: move ESP8266 to authenticated API key
