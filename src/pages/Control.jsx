// src/pages/Control.jsx — Bloom 디자인 시스템 적용
import React from 'react'
import { useFarm } from '../hooks/useFarmStore'
import { DEVICES, CROP_THRESHOLDS } from '../data/sensorData'
import { DeviceToggle, Card, SectionHeader } from '../components/ui'

export default function Control() {
  const { state, dispatch } = useFarm()
  const { deviceMode, manualDevices, autoDevices, crop, sensors } = state
  const th = CROP_THRESHOLDS[crop]
  const isAuto = deviceMode === 'auto'

  const groups = DEVICES.reduce((acc, d) => {
    if (!acc[d.group]) acc[d.group] = []
    acc[d.group].push(d)
    return acc
  }, {})

  const GROUP_SENSOR = {
    '대기 온도': 'temp', '대기 습도': 'humid', 'CO2': 'co2', '토양 온도': 'soil'
  }

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-2xl font-bold text-bloom-text-primary">제어판</h1>
        <p className="text-sm text-bloom-text-secondary">기기 상태 및 제어 설정</p>
      </div>

      {/* 제어 모드 선택 */}
      <Card>
        <SectionHeader title="제어 모드" />
        <div className="flex gap-3">
          {[
            { mode:'auto',   icon:'🤖', label:'자동 제어', desc:'임계값 초과 시 자동 작동' },
            { mode:'manual', icon:'🖐️', label:'수동 제어', desc:'스위치로 직접 ON/OFF' },
          ].map(opt => (
            <button key={opt.mode}
              onClick={() => dispatch({ type:'SET_DEVICE_MODE', mode:opt.mode })}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center
                ${deviceMode === opt.mode
                  ? 'border-bloom-primary bg-bloom-primary/5'
                  : 'border-bloom-divider bg-white'}`}>
              <span className="text-2xl">{opt.icon}</span>
              <span className={`text-sm font-bold ${deviceMode === opt.mode ? 'text-bloom-primary' : 'text-bloom-text-secondary'}`}>
                {opt.label}
              </span>
              <span className="text-[10px] text-bloom-text-secondary leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
        {isAuto && (
          <div className="mt-3 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">
            <p className="text-xs text-green-700">
              💡 센서값이 임계범위를 벗어나면 대응 기기가 자동으로 작동합니다
            </p>
          </div>
        )}
      </Card>

      {/* 그룹별 기기 토글 */}
      {Object.entries(groups).map(([group, devices]) => {
        const sKey = GROUP_SENSOR[group]
        const val = sensors[sKey]
        const r = th[sKey]
        const isOut = val > r.max || val < r.min

        return (
          <Card key={group}>
            {/* 그룹 헤더 + 현재 센서값 */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-bloom-text-primary">{group}</h3>
              <div className="flex items-center gap-1.5">
                {isOut && <span className="text-amber-500 text-xs">⚠</span>}
                <span className={`text-xs font-semibold ${isOut ? 'text-red-500' : 'text-bloom-text-secondary'}`}>
                  {typeof val === 'number' ? val.toFixed(val > 100 ? 0 : 1) : '--'}{r.unit}
                </span>
                <span className="text-[10px] text-bloom-text-secondary">
                  ({r.min}~{r.max})
                </span>
              </div>
            </div>
            <div className="border-t border-bloom-divider">
              {devices.map(d => {
                const isOn = isAuto
                  ? (autoDevices?.[d.id] ?? false)
                  : (manualDevices?.[d.id] ?? false)
                return (
                  <DeviceToggle key={d.id}
                    label={d.label} icon={d.icon}
                    isOn={isOn} isAuto={isAuto}
                    onToggle={() => dispatch({ type:'TOGGLE_MANUAL_DEVICE', deviceId:d.id })} />
                )
              })}
            </div>
          </Card>
        )
      })}

    </div>
  )
}
