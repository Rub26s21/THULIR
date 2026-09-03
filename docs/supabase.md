# Supabase & Database Configuration

## Supabase Instance

- **Project URL**: `https://cdsjgvpjvyewepgalset.supabase.co`
- **Ingestion Endpoint**: `https://cdsjgvpjvyewepgalset.supabase.co/rest/v1/sensor_data`

---

## Database Schema

```sql
-- Core sensor data table
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

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_node_id ON public.sensor_data (node_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON public.sensor_data (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_event_id ON public.sensor_data (event_id);
```

---

## Row Level Security (RLS)

1. **sensor_data INSERT Policy**: Allows `anon` role to insert telemetry from ESP8266.
2. **sensor_data SELECT Policy**: Allows `anon` role to query records for the localhost dashboard.
3. **alerts Table Policy**: Allows reading and updating alert status.

---

## Enabling Supabase Realtime

In the Supabase Dashboard:
1. Navigate to **Database → Publications**.
2. Ensure the `supabase_realtime` publication includes `sensor_data` and `alerts`.
3. Alternatively, execute:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
   ```
