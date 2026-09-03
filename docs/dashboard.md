# Dashboard UI/UX Specification

## Design System

- **Visual Theme**: Dark engineering workstation UI (`#0a0e17` canvas).
- **Typography**: Inter for UI controls and labels; JetBrains Mono for telemetry metrics, timestamps, and node IDs.
- **Information Hierarchy**:
  1. Top Bar: Branding, Node Identifier, System Status, Data Source badge, Connection status, Last Updated, and Demo Mode toggle.
  2. System Overview: Risk Assessment panel alongside Node Health & Sensor Health status grid.
  3. Sensor Grid: 8 high-density sensor metric cards.
  4. Historical Trends: Multi-series Recharts with `1H`, `6H`, `24H`, and `7D` range selectors.
  5. Alerts: Live active alert stream with severity tags and acknowledgment actions.
  6. ML Analysis: Classification state, confidence rating, and inference latency.
  7. Network Topology: Hierarchical node connectivity diagram.

---

## Responsive Breakpoints

- **Desktop (>1200px)**: Multi-column wide engineering layout.
- **Tablet (768px - 1200px)**: 2-column sensor grid with stacked system overview.
- **Mobile (<768px)**: Single-column scrollable stream with full chart responsiveness.
