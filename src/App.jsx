// src/App.jsx — Bloom 디자인 시스템 적용
import React from 'react'
import { useFarm } from './hooks/useFarmStore'
import { BottomNav } from './components/ui'
import Dashboard    from './pages/Dashboard'
import SensorDetail from './pages/SensorDetail'
import Control      from './pages/Control'
import AiDiagnosis  from './pages/AiDiagnosis'
import Settings     from './pages/Settings'

const PAGE_MAP = {
  dashboard: Dashboard,
  sensor:    SensorDetail,
  control:   Control,
  ai:        AiDiagnosis,
  settings:  Settings,
}

export default function App() {
  const { state, dispatch } = useFarm()
  const { activeTab, alerts } = state
  const PageComponent = PAGE_MAP[activeTab] || Dashboard
  const isAi = activeTab === 'ai'

  return (
    // Bloom 배경색 (#F7FAF7)
    <div className="min-h-screen" style={{ background: 'var(--bloom-bg)' }}>
      {/* iOS 상태바 안전 여백 */}
      <div className="h-safe-top" style={{ background: 'var(--bloom-bg)' }} />

      <main className={`px-4 pt-3 pb-24 max-w-lg mx-auto ${isAi ? 'flex flex-col' : ''}`}
        style={isAi ? { height: 'calc(100dvh - 72px)' } : {}}>
        <PageComponent />
      </main>

      <BottomNav
        activeTab={activeTab}
        onChange={tab => dispatch({ type:'SET_TAB', tab })}
        alertCount={alerts.length}
      />
    </div>
  )
}
