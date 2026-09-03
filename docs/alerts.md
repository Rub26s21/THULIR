# Risk Engine & Alert System

## Centralized Thresholds

All thresholds are centrally defined in [`src/config/thresholds.ts`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/src/config/thresholds.ts):

| Sensor / Metric | Watch Threshold | Critical Threshold | Unit | Direction |
|---|---|---|---|---|
| **Tilt X** | 5.0 | 15.0 | ° | Absolute |
| **Tilt Y** | 5.0 | 15.0 | ° | Absolute |
| **Atmospheric Pressure** | 980.0 | 950.0 | hPa | Below |
| **Gas (Raw)** | 400 | 700 | raw | Above |
| **Temperature** | 40.0 | 50.0 | °C | Above |
| **Humidity** | 80.0 | 90.0 | % | Above |
| **Displacement / Distance** | 10.0 | 5.0 | cm | Below |
| **Vibration RMS** | 0.50 | 1.50 | m/s² | Above |

---

## Risk States

1. **NORMAL**: All sensor metrics remain within nominal operational boundaries.
2. **WATCH**: At least one metric exceeds or falls below its watch limit.
3. **CRITICAL**: At least one metric crosses into critical territory.

---

## Alert Lifecycle

- **Generation**: Triggered immediately when a sensor reading crosses a threshold.
- **Deduplication**: Active alert keys prevent repetitive alert flooding.
- **Acknowledgment**: Operators can acknowledge active alerts directly via the UI (`ACK` button).
- **Auto-Resolution**: When the physical measurement returns to safe bounds, the alert transitions to `RESOLVED`.
