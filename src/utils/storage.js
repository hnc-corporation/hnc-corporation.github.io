// src/utils/storage.js
// Capacitor 네이티브 확장 시 @capacitor/preferences 로 교체 가능하도록 추상화

const PREFIX = 'smartfarm_'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('storage.set failed:', e)
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key)
  }
}

// 앱 전역 설정 키 상수
export const STORAGE_KEYS = {
  SELECTED_CROP:    'selected_crop',
  THRESHOLD_MODE:   'threshold_mode',    // 'auto' | 'manual'
  MANUAL_THRESHOLDS:'manual_thresholds',
  DEVICE_MODE:      'device_mode',       // 'auto' | 'manual'
  MANUAL_DEVICES:   'manual_devices',
  REFRESH_INTERVAL: 'refresh_interval',  // ms
  FARM_NAME:        'farm_name',
  ALERT_HISTORY:    'alert_history',
  GROWTH_DAY:       'growth_day',
  API_KEY:          'api_key',           // Claude API key (데모용)
}
