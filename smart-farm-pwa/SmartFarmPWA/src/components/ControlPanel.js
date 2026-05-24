import "./ControlPanel.css";

const DEVICES = [
  { key:"fan",    label:"환풍기",      labelEn:"FAN",    onLabel:"팬 켜",     offLabel:"팬 꺼"    },
  { key:"water",  label:"관수 시스템", labelEn:"WATER",  onLabel:"물 줘",     offLabel:"물 꺼"    },
  { key:"led",    label:"LED 조명",    labelEn:"LED",    onLabel:"조명 켜",   offLabel:"조명 꺼"  },
  { key:"heater", label:"히터",        labelEn:"HEATER", onLabel:"히터 켜",   offLabel:"히터 꺼"  },
  { key:"window", label:"창문 개폐",   labelEn:"WINDOW", onLabel:"창문 열어", offLabel:"창문 닫아"},
];

function DeviceRow({ device, state, onControl }) {
  return (
    <div className="device-row">
      <div className="device-info">
        <span className="device-name">{device.label}</span>
        <span className="device-name-en">{device.labelEn}</span>
      </div>
      <div className={`device-state ${state ? "state-on" : "state-off"}`}>
        {state ? "ON" : "OFF"}
      </div>
      <div className="device-btns">
        <button className={`ctrl-btn ctrl-on ${state ? "active" : ""}`}
          onClick={() => onControl(device.key, true)}>{device.onLabel}</button>
        <button className={`ctrl-btn ctrl-off ${!state ? "active" : ""}`}
          onClick={() => onControl(device.key, false)}>{device.offLabel}</button>
      </div>
    </div>
  );
}

export default function ControlPanel({ iot, zone, onControl, onBack, log }) {
  return (
    <div className="control-panel fade-in">
      <div className="ctrl-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <span className="ctrl-title">IoT 제어 패널</span>
        <span className="ctrl-zone">구역 {zone}</span>
      </div>
      <div className="ctrl-body">
        <div className="ctrl-section-label">기기 제어</div>
        <div className="device-list">
          {DEVICES.map(d => (
            <DeviceRow key={d.key} device={d} state={iot[d.key]} onControl={onControl} />
          ))}
        </div>
        <button className="all-off-btn"
          onClick={() => DEVICES.forEach(d => onControl(d.key, false))}>
          ⚠️ 전체 OFF
        </button>
        <div className="ctrl-log">
          <div className="section-label">LOG</div>
          <div className="log-text">{log}</div>
        </div>
      </div>
    </div>
  );
}
