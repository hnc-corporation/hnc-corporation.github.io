// src/data/sensorData.js
// 원본 Android 소스의 OutputActivity.java 센서 시뮬레이션 로직을 PWA용으로 이식

/**
 * 작물별 최적 환경 임계값 (Android GrowthStatusFragment.cropThresholds 기반)
 * min/max = 경보 발생 기준, optimal = 이상값
 */
export const CROP_THRESHOLDS = {
  딸기: {
    temp:  { min: 15, max: 25, optimal: 20, unit: '°C', label: '대기 온도' },
    humid: { min: 60, max: 85, optimal: 75, unit: '%',  label: '대기 습도' },
    soil:  { min: 15, max: 22, optimal: 18, unit: '°C', label: '토양 온도' },
    co2:   { min: 400, max: 1200, optimal: 800, unit: 'ppm', label: 'CO2 농도' },
    light: { min: 10000, max: 50000, optimal: 30000, unit: 'lux', label: '조도' },
    growth: { sprout: 14, flower: 65, harvest: 85 }
  },
  토마토: {
    temp:  { min: 18, max: 28, optimal: 23, unit: '°C', label: '대기 온도' },
    humid: { min: 55, max: 80, optimal: 70, unit: '%',  label: '대기 습도' },
    soil:  { min: 18, max: 25, optimal: 21, unit: '°C', label: '토양 온도' },
    co2:   { min: 400, max: 1500, optimal: 1000, unit: 'ppm', label: 'CO2 농도' },
    light: { min: 15000, max: 60000, optimal: 40000, unit: 'lux', label: '조도' },
    growth: { sprout: 7, flower: 60, harvest: 90 }
  },
  고추: {
    temp:  { min: 20, max: 30, optimal: 25, unit: '°C', label: '대기 온도' },
    humid: { min: 60, max: 80, optimal: 70, unit: '%',  label: '대기 습도' },
    soil:  { min: 20, max: 28, optimal: 24, unit: '°C', label: '토양 온도' },
    co2:   { min: 400, max: 1200, optimal: 900, unit: 'ppm', label: 'CO2 농도' },
    light: { min: 20000, max: 70000, optimal: 45000, unit: 'lux', label: '조도' },
    growth: { sprout: 10, flower: 75, harvest: 105 }
  },
  파프리카: {
    temp:  { min: 18, max: 28, optimal: 23, unit: '°C', label: '대기 온도' },
    humid: { min: 60, max: 80, optimal: 70, unit: '%',  label: '대기 습도' },
    soil:  { min: 18, max: 25, optimal: 21, unit: '°C', label: '토양 온도' },
    co2:   { min: 400, max: 1200, optimal: 900, unit: 'ppm', label: 'CO2 농도' },
    light: { min: 15000, max: 65000, optimal: 40000, unit: 'lux', label: '조도' },
    growth: { sprout: 10, flower: 65, harvest: 90 }
  }
}

export const CROP_LIST = Object.keys(CROP_THRESHOLDS)

/**
 * 초기 센서값 생성 (작물별 optimal 기준 ±5% 랜덤)
 */
export function generateInitialSensorValues(crop = '딸기') {
  const t = CROP_THRESHOLDS[crop]
  const jitter = (opt, range = 0.08) =>
    parseFloat((opt * (1 + (Math.random() - 0.5) * range)).toFixed(1))

  return {
    temp:  jitter(t.temp.optimal),
    humid: jitter(t.humid.optimal),
    soil:  jitter(t.soil.optimal),
    co2:   Math.round(jitter(t.co2.optimal, 0.12)),
    light: Math.round(jitter(t.light.optimal, 0.15)),
  }
}

/**
 * 매 tick 센서값 시뮬레이션 (Android OutputActivity updateRunnable 이식)
 * 이전 값에서 ±소폭 변화 + 임계값 경계에서 자연스러운 반전
 */
export function simulateSensorTick(prev, crop = '딸기') {
  const t = CROP_THRESHOLDS[crop]

  const drift = (val, min, max, step) => {
    const noise = (Math.random() - 0.5) * 2 * step
    const next = val + noise
    // 경계 반전
    if (next > max * 1.05) return val - Math.abs(noise)
    if (next < min * 0.95) return val + Math.abs(noise)
    return next
  }

  return {
    temp:  parseFloat(drift(prev.temp,  t.temp.min,  t.temp.max,  0.3).toFixed(1)),
    humid: parseFloat(drift(prev.humid, t.humid.min, t.humid.max, 1.2).toFixed(1)),
    soil:  parseFloat(drift(prev.soil,  t.soil.min,  t.soil.max,  0.2).toFixed(1)),
    co2:   Math.round(drift(prev.co2,   t.co2.min,   t.co2.max,  15)),
    light: Math.round(drift(prev.light, t.light.min, t.light.max, 800)),
  }
}

