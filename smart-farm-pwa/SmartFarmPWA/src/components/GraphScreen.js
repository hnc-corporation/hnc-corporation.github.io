import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "./GraphScreen.css";

const CHARTS = [
  { key: "temperature", label: "온도 변화 (Temp)",     color: "#4caf50", unit: "°C"  },
  { key: "humidity",    label: "습도 변화 (Humidity)", color: "#2196f3", unit: "%"   },
  { key: "light",       label: "조도 변화 (Light)",    color: "#ffc107", unit: "lux" },
  { key: "co2",         label: "CO₂ 농도 변화",        color: "#e91e63", unit: "ppm" },
];

const average = (data, key) =>
  (data.reduce((s, d) => s + d[key], 0) / data.length).toFixed(1);

function SensorChart({ config, data }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title" style={{ color: config.color }}>{config.label}</span>
        <span className="chart-avg" style={{ color: config.color }}>
          평균: {average(data, config.key)} {config.unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 10 }} />
          <YAxis tick={{ fill: "#555", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
            labelStyle={{ color: "#aaa" }}
            itemStyle={{ color: config.color }}
          />
          <Line type="monotone" dataKey={config.key}
            stroke={config.color} strokeWidth={2}
            dot={{ fill: config.color, r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GraphScreen({ history, zone, onBack }) {
  return (
    <div className="graph-screen fade-in">
      <div className="graph-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <span className="graph-title">센서 데이터 그래프</span>
        <span className="graph-zone">구역 {zone}</span>
      </div>
      <div className="chart-list">
        {CHARTS.map(c => <SensorChart key={c.key} config={c} data={history} />)}
      </div>
    </div>
  );
}
