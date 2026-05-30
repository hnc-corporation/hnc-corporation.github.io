// src/components/ui.jsx — Bloom 디자인 시스템 기반 공통 컴포넌트
import React from 'react'

// ── 센서별 색상 매핑 ──────────────────────────────────────────
export const SENSOR_COLOR = {
  temp:  { bar: '#FF6B6B', light: '#FFF0F0', text: '#C53030' },
  humid: { bar: '#4D96FF', light: '#EBF4FF', text: '#2B6CB0' },
  soil:  { bar: '#A68966', light: '#FDF6EF', text: '#7B5E3A' },
  co2:   { bar: '#9D85FF', light: '#F3F0FF', text: '#6B46C1' },
  light: { bar: '#F6AD55', light: '#FFFBEB', text: '#C05621' },
}

export function getSensorStatus(value, min, max) {
  const buffer = (max - min) * 0.1
  if (value > max || value < min) return 'danger'
  if (value > max - buffer || value < min + buffer) return 'warning'
  return 'normal'
}

// ── 센서 카드 (원본 cardTemp 스타일) ─────────────────────────
export function SensorCard({ sensorKey, label, value, unit, min, max, onClick }) {
  const c = SENSOR_COLOR[sensorKey] || SENSOR_COLOR.temp
  const status = getSensorStatus(value, min, max)
  const isAlert = status !== 'normal'

  return (
    <button
      onClick={onClick}
      className="bloom-card p-3 text-left w-full active:scale-95 transition-transform"
      style={{ outline: isAlert ? `2px solid ${status === 'danger' ? '#FC8181' : '#F6AD55'}` : 'none' }}
    >
      {/* 컬러 바 (원본 4dp 색상 바) */}
      <div className="w-10 h-1 rounded-full mb-2" style={{ background: c.bar }} />
      <p className="text-xl font-bold text-bloom-text-primary leading-tight">
        {typeof value === 'number' ? value.toFixed(value > 100 ? 0 : 1) : '--'}
        <span className="text-sm font-normal text-bloom-text-secondary ml-1">{unit}</span>
      </p>
      <p className="text-xs text-bloom-text-secondary mt-1">{label}</p>
      {isAlert && (
        <span className="text-[10px] font-semibold mt-1 block"
          style={{ color: status === 'danger' ? '#E53E3E' : '#DD6B20' }}>
          {status === 'danger' ? '⚠ 범위 초과' : '△ 주의'}
        </span>
      )}
    </button>
  )
}

// ── 환경 칩 (원본 bg_env_chip) ───────────────────────────────
export function EnvChip({ sensorKey, label, value, unit }) {
  const c = SENSOR_COLOR[sensorKey] || SENSOR_COLOR.temp
  return (
    <div className="env-chip flex items-center gap-2 px-3 py-2 flex-1">
      <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ background: c.bar }} />
      <div>
        <p className="text-xs font-bold text-bloom-text-primary leading-tight">
          {typeof value === 'number' ? value.toFixed(value > 100 ? 0 : 1) : '--'}{unit}
        </p>
        <p className="text-[10px] text-bloom-text-secondary">{label}</p>
      </div>
    </div>
  )
}

// ── 기기 토글 (원본 SwitchMaterial 스타일) ───────────────────
export function DeviceToggle({ label, icon, isOn, isAuto, onToggle }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-bloom-divider last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl w-7 text-center">{icon}</span>
        <div>
          <p className="text-sm font-medium text-bloom-text-primary">{label}</p>
          <p className="text-[11px] text-bloom-text-secondary">{isAuto ? '자동 제어' : '수동 제어'}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={isAuto}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200
          ${isOn ? 'bg-bloom-primary' : 'bg-gray-200'}
          ${isAuto ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
          ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

// ── 하단 네비게이션 ──────────────────────────────────────────
export function BottomNav({ activeTab, onChange, alertCount }) {
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'sensor',    label: '센서',     icon: '📡' },
    { id: 'control',   label: '제어',     icon: '🎛️' },
    { id: 'ai',        label: 'AI 진단',  icon: '🤖' },
    { id: 'settings',  label: '설정',     icon: '⚙️' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{ background: 'var(--bloom-surface)', borderTop: '1px solid var(--bloom-divider)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(t => {
          const isActive = activeTab === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-0.5 py-2.5 px-3 relative min-w-[56px]">
              <span className="text-xl leading-none">{t.icon}</span>
              <span className={`text-[10px] font-medium transition-colors
                ${isActive ? 'text-bloom-primary' : 'text-bloom-text-secondary'}`}>
                {t.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-bloom-primary" />
              )}
              {t.id === 'dashboard' && alertCount > 0 && (
                <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ── Bloom 카드 ───────────────────────────────────────────────
export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`bloom-card p-4 ${className}`} style={style}>
      {children}
    </div>
  )
}

// ── 섹션 헤더 ────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-base font-bold text-bloom-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-bloom-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── 로딩 닷 ─────────────────────────────────────────────────
export function LoadingDots() {
  return (
    <span className="flex gap-1 items-center py-1">
      {[0,1,2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: 'var(--bloom-primary)', animationDelay: `${i*0.15}s` }} />
      ))}
    </span>
  )
}

// ── 빈 상태 ─────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold text-bloom-text-primary">{title}</p>
      {desc && <p className="text-sm text-bloom-text-secondary mt-1">{desc}</p>}
    </div>
  )
}
