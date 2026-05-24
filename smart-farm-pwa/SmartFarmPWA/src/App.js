import { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import GraphScreen from "./components/GraphScreen";
import ControlPanel from "./components/ControlPanel";
import {
  initialSensorData, initialIotStatus,
  simulateSensorChange, generateHistory,
} from "./data/mockData";
import "./App.css";

const SCREENS = { DASHBOARD: "dashboard", GRAPH: "graph", CONTROL: "control" };

export default function App() {
  const [screen, setScreen]         = useState(SCREENS.DASHBOARD);
  const [zone, setZone]             = useState(1);
  const [sensors, setSensors]       = useState(initialSensorData);
  const [iotStatus, setIotStatus]   = useState(initialIotStatus);
  const [history, setHistory]       = useState(generateHistory(1));
  const [log, setLog]               = useState("스마트 팜 앱이 시작되었습니다.");
  const [refreshing, setRefreshing] = useState(false);

  // 5초마다 센서 자동 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors(prev => ({
        ...prev,
        [zone]: simulateSensorChange(prev[zone]),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, [zone]);

  // 구역 변경 시 히스토리 갱신
  useEffect(() => {
    setHistory(generateHistory(zone));
    setLog(`구역 ${zone} 데이터를 불러왔습니다.`);
  }, [zone]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSensors(prev => ({ ...prev, [zone]: simulateSensorChange(prev[zone]) }));
    setHistory(generateHistory(zone));
    setLog("데이터를 갱신했습니다.");
    setTimeout(() => setRefreshing(false), 800);
  }, [zone]);

  const handleIotControl = useCallback((device, state) => {
    setIotStatus(prev => ({
      ...prev,
      [zone]: { ...prev[zone], [device]: state },
    }));
    const names = { fan:"환풍기", led:"LED 조명", water:"관수 시스템", heater:"히터", window:"창문" };
    setLog(`${names[device]} ${state ? "ON" : "OFF"} 완료`);
  }, [zone]);

  const handleZoneChange = useCallback((delta) => {
    setZone(prev => Math.max(1, Math.min(5, prev + delta)));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="header-icon">🌾</span>
          <span>SMART FARM</span>
        </div>
        <div className="zone-badge">구역 {zone}</div>
      </header>

      <main className="app-main">
        {screen === SCREENS.DASHBOARD && (
          <Dashboard
            sensor={sensors[zone]} iot={iotStatus[zone]}
            log={log} refreshing={refreshing} zone={zone}
            onRefresh={handleRefresh}
            onZoneChange={handleZoneChange}
            onGoGraph={() => setScreen(SCREENS.GRAPH)}
            onGoControl={() => setScreen(SCREENS.CONTROL)}
          />
        )}
        {screen === SCREENS.GRAPH && (
          <GraphScreen history={history} zone={zone}
            onBack={() => setScreen(SCREENS.DASHBOARD)} />
        )}
        {screen === SCREENS.CONTROL && (
          <ControlPanel iot={iotStatus[zone]} zone={zone} log={log}
            onControl={handleIotControl}
            onBack={() => setScreen(SCREENS.DASHBOARD)} />
        )}
      </main>

      <nav className="bottom-nav">
        {[
          { id: SCREENS.DASHBOARD, icon: "🏠", label: "홈"    },
          { id: SCREENS.GRAPH,     icon: "📈", label: "그래프" },
          { id: SCREENS.CONTROL,   icon: "🎛️", label: "제어"  },
        ].map(n => (
          <button key={n.id}
            className={`nav-btn ${screen === n.id ? "active" : ""}`}
            onClick={() => setScreen(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
