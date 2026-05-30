// src/hooks/useFarmStore.jsx
// Android OutputActivity의 전역 상태를 React Context + useReducer로 이식
// Capacitor 확장 시 이 훅만 수정하면 모든 화면에 반영됨

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import {
  CROP_THRESHOLDS, generateInitialSensorValues,
  simulateSensorTick, checkAlerts, autoControlDevices, generateChartHistory
} from '../data/sensorData'
import { storage, STORAGE_KEYS } from '../utils/storage'

// ── 초기 상태 ────────────────────────────────────────────────
function buildInitialState() {
  const crop     = storage.get(STORAGE_KEYS.SELECTED_CROP, '딸기')
  const sensors  = generateInitialSensorValues(crop)
  const tMode    = storage.get(STORAGE_KEYS.THRESHOLD_MODE, 'auto')
  const dMode    = storage.get(STORAGE_KEYS.DEVICE_MODE, 'auto')
  const manualTh = storage.get(STORAGE_KEYS.MANUAL_THRESHOLDS, null)
  const growthDay= storage.get(STORAGE_KEYS.GROWTH_DAY, 25)
  const interval = storage.get(STORAGE_KEYS.REFRESH_INTERVAL, 2000)
  const apiKey   = storage.get(STORAGE_KEYS.API_KEY, '')
  const farmName = storage.get(STORAGE_KEYS.FARM_NAME, '우리 농장')

  return {
    // 농장 기본 정보
    farmName,
    crop,
    growthDay,
    // 센서값
    sensors,
    sensorHistory: generateChartHistory(sensors, crop),
    // 경보
    alerts: checkAlerts(sensors, crop),
    alertHistory: storage.get(STORAGE_KEYS.ALERT_HISTORY, []),
    // 기기 상태
    deviceMode: dMode,           // 'auto' | 'manual'
    manualDevices: storage.get(STORAGE_KEYS.MANUAL_DEVICES, {
      cooling:false, heating:false, fan:false, water:false,
      co2vent:false, co2gen:false, soilheat:false, soilcool:false
    }),
    // 임계값 설정
    thresholdMode: tMode,        // 'auto' | 'manual'
    manualThresholds: manualTh || buildDefaultManualThresholds(crop),
    // 업데이트 주기
    refreshInterval: interval,
    // Claude API
    apiKey,
    // UI 상태
    activeTab: 'dashboard',
  }
}

function buildDefaultManualThresholds(crop) {
  const t = CROP_THRESHOLDS[crop]
  return {
    temp:  { min: t.temp.min,  max: t.temp.max  },
    humid: { min: t.humid.min, max: t.humid.max },
    soil:  { min: t.soil.min,  max: t.soil.max  },
    co2:   { min: t.co2.min,   max: t.co2.max   },
    light: { min: t.light.min, max: t.light.max },
  }
}

// ── 리듀서 ────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'TICK_SENSOR': {
      const newSensors = simulateSensorTick(state.sensors, state.crop)
      const thresholds = state.thresholdMode === 'manual' ? state.manualThresholds : null
      const alerts     = checkAlerts(newSensors, state.crop, thresholds)
      const autoDevs   = autoControlDevices(newSensors, state.crop)
      const newHistory = [
        ...state.sensorHistory.slice(-59),
        { time: new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }), ...newSensors }
      ]
      // 새 경보를 alert 히스토리에 추가 (중복 제거)
      let alertHistory = state.alertHistory
      if (alerts.length > 0) {
        const newEntries = alerts.map(a => ({ ...a, ts: Date.now() }))
        alertHistory = [...newEntries, ...state.alertHistory].slice(0, 50)
      }
      return { ...state, sensors: newSensors, sensorHistory: newHistory, alerts, autoDevices: autoDevs, alertHistory }
    }

    case 'SET_CROP': {
      const sensors = generateInitialSensorValues(action.crop)
      storage.set(STORAGE_KEYS.SELECTED_CROP, action.crop)
      storage.set(STORAGE_KEYS.MANUAL_THRESHOLDS, buildDefaultManualThresholds(action.crop))
      return {
        ...state, crop: action.crop, sensors,
        sensorHistory: generateChartHistory(sensors, action.crop),
        manualThresholds: buildDefaultManualThresholds(action.crop),
        alerts: []
      }
    }

    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'SET_THRESHOLD_MODE':
      storage.set(STORAGE_KEYS.THRESHOLD_MODE, action.mode)
      return { ...state, thresholdMode: action.mode }

    case 'SET_MANUAL_THRESHOLDS':
      storage.set(STORAGE_KEYS.MANUAL_THRESHOLDS, action.thresholds)
      return { ...state, manualThresholds: action.thresholds }

    case 'SET_DEVICE_MODE':
      storage.set(STORAGE_KEYS.DEVICE_MODE, action.mode)
      return { ...state, deviceMode: action.mode }

    case 'TOGGLE_MANUAL_DEVICE': {
      const updated = { ...state.manualDevices, [action.deviceId]: !state.manualDevices[action.deviceId] }
      storage.set(STORAGE_KEYS.MANUAL_DEVICES, updated)
      return { ...state, manualDevices: updated }
    }

    case 'SET_REFRESH_INTERVAL':
      storage.set(STORAGE_KEYS.REFRESH_INTERVAL, action.ms)
      return { ...state, refreshInterval: action.ms }

    case 'SET_API_KEY':
      storage.set(STORAGE_KEYS.API_KEY, action.key)
      return { ...state, apiKey: action.key }

    case 'SET_FARM_NAME':
      storage.set(STORAGE_KEYS.FARM_NAME, action.name)
      return { ...state, farmName: action.name }

    case 'SET_GROWTH_DAY':
      storage.set(STORAGE_KEYS.GROWTH_DAY, action.day)
      return { ...state, growthDay: action.day }

    case 'CLEAR_ALERT_HISTORY':
      storage.set(STORAGE_KEYS.ALERT_HISTORY, [])
      return { ...state, alertHistory: [] }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────
const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState)
  const intervalRef = useRef(null)

  // 센서 시뮬레이션 타이머 (refreshInterval 변경 시 재설정)
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_SENSOR' })
    }, state.refreshInterval)
  }, [state.refreshInterval])

  useEffect(() => {
    startTimer()
    return () => clearInterval(intervalRef.current)
  }, [startTimer])

  // alertHistory localStorage 동기화
  useEffect(() => {
    storage.set(STORAGE_KEYS.ALERT_HISTORY, state.alertHistory)
  }, [state.alertHistory])

  return (
    <FarmContext.Provider value={{ state, dispatch }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within FarmProvider')
  return ctx
}
