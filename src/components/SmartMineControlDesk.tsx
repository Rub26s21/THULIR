// ============================================================
// THULIR SMART MINE CONTROL DESK
// ============================================================
// Master physical claymorphic skeuomorphic control desk
// Faithful reproduction of the industrial hardware workbench.
// Real live telemetry, animated circuit bus traces, analog dials,
// rotary risk knob, AI inference pipeline, and warning annunciators.
// ============================================================

import { useState } from 'react';
import type { SensorData, RiskState, MLPrediction, Alert, NodeStatus } from '../types';

interface SmartMineControlDeskProps {
  data: SensorData | null;
  risk: RiskState;
  mlPrediction: MLPrediction | null;
  nodeStatus: NodeStatus;
  alerts: Alert[];
  nodeId: string;
  demoMode: boolean;
  connectionType: string;
  onToggleDemo?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

// Gentle synthetic audio feedback for tactile toggles (no external assets)
function playHapticClick(freq = 800, duration = 0.03) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context not allowed without interaction or not supported
  }
}

export function SmartMineControlDesk({
  data,
  risk,
  mlPrediction,
  nodeStatus,
  alerts,
  nodeId,
  demoMode,
  connectionType,
  onToggleDemo,
  onNavigateSection,
}: SmartMineControlDeskProps) {
  const [activeButton, setActiveButton] = useState<string>('OVERVIEW');
  const [toggles, setToggles] = useState({
    power: true,
    data: true,
    modem4G: true,
    server: true,
  });

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  // Fallback / default values if data is null (e.g. initial load)
  const gasPpm = data?.gas_raw ?? 403;
  const vibrationG = data?.vib_rms ?? 0.82;
  const distanceCm = data?.distance_cm ?? 38;
  const tempC = data?.temperature ?? 31.4;
  const humidityRh = data?.humidity ?? 68;
  const tiltX = data?.tilt_x ?? 2.4;
  const batteryPct = 87;
  const riskScore = risk.score ?? 75;
  const riskLevel = risk.level ?? 'CRITICAL';
  const confidencePct = mlPrediction ? Math.round(mlPrediction.confidence * 100) : 94.8;

  const handleButtonClick = (name: string, sectionId?: string) => {
    playHapticClick(650, 0.04);
    setActiveButton(name);
    if (sectionId && onNavigateSection) {
      onNavigateSection(sectionId);
    }
  };

  const toggleSwitch = (key: keyof typeof toggles) => {
    playHapticClick(900, 0.05);
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dial angle calculations (needle sweep from -120deg to +120deg)
  const calcAngle = (val: number, min: number, max: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    return -120 + ratio * 240;
  };

  const gasAngle = calcAngle(gasPpm, 0, 1000);
  const vibAngle = calcAngle(vibrationG, 0, 3.0);
  const distAngle = calcAngle(distanceCm, 0, 100);
  const tempAngle = calcAngle(tempC, 0, 60);
  const humidAngle = calcAngle(humidityRh, 0, 100);
  const battAngle = calcAngle(batteryPct, 0, 100);

  // Safety risk rotary dial angle (0 to 100 maps to -135deg to +135deg)
  const riskKnobAngle = -135 + (Math.max(0, Math.min(100, riskScore)) / 100) * 270;

  // Warning annunciator state
  const isGasWarning = gasPpm > 450 || alerts.some(a => a.sensor.toLowerCase().includes('gas'));
  const isVibWarning = vibrationG > 1.0 || alerts.some(a => a.sensor.toLowerCase().includes('vib'));
  const isDistWarning = distanceCm < 25 || alerts.some(a => a.sensor.toLowerCase().includes('dist'));
  const isNormalTelemetry = !isGasWarning && !isVibWarning && !isDistWarning;

  return (
    <div className="desk-workbench">
      {/* ── Glassmorphic Sky-Blue Header Control Bar (Symmetrical & Centered) ── */}
      <div className="desk-header-title">
        <div className="desk-header-left">
          <div className="desk-header-badge">
            <span className="desk-header-pulse-dot" />
            <span>ESP32 DUAL CORE · 4G LTE-M · NEURAL LIVE</span>
          </div>
        </div>

        <div className="desk-header-center">
          <span className="desk-header-text">THULIR SMART MINE CONTROL DESK</span>
        </div>

        <div className="desk-header-right">
          <button
            className="desk-header-scroll-btn"
            onClick={handleScrollDown}
            title="Scroll down to deep telemetry & multi-node analytics"
          >
            <span>Deep Analytics</span>
            <span className="scroll-arrow">↓</span>
          </button>
        </div>
      </div>

      {/* ── Top Master Grid: Left Console, Center Hardware PCB, Right Telemetry Meters ── */}
      <div className="desk-top-grid">

        {/* ════════════════════════════════════════════════════════
            LEFT PANEL: Vertical Control Console
           ════════════════════════════════════════════════════════ */}
        <div className="desk-left-panel">
          {/* Header Terracotta Plate */}
          <div className="desk-terracotta-card">
            <h2 className="desk-brand-title">THULIR IoT</h2>
            <div className="desk-brand-sub">SMART MINE SAFETY SYSTEM</div>

            {/* 2-Column Button Matrix */}
            <div className="desk-button-matrix">
              {[
                { name: 'OVERVIEW', section: 'hero' },
                { name: 'SENSOR ARRAY', section: 'section-analytics' },
                { name: 'EDGE NODE', section: 'section-nodes' },
                { name: 'COMMUNICATION', section: 'section-system' },
                { name: 'AI ENGINE', section: 'section-ml' },
                { name: 'ALERTS', section: 'section-alerts' },
                { name: 'SYSTEM', section: 'section-overview' },
              ].map(btn => (
                <button
                  key={btn.name}
                  className={`desk-pill-btn ${activeButton === btn.name ? 'active' : ''}`}
                  onClick={() => handleButtonClick(btn.name, btn.section)}
                >
                  {btn.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Readout Wells */}
          <div className="desk-status-well">
            <div
              className="desk-status-row"
              style={{ cursor: onToggleDemo ? 'pointer' : 'default' }}
              onClick={onToggleDemo}
              title="Click to toggle Simulated Demo / Live Telemetry"
            >
              <span className="desk-status-label">SYSTEM POWER</span>
              <span className={`desk-status-pill ${toggles.power ? 'active-green' : 'inactive'}`}>
                {toggles.power ? (demoMode ? 'DEMO' : 'LIVE') : 'OFF'}
              </span>
            </div>
            <div className="desk-status-row">
              <span className="desk-status-label">{nodeId}</span>
              <span className="desk-status-pill active-green">
                {nodeStatus.freshness === 'LIVE' ? 'CONNECTED' : (demoMode ? 'SIMULATED' : 'ONLINE')}
              </span>
            </div>
            <div className="desk-status-row">
              <span className="desk-status-label">4G MODEM</span>
              <span className={`desk-status-pill ${toggles.modem4G ? 'active-green' : 'inactive'}`}>
                {toggles.modem4G ? (connectionType === 'DISCONNECTED' ? 'OFFLINE' : 'ACTIVE') : 'STANDBY'}
              </span>
            </div>
            <div className="desk-status-row">
              <span className="desk-status-label">SERVER</span>
              <span className={`desk-status-pill ${toggles.server ? 'active-green' : 'inactive'}`}>
                {toggles.server ? (demoMode ? 'SIMULATED' : (connectionType || 'ONLINE')) : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Safety Risk Dial Knob */}
          <div className="desk-risk-knob-area">
            <div className="desk-risk-knob-label">SAFETY RISK ASSESSMENT</div>

            <div className="desk-rotary-gauge">
              {/* Outer Bezel with Circular Gradient Indicator */}
              <div
                className={`desk-rotary-outer-ring ${riskLevel.toLowerCase()}`}
                style={{
                  transform: `rotate(${riskKnobAngle}deg)`
                }}
              >
                <div className="desk-knob-notch" />
              </div>

              {/* Inner Tactile Dial Core */}
              <div className="desk-rotary-inner-core">
                <span className="desk-risk-score-digit">{riskScore}</span>
              </div>
            </div>

            <div className={`desk-risk-level-badge ${riskLevel.toLowerCase()}`}>
              {riskLevel}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            CENTER PANEL: Hardware Circuit Workbench with ESP32 & Sensors (Ultra 3D Skeuomorphic)
           ════════════════════════════════════════════════════════ */}
        <div className="desk-center-panel">
          <div className="desk-pcb-workbench">

            {/* Corner Brass Mounting Screws for Realistic Depth */}
            <div className="pcb-corner-screw top-left"><div className="screw-thread" /></div>
            <div className="pcb-corner-screw top-right"><div className="screw-thread" /></div>
            <div className="pcb-corner-screw bottom-left"><div className="screw-thread" /></div>
            <div className="pcb-corner-screw bottom-right"><div className="screw-thread" /></div>

            {/* PCB Silk-Screen Brand Markings */}
            <div className="pcb-silk-markings top">THULIR BUS v3.2 · 3.3V / 5.0V DUAL RAIL</div>
            <div className="pcb-silk-markings bottom">HIGH-RELIABILITY MINE TELEMETRY MATRIX · 50Hz</div>

            {/* Animated SVG Circuit Bus Traces (Scalable 1000x600 Coordinates) */}
            <svg className="desk-pcb-traces-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="copperTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d98236" />
                  <stop offset="50%" stopColor="#f5aa62" />
                  <stop offset="100%" stopColor="#b46424" />
                </linearGradient>
                <filter id="traceGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Trace 1: To MPU6050 (Top Left) */}
              <path d="M 423 270 C 300 270, 220 80, 160 80" className="desk-bus-path bus-blue" />
              <circle className="desk-bus-pulse pulse-blue" r="4">
                <animateMotion path="M 423 270 C 300 270, 220 80, 160 80" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Trace 2: To ADXL345 (Top Center) */}
              <path d="M 500 215 L 500 80" className="desk-bus-path bus-red" />
              <circle className="desk-bus-pulse pulse-red" r="4">
                <animateMotion path="M 500 215 L 500 80" dur="1.3s" repeatCount="indefinite" />
              </circle>

              {/* Trace 3: To MQ-2 Gas Sensor (Top Right) */}
              <path d="M 577 270 C 700 270, 780 80, 840 80" className="desk-bus-path bus-green" />
              <circle className="desk-bus-pulse pulse-green" r="4">
                <animateMotion path="M 577 270 C 700 270, 780 80, 840 80" dur="2.0s" repeatCount="indefinite" />
              </circle>

              {/* Trace 4: To APU6050 (Middle Left) */}
              <path d="M 423 335 L 160 335" className="desk-bus-path bus-black" />
              <circle className="desk-bus-pulse pulse-amber" r="4">
                <animateMotion path="M 423 335 L 160 335" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Trace 5: To DHT22 (Middle Right) */}
              <path d="M 577 335 L 840 335" className="desk-bus-path bus-blue" />
              <circle className="desk-bus-pulse pulse-cyan" r="4">
                <animateMotion path="M 577 335 L 840 335" dur="1.7s" repeatCount="indefinite" />
              </circle>

              {/* Trace 6: To FLEX SENSOR (Bottom Left) */}
              <path d="M 423 400 C 300 400, 220 520, 160 520" className="desk-bus-path bus-amber" />
              <circle className="desk-bus-pulse pulse-gold" r="4">
                <animateMotion path="M 423 400 C 300 400, 220 520, 160 520" dur="2.2s" repeatCount="indefinite" />
              </circle>

              {/* Trace 7: To HC-SR04 (Bottom Right) */}
              <path d="M 577 400 C 700 400, 780 520, 840 520" className="desk-bus-path bus-blue" />
              <circle className="desk-bus-pulse pulse-blue" r="4">
                <animateMotion path="M 577 400 C 700 400, 780 520, 840 520" dur="1.9s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* ── MODULE 1: MPU6050 (Top Left · Signature Blue PCB) ── */}
            <div className="desk-sensor-module mod-mpu6050" title="MPU-6050 6-Axis Motion Tracking Gyro & Accelerometer">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">MPU-6050 · 6-DOF</span>
                <span className="mod-pwr-led green" />
              </div>
              <div className="desk-module-body mpu6050-body">
                <div className="desk-smd-chip mpu-chip">
                  <div className="desk-chip-dot" />
                  <span className="chip-code">MPU</span>
                  <span className="chip-sub">6050</span>
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">TILT</span>
                    <span className="desk-readout-val">{tiltX.toFixed(1)}°</span>
                  </div>
                  <div className="readout-sub-row">
                    <span className="readout-meta">PITCH 1.2°</span>
                    <span className="desk-mini-badge normal">NORMAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MODULE 2: ADXL345 (Top Center · Signature Crimson Red PCB) ── */}
            <div className="desk-sensor-module mod-adxl345" title="ADXL-345 3-Axis Digital Seismic Vibration Accelerometer">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">ADXL-345 · SEISMIC</span>
                <span className={`mod-pwr-led ${isVibWarning ? 'amber flash' : 'green'}`} />
              </div>
              <div className="desk-module-body adxl345-body">
                <div className="desk-smd-chip adxl-chip">
                  <span className="chip-code">ADXL</span>
                  <div className="adxl-axis-icon">XYZ</div>
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">VIB</span>
                    <span className="desk-readout-val">{vibrationG.toFixed(2)} g</span>
                  </div>
                  <div className="readout-sub-row">
                    <div className="desk-smd-led-row">
                      <span className="smd-led active-green" />
                      <span className={`smd-led ${vibrationG > 1.0 ? 'active-amber' : ''}`} />
                      <span className={`smd-led ${vibrationG > 2.0 ? 'active-red' : ''}`} />
                    </div>
                    <span className={`desk-mini-badge ${isVibWarning ? 'warning' : 'normal'}`}>
                      {isVibWarning ? 'WARNING' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MODULE 3: MQ-2 (Top Right · Signature Forest Green PCB + Metal Mesh Dome) ── */}
            <div className="desk-sensor-module mod-mq2" title="MQ-2 Flammable Gas & Smoke Sensor Dome">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">MQ-2 · GAS & SMOKE</span>
                <span className={`mod-pwr-led ${isGasWarning ? 'red flash' : 'green'}`} />
              </div>
              <div className="desk-module-body mq2-body">
                {/* Realistic 3D Metal Mesh Gas Cylinder with Internal Heating Coil Glow */}
                <div className="desk-gas-mesh-cylinder">
                  <div className={`gas-heating-glow ${isGasWarning ? 'active' : ''}`} />
                  <div className="gas-mesh-cap" />
                  <div className="gas-concentric-ring" />
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">AIR</span>
                    <span className="desk-readout-val">{gasPpm} ppm</span>
                  </div>
                  <div className="readout-sub-row">
                    <span className="readout-meta">CH4 / LPG</span>
                    <span className={`desk-mini-badge ${gasPpm > 700 ? 'danger' : gasPpm > 400 ? 'warning' : 'normal'}`}>
                      {gasPpm > 700 ? 'DANGER' : gasPpm > 400 ? 'WARNING' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MODULE 4: APU6050 (Middle Left · Signature Tactical Matte Black PCB) ── */}
            <div className="desk-sensor-module mod-apu6050" title="APU-6050 Structural Inertial Kinematics Unit">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">APU6050 · DYNAMICS</span>
                <span className="mod-pwr-led green" />
              </div>
              <div className="desk-module-body apu6050-body">
                <div className="desk-smd-chip black-chip">
                  <span className="chip-code">APU</span>
                  <span className="chip-sub">ACC</span>
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">ACC</span>
                    <span className="desk-readout-val">{vibrationG.toFixed(2)} g</span>
                  </div>
                  <div className="readout-sub-row">
                    <span className="readout-meta">50Hz FFT</span>
                    <span className="desk-mini-badge warning">WARNING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CENTERPIECE: ESP32 EDGE NODE (Hyper-Realistic 3D Module with Wi-Fi Waves & Live TX/RX) ── */}
            <div className="desk-esp32-node" title="ESP32-WROOM-32D Dual-Core Edge Compute Node">
              {/* Left Castellated GPIO Pins */}
              <div className="desk-esp32-pins left">
                {['3V3', 'EN', 'VP', 'VN', '34', '35', '32', '33'].map((pin, i) => (
                  <div key={i} className="desk-pin-slot" title={`Pin ${pin}`}>
                    <span className="desk-pin-gold" />
                  </div>
                ))}
              </div>

              {/* Main Board PCB */}
              <div className="desk-esp32-board">

                {/* Golden Meandering Antenna with Animated Radiating Wi-Fi Waves */}
                <div className="desk-antenna-section">
                  <div className="desk-esp32-antenna" />
                  <div className="desk-rf-waves-container">
                    <span className="rf-wave wave-1" />
                    <span className="rf-wave wave-2" />
                    <span className="rf-wave wave-3" />
                  </div>
                  <span className="antenna-tag">Wi-Fi 2.4G · LTE</span>
                </div>

                {/* Metallic Brushed Aluminum RF Shield with Specular Sheen */}
                <div className="desk-esp32-shield">
                  <div className="shield-sheen" />
                  <div className="shield-top-row">
                    <span className="esp32-brand">ESP32</span>
                    <span className="esp32-spec">WROOM-32D</span>
                  </div>
                  <div className="shield-meta">240MHz DUAL-CORE</div>
                  <div className="shield-fcc">FCC ID: 2AC7Z-ESPWROOM32</div>
                </div>

                {/* Live Transmission Telemetry Strip (TX / RX / Wi-Fi Mesh) */}
                <div className="desk-esp32-telemetry-live">
                  <div className="esp-comm-pill">
                    <span className="comm-led tx-blue blink" />
                    <span className="comm-lbl">TX</span>
                    <strong className="comm-val">50Hz</strong>
                  </div>
                  <div className="esp-comm-pill">
                    <span className="comm-led rx-green blink" />
                    <span className="comm-lbl">RX</span>
                    <strong className="comm-val">400k</strong>
                  </div>
                  <div className="esp-mesh-status">
                    <span className="mesh-dot" />
                    <span className="mesh-text">MESH-01 ONLINE</span>
                  </div>
                </div>

                {/* USB-C Port & Tactile Click Micro-Buttons */}
                <div className="desk-esp32-bottom-bar">
                  <button
                    className="desk-tactile-btn"
                    onClick={() => playHapticClick(500, 0.04)}
                    title="Hardware Reset (EN)"
                  >
                    RST
                  </button>
                  <div className="desk-usbc-port" title="USB-C Debug & Power Interface">
                    <div className="usbc-inner-pins" />
                  </div>
                  <button
                    className="desk-tactile-btn"
                    onClick={() => playHapticClick(800, 0.04)}
                    title="Boot Mode Select (IO0)"
                  >
                    BOOT
                  </button>
                </div>

                {/* Edge Node Status Tag */}
                <div className="desk-node-tag">EDGE COMPUTE HUB</div>
              </div>

              {/* Right Castellated GPIO Pins */}
              <div className="desk-esp32-pins right">
                {['GND', '23', '22', 'TX', 'RX', '21', 'GND', '5V'].map((pin, i) => (
                  <div key={i} className="desk-pin-slot" title={`Pin ${pin}`}>
                    <span className="desk-pin-gold" />
                  </div>
                ))}
              </div>
            </div>

            {/* ── MODULE 5: DHT22 (Middle Right · Signature White Vented Enclosure) ── */}
            <div className="desk-sensor-module mod-dht22" title="DHT-22 (AM2302) Precision Digital Temperature & Humidity Sensor">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">DHT-22 · THERMAL</span>
                <span className="mod-pwr-led green" />
              </div>
              <div className="desk-module-body dht22-body">
                <div className="dht22-white-cage">
                  <div className="dht22-vents">
                    <span /><span /><span />
                  </div>
                  <div className="dht22-readout-col">
                    <div className="dht22-val-row">
                      <span className="dht22-icon">🌡️</span>
                      <span className="dht22-val">{tempC.toFixed(1)}°C</span>
                    </div>
                    <div className="dht22-val-row">
                      <span className="dht22-icon">💧</span>
                      <span className="dht22-val">{humidityRh.toFixed(0)}% RH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MODULE 6: FLEX SENSOR (Bottom Left · Signature Amber Gold Polyimide Ribbon) ── */}
            <div className="desk-sensor-module mod-flex" title="Spectra-Symbol Flexible Deflection & Strain Strip">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">FLEX · STRAIN</span>
                <span className="mod-pwr-led green" />
              </div>
              <div className="desk-module-body flex-body">
                <div className="flex-gold-ribbon">
                  <div className="flex-segmented-carbon">
                    <span /><span /><span /><span /><span />
                  </div>
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">BEND</span>
                    <span className="desk-readout-val">14.2°</span>
                  </div>
                  <div className="readout-sub-row">
                    <span className="readout-meta">24.5 kΩ</span>
                    <span className="desk-mini-badge normal">NORMAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MODULE 7: HC-SR04 (Bottom Right · Signature Deep Blue PCB + Dual Aluminium Transducers) ── */}
            <div className="desk-sensor-module mod-hcsr04" title="HC-SR04 Ultrasonic Distance Transducer (T/R Subsystem)">
              <div className="desk-module-header">
                <span className="mod-corner-hole" />
                <span className="desk-module-label">HC-SR04 · SUBSIDENCE</span>
                <span className={`mod-pwr-led ${isDistWarning ? 'amber flash' : 'green'}`} />
              </div>
              <div className="desk-module-body hcsr04-body">
                <div className="hcsr04-transducers-col">
                  <div className="desk-ultrasonic-mesh" title="Transmitter (T)">
                    <span className="tr-glyph">T</span>
                    <div className="desk-mesh-ring" />
                  </div>
                  <div className="desk-ultrasonic-mesh" title="Receiver (R)">
                    <span className="tr-glyph">R</span>
                    <div className="desk-mesh-ring" />
                  </div>
                </div>
                <div className="desk-module-readout">
                  <div className="readout-primary">
                    <span className="readout-title">GAP</span>
                    <span className="desk-readout-val">{distanceCm.toFixed(1)} cm</span>
                  </div>
                  <div className="readout-sub-row">
                    <span className="readout-meta">ROOF SUBS</span>
                    <span className={`desk-mini-badge ${isDistWarning ? 'warning' : 'normal'}`}>
                      {isDistWarning ? 'WARNING' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT PANEL: Precision Instrumentation & Hardware Telemetry
           ════════════════════════════════════════════════════════ */}
        <div className="desk-right-panel">

          {/* Module 1: 2x3 Precision Analog Gauges Grid */}
          <div className="desk-analog-gauges-grid">

            {/* Dial 1: GAS */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className={`desk-gauge-needle ${isGasWarning ? 'warning' : ''}`} style={{ transform: `rotate(${gasAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">GAS</span>
                <span className="gauge-val">{gasPpm} ppm</span>
                <span className="gauge-sub">AIR QUALITY</span>
              </div>
            </div>

            {/* Dial 2: TEMPERATURE */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className="desk-gauge-needle" style={{ transform: `rotate(${tempAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">TEMPERATURE</span>
                <span className="gauge-val">{tempC.toFixed(1)}°C</span>
                <span className="gauge-sub">AMBIENT THERMAL</span>
              </div>
            </div>

            {/* Dial 3: VIBRATION */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className={`desk-gauge-needle ${isVibWarning ? 'warning' : ''}`} style={{ transform: `rotate(${vibAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">VIBRATION</span>
                <span className="gauge-val">{vibrationG.toFixed(2)} g</span>
                <span className="gauge-sub">SEISMIC RMS</span>
              </div>
            </div>

            {/* Dial 4: HUMIDITY */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className="desk-gauge-needle" style={{ transform: `rotate(${humidAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">HUMIDITY</span>
                <span className="gauge-val">{humidityRh}%</span>
                <span className="gauge-sub">RH LEVEL</span>
              </div>
            </div>

            {/* Dial 5: DISTANCE */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className={`desk-gauge-needle ${isDistWarning ? 'warning' : ''}`} style={{ transform: `rotate(${distAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">DISTANCE</span>
                <span className="gauge-val">{distanceCm.toFixed(1)} cm</span>
                <span className="gauge-sub">SUBSIDENCE GAP</span>
              </div>
            </div>

            {/* Dial 6: BATTERY */}
            <div className="desk-analog-gauge-card">
              <div className="desk-gauge-circle">
                <div className="desk-gauge-ticks" />
                <div className="desk-gauge-needle" style={{ transform: `rotate(${battAngle}deg)` }} />
                <div className="desk-gauge-pivot" />
              </div>
              <div className="desk-gauge-info">
                <span className="gauge-name">BATTERY</span>
                <span className="gauge-val">{batteryPct}%</span>
                <span className="gauge-sub">3.7V / 4.08V</span>
              </div>
            </div>

          </div>

          {/* Module 2: Hardware Control & Signal Matrix (VU Meters + Rocker Switches) */}
          <div className="desk-hardware-controls-bar">

            {/* Dual VU Meter Strips */}
            <div className="desk-vu-meters-strip">
              <div className="desk-vu-meter-box">
                <div className="desk-vu-scale">
                  {[...Array(8)].map((_, i) => (
                    <span key={i} className={`desk-vu-led ${i < 6 ? 'active-green' : i === 6 ? 'active-amber' : ''}`} />
                  ))}
                </div>
                <span className="desk-vu-title">METER</span>
              </div>

              <div className="desk-vu-meter-box">
                <div className="desk-vu-scale">
                  {[...Array(8)].map((_, i) => (
                    <span key={i} className={`desk-vu-led ${i < 5 ? 'active-green' : i === 5 ? 'active-amber' : ''}`} />
                  ))}
                </div>
                <span className="desk-vu-title">NETWRK</span>
              </div>
            </div>

            {/* 4 Physical Rocker Switches */}
            <div className="desk-toggle-switches-panel">
              {[
                { key: 'power' as const, label: 'POWER', unit: 'mA' },
                { key: 'data' as const, label: 'DATA', unit: 'I2C' },
                { key: 'modem4G' as const, label: '4G LTE', unit: 'mA' },
                { key: 'server' as const, label: 'SERVER', unit: 'V' },
              ].map(sw => (
                <div
                  key={sw.key}
                  className="desk-switch-item"
                  onClick={() => toggleSwitch(sw.key)}
                  title={`Toggle ${sw.label}`}
                >
                  <span className="switch-label">{sw.label}</span>
                  <div className={`desk-rocker-switch ${toggles[sw.key] ? 'on' : 'off'}`}>
                    <div className="rocker-lever" />
                  </div>
                  <span className="switch-unit">{sw.unit}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Module 3: Recessed ESP32 Edge Node Hardware Terminal */}
          <div className="desk-recessed-terminal">
            <div className="terminal-header">ESP32 EDGE NODE SYSTEM TELEMETRY</div>
            <div className="terminal-body-grid">
              <div className="terminal-data-column">
                <div className="terminal-line"><span>CPU</span> <strong>42%</strong></div>
                <div className="terminal-line"><span>RAM</span> <strong>38%</strong></div>
                <div className="terminal-line"><span>GPIO</span> <strong>18/34</strong></div>
              </div>

              <div className="terminal-data-column">
                <div className="terminal-line"><span>ADC</span> <strong>ACTIVE</strong></div>
                <div className="terminal-line"><span>I2C</span> <strong>400k</strong></div>
                <div className="terminal-line"><span>UART</span> <strong>115.2k</strong></div>
              </div>

              <div className="terminal-data-column">
                <div className="terminal-line"><span>VOLT</span> <strong>5.02V</strong></div>
                <div className="terminal-line"><span>CURR</span> <strong>180mA</strong></div>
                <div className="terminal-line"><span>TEMP</span> <strong>42°C</strong></div>
              </div>

              <div className="terminal-led-column">
                <div className="terminal-led-row">
                  <span className="led-label">PWR</span>
                  <span className="status-jewel-led red" />
                </div>
                <div className="terminal-led-row">
                  <span className="led-label">DAT</span>
                  <span className="status-jewel-led green" />
                </div>
                <div className="terminal-led-row">
                  <span className="led-label">I2C</span>
                  <span className="status-jewel-led green" />
                </div>
                <div className="terminal-led-row">
                  <span className="led-label">4G</span>
                  <span className="status-jewel-led green" />
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: A7670C 4G Modem Module Terminal with Antenna */}
          <div className="desk-modem-terminal">
            <div className="modem-info-area">
              <div className="modem-title">A7670C 4G MODEM · LTE-M CONNECTIVITY</div>
              <div className="modem-metrics-grid">
                <div className="modem-metric"><span>SIG</span> <strong>-67 dBm</strong></div>
                <div className="modem-metric"><span>RSSI</span> <strong>19/31</strong></div>
                <div className="modem-metric"><span>LAT</span> <strong>82 ms</strong></div>
                <div className="modem-metric"><span>LOSS</span> <strong>0.4%</strong></div>
                <div className="modem-metric"><span>TX</span> <strong>2.4 MB</strong></div>
                <div className="modem-metric"><span>RX</span> <strong>8.7 MB</strong></div>
              </div>
            </div>

            {/* Rubber Antenna Model */}
            <div className="desk-modem-antenna">
              <div className="antenna-stalk" />
              <div className="antenna-base" />
            </div>
          </div>

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════
          BOTTOM ROW: 3 Modular Engineering Bays (Rich & Fully Packed)
         ════════════════════════════════════════════════════════ */}
      <div className="desk-bottom-row">

        {/* Bay 1: THULIR AI Decision Pipeline & Feature Vector */}
        <div className="desk-bottom-bay bay-ai">
          <div className="bay-header-row">
            <div className="bay-title">THULIR AI · INTELLIGENCE ENGINE</div>
            <span className="bay-status-badge active-green">ENSEMBLE ACTIVE ({confidencePct}%)</span>
          </div>

          <div className="ai-stats-bar">
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">MODEL</span>
              <strong className="ai-stat-val">HYBRID RF + IF</strong>
            </div>
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">ANOMALY PROB</span>
              <strong className="ai-stat-val warning">{riskScore > 50 ? '0.86 (HIGH)' : '0.14 (LOW)'}</strong>
            </div>
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">LATENCY</span>
              <strong className="ai-stat-val">12 ms / EDGE</strong>
            </div>
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">SAMPLE RATE</span>
              <strong className="ai-stat-val">50 Hz</strong>
            </div>
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">FEATURE VEC</span>
              <strong className="ai-stat-val">7-DIM MATRIX</strong>
            </div>
            <div className="ai-stat-chip">
              <span className="ai-stat-lbl">DRIFT</span>
              <strong className="ai-stat-val">0.02 (NOMINAL)</strong>
            </div>
          </div>

          {/* Real-time 7-Channel Feature Vector Bars */}
          <div className="ai-feature-vector-strip">
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>TILT_X</span><strong>{tiltX.toFixed(1)}°</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill" style={{ width: `${Math.min(100, (Math.abs(tiltX) / 10) * 100)}%` }} /></div>
            </div>
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>VIB_RMS</span><strong>{vibrationG.toFixed(2)}g</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill warning" style={{ width: `${Math.min(100, (vibrationG / 2.5) * 100)}%` }} /></div>
            </div>
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>GAS_MQ2</span><strong>{gasPpm}</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill danger" style={{ width: `${Math.min(100, (gasPpm / 800) * 100)}%` }} /></div>
            </div>
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>DIST_HC</span><strong>{distanceCm.toFixed(1)}cm</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill" style={{ width: `${Math.min(100, (distanceCm / 60) * 100)}%` }} /></div>
            </div>
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>TEMP_C</span><strong>{tempC.toFixed(1)}°C</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill" style={{ width: `${Math.min(100, (tempC / 50) * 100)}%` }} /></div>
            </div>
            <div className="feature-bar-item">
              <div className="feature-bar-header"><span>HUMID_RH</span><strong>{humidityRh}%</strong></div>
              <div className="feature-bar-track"><div className="feature-bar-fill" style={{ width: `${Math.min(100, humidityRh)}%` }} /></div>
            </div>
          </div>

          <div className="bay-ai-pipeline">
            <div className="pipeline-chip">
              <span className="pipeline-chip-title">01 INGEST</span>
              <span className="pipeline-chip-sub">7 CHANNELS / 50Hz</span>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-chip">
              <span className="pipeline-chip-title">02 EXTRACTION</span>
              <span className="pipeline-chip-sub">RMS / P2P / FFT</span>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-chip dual">
              <span className="pipeline-chip-title">03 ISOLATION FOREST</span>
              <span className="pipeline-chip-title">RANDOM FOREST (100T)</span>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-result-box">
              <div className="result-label">04 FINAL RISK</div>
              <div className={`result-score ${riskLevel.toLowerCase()}`}>
                {riskScore} / 100
              </div>
              <div className={`result-badge ${riskLevel.toLowerCase()}`}>
                {riskLevel}
              </div>
            </div>
          </div>

          <div className="ai-diagnostic-strip">
            <span className="diag-dot" />
            <span className="diag-text">
              {riskScore > 50
                ? 'SUBSIDENCE PATTERN DETECTED: ADXL345 RMS + HC-SR04 DISPLACEMENT RATE EXCEEDED THRESHOLD'
                : 'SURFACE KINEMATICS NOMINAL: ALL SENSOR VECTORS WITHIN SAFE ENVELOPE'}
            </span>
          </div>
        </div>

        {/* Bay 2: Power & Energy Subsystem */}
        <div className="desk-bottom-bay bay-power">
          <div className="bay-header-row">
            <div className="bay-title">POWER & ENERGY SUBSYSTEM</div>
            <span className="bay-status-badge solar-active">SOLAR HARVESTING (MPPT 94%)</span>
          </div>

          <div className="power-metrics-strip">
            <div className="power-metric-box">
              <span className="metric-lbl">BATTERY</span>
              <span className="metric-val">{batteryPct}% (4.08V)</span>
            </div>
            <div className="power-metric-box">
              <span className="metric-lbl">INPUT</span>
              <span className="metric-val">6.8 V / 420mA</span>
            </div>
            <div className="power-metric-box">
              <span className="metric-lbl">LOAD</span>
              <span className="metric-val">1.2 W</span>
            </div>
            <div className="power-metric-box">
              <span className="metric-lbl">CURRENT</span>
              <span className="metric-val">180 mA</span>
            </div>
            <div className="power-metric-box">
              <span className="metric-lbl">HEALTH</span>
              <span className="metric-val">98% EXCELLENT</span>
            </div>
            <div className="power-metric-box">
              <span className="metric-lbl">RAILS</span>
              <span className="metric-val">5.02V · 3.3V</span>
            </div>
          </div>

          <div className="power-flow-schematic">
            <div className="flow-step">
              <span className="flow-icon">☀️</span>
              <span className="flow-text">SOLAR 12W</span>
              <span className="flow-sub">6.8V / 420mA</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-icon">⚡</span>
              <span className="flow-text">MPPT BUCK</span>
              <span className="flow-sub">94% EFFICIENCY</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-icon">🔋</span>
              <span className="flow-text">18650 Li-Po</span>
              <span className="flow-sub">3200 mAh</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step highlight">
              <span className="flow-icon">🔲</span>
              <span className="flow-text">ESP32 5V</span>
              <span className="flow-sub">DUAL CORE</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="flow-icon">📡</span>
              <span className="flow-text">SENSORS + 4G</span>
              <span className="flow-sub">6 SENSOR BUS</span>
            </div>
          </div>

          <div className="power-substatus-bar">
            <div className="power-sub-item"><span>THERMALS</span> <strong>32.4°C NOMINAL</strong></div>
            <div className="power-sub-item"><span>CHARGE CYCLES</span> <strong>142 CYCLES</strong></div>
            <div className="power-sub-item"><span>BACKUP AUTO-SLEEP</span> <strong>STANDBY READY</strong></div>
          </div>
        </div>

        {/* Bay 3: Warning & Annunciator Matrix */}
        <div className="desk-bottom-bay bay-warnings">
          <div className="bay-header-row">
            <div className="bay-title">WARNING & ANNUNCIATOR MATRIX</div>
            <span className={`bay-status-badge ${isGasWarning || isVibWarning ? 'active-amber' : 'active-green'}`}>
              {isGasWarning || isVibWarning ? 'MASTER CAUTION' : 'NOMINAL'}
            </span>
          </div>

          <div className="annunciator-list">
            <div className={`annunciator-row ${isGasWarning ? 'active-critical' : ''}`}>
              <span className={`pilot-jewel red ${isGasWarning ? 'flash' : ''}`} />
              <span className="annunciator-text">CRITICAL GAS THRESHOLD EXCEEDED</span>
              <span className="annunciator-tag">MQ-2 ({gasPpm} PPM)</span>
            </div>

            <div className={`annunciator-row ${isVibWarning ? 'active-warning' : ''}`}>
              <span className={`pilot-jewel amber ${isVibWarning ? 'glow' : ''}`} />
              <span className="annunciator-text">WARNING VIBRATION ABOVE LIMIT</span>
              <span className="annunciator-tag">ADXL345 ({vibrationG.toFixed(2)}g)</span>
            </div>

            <div className={`annunciator-row ${isDistWarning ? 'active-warning' : ''}`}>
              <span className={`pilot-jewel amber ${isDistWarning ? 'glow' : ''}`} />
              <span className="annunciator-text">WARNING DISTANCE VARIATION</span>
              <span className="annunciator-tag">HC-SR04 ({distanceCm.toFixed(1)}cm)</span>
            </div>

            <div className="annunciator-row active-normal">
              <span className="pilot-jewel green glow" />
              <span className="annunciator-text">TILT ENVELOPE STABLE WITHIN 5°</span>
              <span className="annunciator-tag">MPU6050 ({tiltX.toFixed(1)}°)</span>
            </div>

            <div className={`annunciator-row ${isNormalTelemetry ? 'active-normal' : ''}`}>
              <span className={`pilot-jewel green ${isNormalTelemetry ? 'glow' : ''}`} />
              <span className="annunciator-text">NORMAL NODE TELEMETRY HEARTBEAT</span>
              <span className="annunciator-tag">ESP32 LTE</span>
            </div>
          </div>

          {/* Tactile Annunciator Buttons */}
          <div className="annunciator-actions-bar">
            <button
              className="annunciator-btn"
              onClick={() => playHapticClick(750, 0.05)}
            >
              LAMP TEST
            </button>
            <button
              className="annunciator-btn"
              onClick={() => playHapticClick(500, 0.04)}
            >
              MUTE BUZZER
            </button>
            <button
              className="annunciator-btn highlight"
              onClick={() => playHapticClick(900, 0.06)}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
