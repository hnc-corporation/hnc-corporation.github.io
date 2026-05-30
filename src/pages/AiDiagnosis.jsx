// src/pages/AiDiagnosis.jsx — Bloom 디자인 시스템 적용
import React, { useState, useRef, useEffect } from 'react'
import { useFarm } from '../hooks/useFarmStore'
import { useClaudeChat } from '../hooks/useClaudeChat'
import { CROP_THRESHOLDS } from '../data/sensorData'
import { LoadingDots } from '../components/ui'

const QUICK_Q = [
  '현재 센서 상태 분석해줘',
  '오늘 환경 관리 조언',
  '경보 원인과 대처 방법',
  '수확량 최적화 팁',
  '병충해 예방 방법',
]

function buildContext(state) {
  const { sensors, crop, growthDay, alerts } = state
  const t = CROP_THRESHOLDS[crop]
  return `작물: ${crop} (재배 ${growthDay}일차)
센서: 대기온도 ${sensors.temp}°C(기준 ${t.temp.min}~${t.temp.max}), 습도 ${sensors.humid}%(${t.humid.min}~${t.humid.max}), 토양온도 ${sensors.soil}°C(${t.soil.min}~${t.soil.max}), CO2 ${sensors.co2}ppm(${t.co2.min}~${t.co2.max}), 조도 ${sensors.light}lux
경보: ${alerts.length > 0 ? alerts.map(a => a.msg).join(', ') : '없음'}`
}

export default function AiDiagnosis() {
  const { state, dispatch } = useFarm()
  const { apiKey } = state
  const { messages, loading, error, sendMessage, clearChat } = useClaudeChat(apiKey)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = (text = input) => {
    const msg = text.trim()
    if (!msg) return
    sendMessage(msg, buildContext(state))
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-bloom-text-primary">AI 진단</h1>
          <p className="text-sm text-bloom-text-secondary">Claude 스마트팜 어시스턴트</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat}
            className="text-xs text-bloom-text-secondary border border-bloom-divider rounded-xl px-3 py-1.5 hover:bg-gray-50">
            대화 초기화
          </button>
        )}
      </div>

      {/* API Key 미설정 */}
      {!apiKey && (
        <div className="bloom-card p-3 mb-3 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-xs text-amber-700">
            ⚠ Claude API Key가 없습니다.{' '}
            <button className="underline font-semibold"
              onClick={() => dispatch({ type:'SET_TAB', tab:'settings' })}>
              설정 화면
            </button>에서 입력해 주세요.
          </p>
        </div>
      )}

      {/* 빠른 질문 + 컨텍스트 */}
      {messages.length === 0 && (
        <div className="mb-3 space-y-3">
          <p className="text-xs font-semibold text-bloom-text-secondary">빠른 질문</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_Q.map(q => (
              <button key={q} onClick={() => handleSend(q)}
                className="text-xs px-3 py-2 rounded-2xl bg-white border border-bloom-divider
                  text-bloom-text-secondary hover:border-bloom-primary hover:text-bloom-primary transition-colors">
                {q}
              </button>
            ))}
          </div>
          {/* 현재 컨텍스트 미리보기 */}
          <div className="bloom-card p-3 bg-green-50 border border-green-100">
            <p className="text-[10px] font-semibold text-green-700 mb-1.5">📡 현재 농장 상태 (자동 전송)</p>
            <pre className="text-[10px] text-green-600 whitespace-pre-wrap leading-relaxed">
              {buildContext(state)}
            </pre>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${m.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'bloom-card text-bloom-text-primary rounded-bl-sm'}
            `}
            style={m.role === 'user' ? { background: 'var(--bloom-primary)' } : {}}>
              {m.role === 'assistant' && (
                <p className="text-[10px] font-bold mb-1" style={{ color:'var(--bloom-primary)' }}>
                  🌱 AI 진단 어시스턴트
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bloom-card rounded-2xl rounded-bl-sm px-4 py-3">
              <LoadingDots />
            </div>
          </div>
        )}
        {error && (
          <div className="bloom-card p-3 border-l-4 border-red-400 bg-red-50">
            <p className="text-xs text-red-600">⚠ {error}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex gap-2 bloom-card px-3 py-2 items-end">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
          placeholder="농장 상태에 대해 질문하세요..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-bloom-text-primary placeholder-bloom-text-secondary
            resize-none outline-none py-1 leading-relaxed"
          style={{ minHeight:'36px', maxHeight:'100px' }} />
        <button onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold
            disabled:opacity-30 transition-opacity flex-shrink-0"
          style={{ background: 'var(--bloom-primary)' }}>
          ↑
        </button>
      </div>
    </div>
  )
}
