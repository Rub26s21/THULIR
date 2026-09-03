# Testing & QA Verification Matrix

## Verification Methodology & Categories

To maintain engineering truth, verification is separated into distinct categories:

- **VERIFIED**: Executed and tested successfully in the development environment.
- **VERIFIED BY LOCAL ENVIRONMENT**: Local development environment successfully connected to and tested against the live cloud database.
- **CODE VERIFIED**: Implementation exists and passed source/build inspection.
- **REQUIRES PHYSICAL VERIFICATION**: Requires physical hardware (ESP8266 + 6 physical sensors).

---

## Master QA Matrix

| Area | Status | Evidence |
|---|---|---|
| **Dependencies** | **VERIFIED** | `npm install` completed successfully |
| **TypeScript** | **VERIFIED** | `tsc -b` completed without errors |
| **Linting** | **VERIFIED** | `oxlint` completed with 0 warnings and 0 errors |
| **Production Build** | **VERIFIED** | `vite build` generated production bundle in `dist/` |
| **Local Dashboard** | **VERIFIED** | Vite dev server running on `http://127.0.0.1:5173/` |
| **Browser UI** | **VERIFIED** | UI components rendered and tested via browser automation |
| **Demo Mode** | **VERIFIED** | Synthetic streaming telemetry tested with instant UI toggle |
| **Risk Engine** | **VERIFIED** | `NORMAL`, `WATCH`, and `CRITICAL` evaluation logic tested |
| **Alert Engine** | **VERIFIED** | Client-side deduplication, ACK, and auto-resolution tested |
| **ML Layer** | **VERIFIED** | Rule-based fallback tested and verified with clear UI labeling |
| **Supabase Client** | **VERIFIED BY LOCAL ENVIRONMENT** | Supabase client initialized and queried live `sensor_data` records |
| **Supabase Realtime** | **VERIFIED BY LOCAL ENVIRONMENT** | Realtime subscription on `sensor_data` verified (`SUBSCRIBED`) |
| **Supabase Migration Reference** | **CODE VERIFIED** | Reference DDL created in repository (`supabase/migrations/001_initial_schema.sql`) |
| **ESP8266 Firmware** | **CODE VERIFIED** | Firmware source implemented and validated (`firmware/node_01/node_01.ino`) |
| **Physical Sensor Readings** | **REQUIRES PHYSICAL VERIFICATION** | Requires physical sensors wired to ESP8266 |
| **ESP → Supabase Ingestion** | **REQUIRES PHYSICAL VERIFICATION** | Requires physical NODE_01 transmission over Wi-Fi |
| **End-to-End Hardware → Dashboard** | **REQUIRES PHYSICAL VERIFICATION** | Requires physical NODE_01 transmitting to Supabase and viewed on dashboard |

---

## Security Audit Summary

- No service-role key exposed in frontend.
- No secret key exposed in frontend.
- No backend credentials committed to client source.
- Supabase client credential loaded through environment configuration (`.env.local`).
- RLS policies documented in SQL reference.
- `.env.local` is excluded from source control via `.gitignore`.