/**
 * 현재 센서값을 임계값과 비교하여 경보 목록 반환
 * (Android AlertLogFragment.checkFarmEnvironmentAlerts 이식)
 */
export function checkAlerts(sensors, crop = '딸기', thresholds = null) {
  const t = thresholds || CROP_THRESHOLDS[crop]
  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  const alerts = []

  const check = (key, label, unit) => {
    const val = sensors[key]
    const { min, max } = t[key]
    if (val > max) alerts.push({ id: `${key}_high`, type: 'danger', sensor: key, label, value: val, unit, time: now, msg: `${label} ${val}${unit} — 상한값(${max}${unit}) 초과` })
    else if (val < min) alerts.push({ id: `${key}_low`, type: 'warning', sensor: key, label, value: val, unit, time: now, msg: `${label} ${val}${unit} — 하한값(${min}${unit}) 미달` })
  }

  check('temp',  '대기 온도', '°C')
  check('humid', '대기 습도', '%')
  check('soil',  '토양 온도', '°C')
  check('co2',   'CO2 농도',  'ppm')
  check('light', '조도',      'lux')

  return alerts
}

/**
 * 기기 자동 제어 로직 (Android ControlSettingsFragment 자동모드 이식)
 * 임계값 초과 시 대응 기기 자동 ON
 */
export function autoControlDevices(sensors, crop = '딸기') {
  const t = CROP_THRESHOLDS[crop]
  return {
    cooling:  sensors.temp  > t.temp.max,
    heating:  sensors.temp  < t.temp.min,
    fan:      sensors.humid > t.humid.max,
    water:    sensors.humid < t.humid.min,
    co2vent:  sensors.co2   > t.co2.max,
    co2gen:   sensors.co2   < t.co2.min,
    soilheat: sensors.soil  < t.soil.min,
    soilcool: sensors.soil  > t.soil.max,
  }
}

/**
 * 시간대별 차트 데이터 생성 (최근 20포인트)
 */
export function generateChartHistory(currentSensors, crop = '딸기', points = 20) {
  const history = []
  let s = { ...currentSensors }
  for (let i = points; i >= 0; i--) {
    history.unshift({
      time: new Date(Date.now() - i * 2000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...s
    })
    s = simulateSensorTick(s, crop)
  }
  return history
}

/**
 * 성장 단계 계산 (Android GrowthStatusFragment 이식)
 */
export function getGrowthStage(crop = '딸기', day = 25) {
  const t = CROP_THRESHOLDS[crop]?.growth || { sprout: 7, flower: 60, harvest: 85 }
  if (day < t.sprout) return { stage: 0, label: '파종기', color: '#8D6E63', nextLabel: '발아기', nextDays: t.sprout - day }
  if (day < t.flower) return { stage: 1, label: '발아·생장기', color: '#4CAF50', nextLabel: '개화기', nextDays: t.flower - day }
  if (day < t.harvest) return { stage: 2, label: '개화기', color: '#E91E63', nextLabel: '수확기', nextDays: t.harvest - day }
  return { stage: 3, label: '수확기', color: '#F57C00', nextLabel: '완료', nextDays: 0 }
}

// 기기 목록 정의
export const DEVICES = [
  { id: 'cooling',  label: '냉방',    icon: '❄️', group: '대기 온도' },
  { id: 'heating',  label: '히터',    icon: '🔥', group: '대기 온도' },
  { id: 'fan',      label: '환풍기',  icon: '💨', group: '대기 습도' },
  { id: 'water',    label: '관수',    icon: '💧', group: '대기 습도' },
  { id: 'co2vent',  label: 'CO2 환기', icon: '🌬️', group: 'CO2' },
  { id: 'co2gen',   label: 'CO2 발생', icon: '⚗️', group: 'CO2' },
  { id: 'soilheat', label: '지온 히터', icon: '🌡️', group: '토양 온도' },
  { id: 'soilcool', label: '지온 쿨러', icon: '🧊', group: '토양 온도' },
]
