// src/pages/SensorDetail.jsx — Bloom 디자인 시스템 적용
import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useFarm } from '../hooks/useFarmStore'
import { CROP_THRESHOLDS } from '../data/sensorData'
import { Card, SectionHeader, SENSOR_COLOR } from '../components/ui'

const SENSOR_TABS = [
  { key:'temp',  label:'대기 온도', unit:'°C',  icon:'🌡️' },
  { key:'humid', label:'대기 습도', unit:'%',   icon:'💧' },
  { key:'soil',  label:'토양 온도', unit:'°C',  icon:'🌱' },
  { key:'co2',   label:'CO2 농도',  unit:'ppm', icon:'💨' },
  { key:'light', label:'조도',      unit:'lux', icon:'☀️' },
]

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bloom-card px-3 py-2 text-xs shadow-card-md">
      <p className="text-bloom-text-secondary mb-1">{payload[0]?.payload?.fullTime || label}</p>
      <p className="font-bold text-bloom-text-primary text-sm">
        {typeof payload[0].value === 'number'
          ? payload[0].value.toFixed(payload[0].value > 100 ? 0 : 1)
          : payload[0].value}{unit}
      </p>
    </div>
  )
}

export default function SensorDetail() {
  const { state } = useFarm()
  const { sensorHistory, sensors, crop } = state
  const th = CROP_THRESHOLDS[crop]
  const [active, setActive] = useState('temp')

  const meta = SENSOR_TABS.find(t => t.key === active)
  const range = th[active]
  const c = SENSOR_COLOR[active]
  const currentVal = sensors[active]
  const isHigh = currentVal > range.max
  const isLow  = currentVal < range.min

  const chartData = sensorHistory.slice(-30).map((d, i) => ({
    time: i % 6 === 0 ? d.time?.slice(0, 5) : '',
    value: d[active],
    fullTime: d.time
  }))

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-2xl font-bold text-bloom-text-primary">센서 상세</h1>
        <p className="text-sm text-bloom-text-secondary">{crop} 재배 기준 최적 범위</p>
      </div>

      {/* 센서 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SENSOR_TABS.map(t => {
          const tc = SENSOR_COLOR[t.key]
          const isActive = active === t.key
          return (
            <button key={t.key} onClick={() => setActive(t.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border transition-all"
              style={isActive ? {
                background: tc.light,
                borderColor: tc.bar + '60',
                color: tc.text
              } : {
                background: 'white',
                borderColor: '#E2E8F0',
                color: '#718096'
              }}>
              {t.icon} {t.label}
            </button>
          )
        })}
      </div>

      {/* 현재값 카드 */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: c.bar }} />
          <div className="flex-1">
            <p className="text-xs text-bloom-text-secondary">{meta.icon} {meta.label}</p>
            <p className="text-3xl font-bold text-bloom-text-primary leading-tight">
              {typeof currentVal === 'number' ? currentVal.toFixed(currentVal > 100 ? 0 : 1) : '--'}
              <span className="text-base font-normal text-bloom-text-secondary ml-1">{meta.unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-bloom-text-secondary">최적 범위</p>
            <p className="text-xs font-bold" style={{ color: c.text }}>{range.min}~{range.max}{meta.unit}</p>
            <p className="text-[10px] text-bloom-text-secondary mt-1">최적값</p>
            <p className="text-xs font-bold" style={{ color: c.bar }}>{range.optimal}{meta.unit}</p>
          </div>
        </div>
        {(isHigh || isLow) && (
          <div className="px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: isHigh ? '#FFF0F0' : '#FFFBEB', color: isHigh ? '#C53030' : '#C05621' }}>
            {isHigh ? `⚠ 상한값(${range.max}${meta.unit}) 초과 — 즉시 환경 조치가 필요합니다`
                    : `⚠ 하한값(${range.min}${meta.unit}) 미달 — 보온·보습이 필요합니다`}
          </div>
        )}
      </Card>

      {/* 시간대별 차트 */}
      <Card>
        <SectionHeader title="시간대별 변화" subtitle="최근 30회 측정값" />
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={chartData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
            <XAxis dataKey="time" tick={{ fill:'#A0AEC0', fontSize:9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill:'#A0AEC0', fontSize:10 }}
              domain={[d => Math.min(d[0], range.min)*0.95, d => Math.max(d[1], range.max)*1.05]} />
            <Tooltip content={<CustomTooltip unit={meta.unit} />} />
            <ReferenceLine y={range.max} stroke="#FC8181" strokeDasharray="4 2" strokeWidth={1.5} />
            <ReferenceLine y={range.min} stroke="#63B3ED" strokeDasharray="4 2" strokeWidth={1.5} />
            <ReferenceLine y={range.optimal} stroke={c.bar} strokeDasharray="2 4" strokeWidth={1} opacity={0.4} />
            <Line type="monotone" dataKey="value" stroke={c.bar} strokeWidth={2.5}
              dot={false} activeDot={{ r:5, fill:c.bar, strokeWidth:0 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-[10px] text-bloom-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-red-300" />상한
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-blue-300" />하한
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed" style={{ borderColor: c.bar }} />최적
          </span>
        </div>
      </Card>

      {/* 전체 센서 게이지 */}
      <Card>
        <SectionHeader title="전체 센서 현황" />
        <div className="space-y-3">
          {SENSOR_TABS.map(t => {
            const val = sensors[t.key]
            const r = th[t.key]
            const tc = SENSOR_COLOR[t.key]
            const isOver = val > r.max || val < r.min
            const pct = Math.max(0, Math.min(100, ((val - r.min) / (r.max - r.min)) * 100))
            return (
              <div key={t.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-bloom-text-secondary">{t.icon} {t.label}</span>
                  <span className="font-bold" style={{ color: isOver ? '#E53E3E' : tc.text }}>
                    {typeof val === 'number' ? val.toFixed(val > 100 ? 0 : 1) : '--'}{t.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width:`${pct}%`, background: isOver ? '#FC8181' : tc.bar }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

    </div>
  )
}
