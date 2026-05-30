// src/pages/Settings.jsx — Bloom 디자인 시스템 적용
import React, { useState } from 'react'
import { useFarm } from '../hooks/useFarmStore'
import { CROP_LIST, CROP_THRESHOLDS } from '../data/sensorData'
import { Card, SectionHeader } from '../components/ui'

const CROP_EMOJI = { 딸기:'🍓', 토마토:'🍅', 고추:'🌶️', 파프리카:'🫑' }
const SENSOR_META = {
  temp:  { label:'대기 온도', unit:'°C',  icon:'🌡️' },
  humid: { label:'대기 습도', unit:'%',   icon:'💧' },
  soil:  { label:'토양 온도', unit:'°C',  icon:'🌱' },
  co2:   { label:'CO2 농도',  unit:'ppm', icon:'💨' },
  light: { label:'조도',      unit:'lux', icon:'☀️' },
}
const REFRESH_OPTS = [
  { ms:2000, label:'2초' }, { ms:5000, label:'5초' },
  { ms:10000, label:'10초' }, { ms:30000, label:'30초' }
]

export default function Settings() {
  const { state, dispatch } = useFarm()
  const { crop, thresholdMode, manualThresholds, refreshInterval, apiKey, farmName, growthDay } = state
  const [localApiKey, setLocalApiKey]   = useState(apiKey)
  const [localFarmName, setLocalFarmName] = useState(farmName)
  const [localTh, setLocalTh]           = useState(manualThresholds)
  const [saved, setSaved]               = useState(false)

  const save = () => {
    if (localFarmName.trim()) dispatch({ type:'SET_FARM_NAME', name:localFarmName.trim() })
    dispatch({ type:'SET_API_KEY', key:localApiKey.trim() })
    if (thresholdMode === 'manual') dispatch({ type:'SET_MANUAL_THRESHOLDS', thresholds:localTh })
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }

  const updateTh = (sensor, bound, val) => {
    const n = parseFloat(val)
    if (isNaN(n)) return
    setLocalTh(p => ({ ...p, [sensor]: { ...p[sensor], [bound]: n } }))
  }

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-2xl font-bold text-bloom-text-primary">설정</h1>
        <p className="text-sm text-bloom-text-secondary">농장 환경 및 앱 설정</p>
      </div>

      {/* 농장 정보 */}
      <Card>
        <SectionHeader title="농장 정보" />
        <div>
          <label className="text-xs text-bloom-text-secondary block mb-1.5">농장 이름</label>
          <input value={localFarmName} onChange={e => setLocalFarmName(e.target.value)}
            className="w-full border border-bloom-divider rounded-xl px-4 py-2.5 text-sm
              text-bloom-text-primary bg-bloom-bg outline-none focus:border-bloom-primary transition-colors" />
        </div>
      </Card>

      {/* 작물 선택 */}
      <Card>
        <SectionHeader title="작물 선택" />
        <div className="grid grid-cols-2 gap-2.5">
          {CROP_LIST.map(c => (
            <button key={c}
              onClick={() => dispatch({ type:'SET_CROP', crop:c })}
              className={`py-3 rounded-2xl text-sm font-semibold border-2 transition-all
                ${crop === c
                  ? 'border-bloom-primary text-bloom-primary bg-bloom-primary/5'
                  : 'border-bloom-divider text-bloom-text-secondary bg-white'}`}>
              {CROP_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        {/* 재배 일수 슬라이더 (원본 SeekBar 이식) */}
        <div className="mt-4">
          <div className="flex items-end justify-between mb-3">
            <p className="text-sm font-bold text-bloom-text-primary">재배일 조정</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-bloom-primary">{growthDay}</span>
              <span className="text-xs text-bloom-text-secondary font-semibold pb-0.5">일째</span>
            </div>
          </div>
          <input type="range" min={1} max={150} value={growthDay}
            onChange={e => dispatch({ type:'SET_GROWTH_DAY', day:parseInt(e.target.value) })}
            className="w-full" />
          <div className="flex justify-between text-[10px] text-bloom-text-secondary mt-1.5">
            <span>파종</span><span>발아·생장</span><span>개화</span><span>수확</span>
          </div>
        </div>
      </Card>

      {/* 임계값 설정 */}
      <Card>
        <SectionHeader title="임계값 설정" />
        <div className="flex gap-2 mb-3">
          {[{mode:'auto', label:'자동 (표준값)'}, {mode:'manual', label:'직접 설정'}].map(opt => (
            <button key={opt.mode}
              onClick={() => dispatch({ type:'SET_THRESHOLD_MODE', mode:opt.mode })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                ${thresholdMode === opt.mode
                  ? 'border-bloom-primary text-bloom-primary bg-bloom-primary/5'
                  : 'border-bloom-divider text-bloom-text-secondary'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {thresholdMode === 'auto' ? (
          <div className="space-y-2 bg-bloom-bg rounded-xl p-3">
            {Object.entries(SENSOR_META).map(([key, meta]) => {
              const t = CROP_THRESHOLDS[crop]?.[key]
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-bloom-text-secondary">{meta.icon} {meta.label}</span>
                  <span className="text-xs font-bold text-bloom-text-primary">
                    {t?.min}~{t?.max}{meta.unit}
                  </span>
                </div>
              )
            })}
            <p className="text-[10px] text-bloom-text-secondary mt-1 pt-2 border-t border-bloom-divider">
              농촌진흥청 {crop} 시설원예 표준 재배기준 적용 중
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(SENSOR_META).map(([key, meta]) => (
              <div key={key} className="bg-bloom-bg rounded-xl p-3">
                <p className="text-xs font-semibold text-bloom-text-primary mb-2">
                  {meta.icon} {meta.label} ({meta.unit})
                </p>
                <div className="flex gap-2">
                  {['min','max'].map(bound => (
                    <div key={bound} className="flex-1">
                      <label className="text-[10px] text-bloom-text-secondary">
                        {bound === 'min' ? '최소' : '최대'}
                      </label>
                      <input type="number"
                        value={localTh[key]?.[bound] ?? ''}
                        onChange={e => updateTh(key, bound, e.target.value)}
                        className="w-full border border-bloom-divider rounded-lg px-3 py-2 text-xs
                          text-bloom-text-primary bg-white outline-none focus:border-bloom-primary mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 센서 갱신 주기 */}
      <Card>
        <SectionHeader title="센서 갱신 주기" />
        <div className="grid grid-cols-4 gap-2">
          {REFRESH_OPTS.map(opt => (
            <button key={opt.ms}
              onClick={() => dispatch({ type:'SET_REFRESH_INTERVAL', ms:opt.ms })}
              className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                ${refreshInterval === opt.ms
                  ? 'border-bloom-primary text-bloom-primary bg-bloom-primary/5'
                  : 'border-bloom-divider text-bloom-text-secondary'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Claude API Key */}
      <Card>
        <SectionHeader title="Claude API Key" subtitle="AI 진단 기능 사용 시 필요" />
        <input type="password" value={localApiKey} onChange={e => setLocalApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full border border-bloom-divider rounded-xl px-4 py-2.5 text-sm
            font-mono text-bloom-text-primary bg-bloom-bg outline-none focus:border-bloom-primary" />
        <p className="text-[10px] text-bloom-text-secondary mt-1.5">
          ⚠ 데모용. localStorage 저장, 서버 미전송
        </p>
      </Card>

      {/* 저장 버튼 */}
      <button onClick={save}
        className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-98"
        style={{ background: saved ? '#38A169' : 'var(--bloom-primary)' }}>
        {saved ? '✓ 저장되었습니다' : '설정 저장'}
      </button>

      <p className="text-center text-[10px] text-bloom-text-secondary pb-2">
        스마트팜 PWA v1.0 · React + Vite + Tailwind CSS
      </p>
    </div>
  )
}
