// src/pages/Dashboard.jsx — Bloom 디자인 시스템 적용
import React from 'react'
import { useFarm } from '../hooks/useFarmStore'
import { CROP_THRESHOLDS, getGrowthStage } from '../data/sensorData'
import { SensorCard, EnvChip, Card, SectionHeader } from '../components/ui'

const CROP_EMOJI = { 딸기:'🍓', 토마토:'🍅', 고추:'🌶️', 파프리카:'🫑' }

export default function Dashboard() {
  const { state, dispatch } = useFarm()
  const { sensors, alerts, crop, growthDay, farmName, alertHistory, deviceMode, manualDevices, autoDevices } = state
  const th = CROP_THRESHOLDS[crop]
  const growth = getGrowthStage(crop, growthDay)

  const DEVICES_INFO = [
    { id:'cooling',  label:'냉방',     icon:'❄️' },
    { id:'heating',  label:'히터',     icon:'🔥' },
    { id:'fan',      label:'환풍기',   icon:'💨' },
    { id:'water',    label:'관수',     icon:'💧' },
    { id:'co2vent',  label:'CO2 환기', icon:'🌬️' },
    { id:'co2gen',   label:'CO2 발생', icon:'⚗️' },
    { id:'soilheat', label:'지온 히터',icon:'🌡️' },
    { id:'soilcool', label:'지온 쿨러',icon:'🧊' },
  ]

  return (
    <div className="space-y-4">

      {/* ── 헤더: 농장명 + 성장 단계 배지 ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold text-bloom-text-primary">{farmName}</h1>
          <p className="text-sm text-bloom-text-secondary mt-0.5">
            {CROP_EMOJI[crop]} {crop} · 재배 {growthDay}일차
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
            style={{ background: growth.color }}>
            {growth.label}
          </span>
          {growth.nextDays > 0 && (
            <span className="text-[10px] text-bloom-text-secondary">
              {growth.nextLabel}까지 {growth.nextDays}일
            </span>
          )}
        </div>
      </div>

      {/* ── 경보 배너 ── */}
      {alerts.length > 0 && (
        <div className="bloom-card p-3 border-l-4 border-red-400 bg-red-50">
          <p className="text-sm font-bold text-red-600 mb-1.5">🚨 환경 경보 {alerts.length}건</p>
          {alerts.map(a => (
            <div key={a.id} className="flex items-start gap-2 mt-1">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0
                ${a.type === 'danger' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <p className="text-xs text-red-700">{a.msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 환경 칩 3개 (원본 GrowthStatus 상단 칩 스타일) ── */}
      <div className="flex gap-2">
        <EnvChip sensorKey="temp"  label="온도"  value={sensors.temp}  unit="°C" />
        <EnvChip sensorKey="humid" label="습도"  value={sensors.humid} unit="%" />
        <EnvChip sensorKey="co2"   label="CO2"   value={sensors.co2}   unit="ppm" />
      </div>

      {/* ── 센서 카드 2×2 그리드 (원본 GridLayout 그대로) ── */}
      <div>
        <p className="text-xs font-semibold text-bloom-text-secondary mb-2 px-0.5">센서 현황</p>
        <div className="grid grid-cols-2 gap-3">
          <SensorCard sensorKey="temp"  label="대기 온도" value={sensors.temp}  unit="°C"  min={th.temp.min}  max={th.temp.max} />
          <SensorCard sensorKey="humid" label="대기 습도" value={sensors.humid} unit="%"   min={th.humid.min} max={th.humid.max} />
          <SensorCard sensorKey="soil"  label="토양 온도" value={sensors.soil}  unit="°C"  min={th.soil.min}  max={th.soil.max} />
          <SensorCard sensorKey="co2"   label="CO2 농도"  value={sensors.co2}   unit="ppm" min={th.co2.min}   max={th.co2.max} />
        </div>
      </div>

      {/* ── 기기 상태 카드 ── */}
      <Card>
        <SectionHeader
          title="기기 상태"
          subtitle={deviceMode === 'auto' ? '자동 제어 중' : '수동 제어 중'}
        />
        <div className="grid grid-cols-4 gap-3">
          {DEVICES_INFO.map(d => {
            const isOn = deviceMode === 'auto'
              ? (autoDevices?.[d.id] ?? false)
              : (manualDevices?.[d.id] ?? false)
            return (
              <div key={d.id} className="flex flex-col items-center gap-1.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-colors
                  ${isOn ? 'bg-bloom-primary/10' : 'bg-gray-50'}`}
                  style={{ border: isOn ? '1.5px solid #2D5A2740' : '1.5px solid #E2E8F0' }}>
                  {d.icon}
                </div>
                <span className="text-[10px] text-bloom-text-secondary text-center leading-tight">{d.label}</span>
                <span className={`text-[9px] font-bold ${isOn ? 'text-bloom-primary' : 'text-gray-300'}`}>
                  {isOn ? 'ON' : 'OFF'}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── 최근 경보 이력 ── */}
      {alertHistory.length > 0 && (
        <Card>
          <SectionHeader
            title="최근 경보 이력"
            action={
              <button onClick={() => dispatch({ type: 'CLEAR_ALERT_HISTORY' })}
                className="text-xs text-bloom-text-secondary hover:text-red-400 transition-colors">
                전체 삭제
              </button>
            }
          />
          <div className="space-y-2.5 max-h-44 overflow-y-auto">
            {alertHistory.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0
                  ${a.type === 'danger' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="text-[11px] text-bloom-text-secondary w-12 flex-shrink-0">{a.time}</span>
                <span className="text-[11px] text-bloom-text-primary">{a.msg}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
}
