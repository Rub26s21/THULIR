# Hardware & Pinout Reference

## Node Controller
- **Microcontroller**: ESP8266 NodeMCU 1.0 (ESP-12E)
- **Node Identifier**: `NODE_01`
- **Serial Baud Rate**: 115200 baud
- **Supply Voltage**: 5V via USB / VIN

---

## Sensor Specifications & Pinout

| Sensor | Subsystem | Responsibility | Physical Pin | ESP8266 Pin | Notes |
|---|---|---|---|---|---|
| **MPU6050** | I2C | Tilt X, Tilt Y | SDA, SCL | D2 (GPIO4), D1 (GPIO5) | 3.3V power |
| **BMP280** | I2C | Atmospheric Pressure | SDA, SCL | D2 (GPIO4), D1 (GPIO5) | Default I2C 0x76 / 0x77 |
| **ADXL345** | I2C | Vibration RMS | SDA, SCL | D2 (GPIO4), D1 (GPIO5) | 50-sample RMS calculation of deviation from 1g |
| **DHT22** | Single-bus | Temp & Humidity | DATA | D7 (GPIO13) | 10kΩ pull-up to 3.3V |
| **MQ-2** | Analog | Raw Gas Level | AO | A0 (ADC0) | Raw ADC reading |
| **HC-SR04** | Ultrasonic | Distance Measurement | TRIG, ECHO | D5 (GPIO14), D6 (GPIO12) | ECHO is voltage-protected |

---

## Important Hardware Details

### MQ-2 Gas Sensor
MQ-2 provides a raw analog gas sensor reading (`gas_raw`). It represents the uncalibrated raw ADC reading from pin A0. Do not treat this as calibrated ppm without a laboratory calibration procedure.

### HC-SR04 Ultrasonic Distance Sensor
HC-SR04 measures distance in centimeters. Changes in measured distance can be used as a displacement indicator when the sensor is mechanically positioned for that purpose.

> [!WARNING]
> **HC-SR04 ECHO Voltage Protection**: HC-SR04 returns a 5V echo pulse. ESP8266 GPIO pins are strictly rated for 3.3V. HC-SR04 ECHO is voltage-protected before connection to the ESP8266 GPIO input (e.g. voltage divider: 1kΩ from ECHO to D6, and 2kΩ from D6 to GND).

### ADXL345 Vibration Sensor
ADXL345 vibration measurement uses a 50-sample RMS calculation. In the firmware implementation, it samples 50 acceleration readings, calculates the Euclidean magnitude $\sqrt{a_x^2 + a_y^2 + a_z^2}$, subtracts the $9.81\text{ m/s}^2$ static gravity baseline, and computes the root-mean-square of the residual acceleration.
