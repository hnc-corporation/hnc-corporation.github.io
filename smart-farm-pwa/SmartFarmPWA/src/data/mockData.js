// ============================================================
// mockData.js - 가짜 센서 데이터
// 나중에 실제 API로 교체하면 됩니다
// ============================================================

export const initialSensorData = {
  1: { temperature: 24.5, humidity: 68.0, light: 3200, co2: 412 },
  2: { temperature: 22.1, humidity: 72.3, light: 4200, co2: 380 },
  3: { temperature: 26.2, humidity: 65.0, light: 5000, co2: 450 },
  4: { temperature: 23.8, humidity: 69.5, light: 3800, co2: 425 },
  5: { temperature: 21.5, humidity: 74.0, light: 2800, co2: 395 },
};

export const initialIotStatus = {
  1: { fan: true,  led: true,  water: false, heater: false, window: false },
  2: { fan: true,  led: false, water: false, heater: false, window: false },
  3: { fan: false, led: true,  water: true,  heater: false, window: false },
  4: { fan: true,  led: true,  water: false, heater: false, window: true  },
  5: { fan: false, led: false, water: false, heater: true,  window: false },
};

export const sensorRanges = {
  temperature: { min: 18,   max: 28,   unit: '°C',  label: '온도' },
  humidity:    { min: 60,   max: 80,   unit: '%',   label: '습도' },
  light:       { min: 3000, max: 8000, unit: 'lux', label: '조도' },
  co2:         { min: 300,  max: 600,  unit: 'ppm', label: 'CO₂' },
};

export const simulateSensorChange = (current) => ({
  temperature: Math.max(10, Math.min(40,
    current.temperature + (Math.random() - 0.5) * 2)),
  humidity: Math.max(20, Math.min(100,
    current.humidity + (Math.random() - 0.5) * 5)),
  light: Math.max(0, Math.min(10000,
    current.light + Math.floor((Math.random() - 0.5) * 500))),
  co2: Math.max(300, Math.min(1000,
    current.co2 + Math.floor((Math.random() - 0.5) * 50))),
});

export const generateHistory = (zone) => {
  const base = initialSensorData[zone];
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i + 1}회`,
    temperature: +(base.temperature + (Math.random() - 0.5) * 4).toFixed(1),
    humidity:    +(base.humidity    + (Math.random() - 0.5) * 8).toFixed(1),
    light:       Math.floor(base.light + (Math.random() - 0.5) * 1000),
    co2:         Math.floor(base.co2   + (Math.random() - 0.5) * 80),
  }));
};
