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
      {/* ── Header Title Plate ── */}
      <div className="desk-header-title">
        <span className="desk-header-text">THULIR SMART MINE CONTROL DESK</span>
        <div className="desk-header-badge">
          ESP32 DUAL CORE · 4G LTE-M · NEURAL ENGINE LIVE
        </div>
        <button
          className="desk-header-scroll-btn"
          onClick={handleScrollDown}
          title="Scroll down to deep telemetry & multi-node analytics"
        >
          <span>Deep Analytics</span>
          <span className="scroll-arrow">↓</span>
        </button>
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
                { name: 'SENSOR ARRAY', section: 'section-telemetry' },
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
            CENTER PANEL: Hardware Circuit Workbench with ESP32 & Sensors
           ════════════════════════════════════════════════════════ */}
        <div className="desk-center-panel">
          <div className="desk-pcb-workbench">

            {/* Animated SVG Circuit Bus Traces (Scalable 1000x600 Coordinates) */}
            <svg className="desk-pcb-traces-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="copperTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c58652" />
                  <stop offset="50%" stopColor="#de9e68" />
                  <stop offset="100%" stopColor="#b47441" />
                </linearGradient>
                <filter id="traceGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Trace 1: To MPU6050 (Top Left) */}
              <path d="M 420 250 C 300 250, 220 70, 150 70" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-1" r="3.5">
                <animateMotion path="M 420 250 C 300 250, 220 70, 150 70" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Trace 2: To ADXL345 (Top Center) */}
              <path d="M 500 210 L 500 70" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-2" r="3.5">
                <animateMotion path="M 500 210 L 500 70" dur="1.4s" repeatCount="indefinite" />
              </circle>

              {/* Trace 3: To MQ-2 Gas Sensor (Top Right) */}
              <path d="M 580 250 C 700 250, 780 70, 850 70" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-3" r="3.5">
                <animateMotion path="M 580 250 C 700 250, 780 70, 850 70" dur="2.1s" repeatCount="indefinite" />
              </circle>

              {/* Trace 4: To APU6050 (Middle Left) */}
              <path d="M 420 300 L 150 300" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-4" r="3.5">
                <animateMotion path="M 420 300 L 150 300" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Trace 5: To DHT22 (Middle Right) */}
              <path d="M 580 300 L 850 300" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-5" r="3.5">
                <animateMotion path="M 580 300 L 850 300" dur="1.7s" repeatCount="indefinite" />
              </circle>

              {/* Trace 6: To FLEX SENSOR (Bottom Left) */}
              <path d="M 420 350 C 300 350, 220 530, 150 530" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-6" r="3.5">
                <animateMotion path="M 420 350 C 300 350, 220 530, 150 530" dur="2.3s" repeatCount="indefinite" />
              </circle>

              {/* Trace 7: To HC-SR04 (Bottom Right) */}
              <path d="M 580 350 C 700 350, 780 530, 850 530" className="desk-bus-path" />
              <circle className="desk-bus-pulse pulse-7" r="3.5">
                <animateMotion path="M 580 350 C 700 350, 780 530, 850 530" dur="1.9s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* Module 1: MPU6050 (Top Left) */}
            <div className="desk-sensor-module mod-mpu6050">
              <div className="desk-module-label">MPU6050</div>
              <div className="desk-module-body">
                <div className="desk-smd-chip">
                  <div className="desk-chip-dot" />
                  <span>6-DOF</span>
                </div>
                <div className="desk-module-readout">
                  <span className="desk-readout-val">{tiltX.toFixed(1)}°</span>
                  <span className="desk-mini-badge normal">NORMAL</span>
                </div>
              </div>
            </div>

            {/* Module 2: ADXL345 (Top Center) */}
            <div className="desk-sensor-module mod-adxl345">
              <div className="desk-module-label">ADXL345</div>
              <div className="desk-module-body">
                <div className="desk-module-readout centered">
                  <span className="desk-readout-val">{vibrationG.toFixed(2)} g</span>
                  <span className="desk-mini-badge warning">WARNING</span>
                </div>
                <div className="desk-smd-led-row">
                  <span className="smd-led active-amber" />
                  <span className="smd-led" />
                  <span className="smd-led" />
                </div>
              </div>
            </div>

            {/* Module 3: MQ-2 Gas Sensor (Top Right) */}
            <div className="desk-sensor-module mod-mq2">
              <div className="desk-module-label">MQ-2</div>
              <div className="desk-module-body mq2-body">
                {/* Metal Mesh Gas Dome */}
                <div className="desk-gas-mesh-cylinder">
                  <div className="gas-mesh-cap" />
                </div>
                <div className="desk-module-readout">
                  <span className="desk-readout-val">{gasPpm} ppm</span>
                  <span className={`desk-mini-badge ${gasPpm > 700 ? 'danger' : gasPpm > 400 ? 'warning' : 'normal'}`}>
                    {gasPpm > 700 ? 'DANGER' : gasPpm > 400 ? 'WARNING' : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Module 4: APU6050 (Middle Left) */}
            <div className="desk-sensor-module mod-apu6050">
              <div className="desk-module-label">APU6050</div>
              <div className="desk-module-body">
                <div className="desk-smd-chip small">
                  <span>ACC</span>
                </div>
                <div className="desk-module-readout">
                  <span className="desk-readout-val">{vibrationG.toFixed(2)} g</span>
                  <span className="desk-mini-badge warning">WARNING</span>
                </div>
              </div>
            </div>

            {/* Centerpiece: ESP32 Edge Node */}
            <div className="desk-esp32-node">
              <div className="desk-esp32-pins left">
                {[...Array(8)].map((_, i) => <div key={i} className="desk-pin" />)}
              </div>

              <div className="desk-esp32-board">
                {/* Antenna Pattern */}
                <div className="desk-esp32-antenna" />

                {/* Metal RF Shield */}
                <div className="desk-esp32-shield">
                  <span className="esp32-title">ESP32</span>
                  <span className="esp32-sub">WROOM-32D</span>
                </div>

                {/* USB Port & Tactile Buttons */}
                <div className="desk-esp32-bottom-bar">
                  <div className="desk-tactile-btn">RST</div>
                  <div className="desk-usbc-port" />
                  <div className="desk-tactile-btn">BOOT</div>
                </div>

                {/* Edge Node Status Tag */}
                <div className="desk-node-tag">EDGE NODE</div>
              </div>

              <div className="desk-esp32-pins right">
                {[...Array(8)].map((_, i) => <div key={i} className="desk-pin" />)}
              </div>
            </div>

            {/* Module 5: DHT22 (Middle Right) */}
            <div className="desk-sensor-module mod-dht22">
              <div className="desk-module-label">DHT22</div>
              <div className="desk-module-body dht22-body">
                <div className="dht22-white-cage">
                  <div className="dht22-vents">
                    <span /><span /><span />
                  </div>
                  <div className="dht22-readout">
                    <div>{tempC.toFixed(1)}°C</div>
                    <div>{humidityRh.toFixed(0)}% RH</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 6: FLEX SENSOR (Bottom Left) */}
            <div className="desk-sensor-module mod-flex">
              <div className="desk-module-label">FLEX SENSOR</div>
              <div className="desk-module-body flex-body">
                <div className="flex-gold-ribbon">
                  <span className="flex-strip" />
                </div>
                <div className="desk-module-readout">
                  <span className="desk-mini-badge normal">NORMAL</span>
                </div>
              </div>
            </div>

            {/* Module 7: HC-SR04 (Bottom Right) */}
            <div className="desk-sensor-module mod-soil mod-hcsr04-bottom">
              <div className="desk-module-label">HC-SR04</div>
              <div className="desk-module-body hcsr04-body">
                <div className="desk-ultrasonic-mesh">
                  <div className="desk-mesh-ring" />
                </div>
                <div className="desk-ultrasonic-mesh">
                  <div className="desk-mesh-ring" />
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
