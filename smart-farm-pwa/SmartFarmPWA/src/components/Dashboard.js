import { sensorRanges } from "../data/mockData";
import "./Dashboard.css";

const CARD_STYLES = {
  temperature: { bg: "#0a1f0a", accent: "#4caf50", label: "TEMP"  },
  humidity:    { bg: "#0a1520", accent: "#2196f3", label: "HUMID" },
  light:       { bg: "#1a1500", accent: "#ffc107", label: "LIGHT" },
  co2:         { bg: "#1a0a10", accent: "#e91e63", label: "CO2"   },
};

const formatValue = (key, val) => {
  if (key === "temperature") return `${val.toFixed(1)}°C`;
  if (key === "humidity")    return `${Math.round(val)}%`;
  if (key === "light")       return `${val.toLocaleString()} lux`;
  if (key === "co2")         return `${val} ppm`;
  return val;
};

function SensorCard({ sensorKey, value }) {
  const range = sensorRanges[sensorKey];
  const style = CARD_STYLES[sensorKey];
  const isOk  = value >= range.min && value <= range.max;
  return (
    <div className="sensor-card" style={{ background: style.bg }}>
      <div className="sensor-label" style={{ color: style.accent }}>{style.label}</div>
      <div className="sensor-value">{formatValue(sensorKey, value)}</div>
      <div className={`sensor-status ${isOk ? "status-ok" : "status-warn"}`}>
        {isOk ? `OK  ${range.min}~${range.max}` : `!!  ${range.min}~${range.max}`}
      </div>
    </div>
  );
}

function IotRow({ iot }) {
  const devices = [
    { key:"fan", label:"FAN" }, { key:"led", label:"LED" },
    { key:"water", label:"WATER" }, { key:"heater", label:"HEATER" },
    { key:"window", label:"WINDOW" },
  ];
  return (
    <div className="iot-grid">
      {devices.map(d => (
        <div key={d.key} className={`iot-item ${iot[d.key] ? "iot-on" : "iot-off"}`}>
          <span className="iot-name">{d.label}</span>
          <span className="iot-state">{iot[d.key] ? " ON" : " OFF"}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({
  sensor, iot, log, refreshing,
  onRefresh, onZoneChange, onGoGraph, onGoControl, zone
}) {
  return (
    <div className="dashboard fade-in">
      {/* 구역 선택 */}
      <div className="zone-row">
        <button className="zone-btn" onClick={() => onZoneChange(-1)}>◀ 이전</button>
        <div className="zone-info">
          <div className="zone-num">구역 {zone}</div>
          <div className="zone-sub">ZONE {zone} / 5</div>
        </div>
        <button className="zone-btn" onClick={() => onZoneChange(+1)}>다음 ▶</button>
      </div>

      {/* 센서 카드 */}
      <div className={`sensor-grid ${refreshing ? "refreshing" : ""}`}>
        {Object.keys(sensorRanges).map(key => (
          <SensorCard key={key} sensorKey={key} value={sensor[key]} />
        ))}
      </div>

      {/* IoT 상태 */}
      <div className="card" style={{ marginBottom: 10 }}>
        <div className="section-label">IOT STATUS</div>
        <IotRow iot={iot} />
      </div>

      {/* 로그 */}
      <div className="card log-card" style={{ marginBottom: 12 }}>
        <div className="section-label">LOG</div>
        <div className="log-text">{log}</div>
      </div>

      {/* 버튼 */}
      <div className="btn-row">
        <button className="btn btn-blue" onClick={onRefresh}>🔄 데이터 갱신</button>
        <button className="btn btn-green" onClick={onGoControl}>🎛️ IoT 제어</button>
      </div>
      <button className="btn btn-purple" onClick={onGoGraph} style={{ marginBottom: 20 }}>
        📈 그래프 보기
      </button>
    </div>
  );
}
