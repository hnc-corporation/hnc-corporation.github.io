// src/hooks/useClaudeChat.js
// Claude API 챗봇 훅
// 추후 Cloudflare Worker proxy로 교체 시 ENDPOINT만 수정

import { useState, useRef } from 'react'

const MODEL = 'claude-sonnet-4-20250514'
// 데모: 직접 호출 (CORS 허용됨)
// 운영: '/api/chat' 같은 proxy endpoint로 교체
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `당신은 시설원예 스마트팜 AI 진단 어시스턴트입니다.
딸기, 토마토, 고추, 파프리카 재배 전문가로서 다음 역할을 합니다:
1. 센서 이상값 원인 분석 및 조치 방법 안내
2. 작물 성장 단계별 환경 관리 조언
3. 기기 제어 전략 제안
4. 병충해 예방 및 수확량 최적화 팁

응답은 간결하게 3-5문장으로 핵심만 전달하세요.
센서값과 작물 정보가 제공되면 그에 맞춘 구체적인 조언을 하세요.`

export function useClaudeChat(apiKey) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const abortRef = useRef(null)

  const sendMessage = async (userText, contextInfo = '') => {
    if (!userText.trim() || !apiKey) {
      setError(apiKey ? '메시지를 입력하세요.' : 'API Key가 설정되지 않았습니다. 설정 화면에서 입력해 주세요.')
      return
    }

    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    // 컨텍스트 주입 (현재 센서값, 작물 정보)
    const fullContent = contextInfo
      ? `[현재 농장 상태]\n${contextInfo}\n\n[질문]\n${userText}`
      : userText

    const apiMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: fullContent }
    ]

    abortRef.current = new AbortController()

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: apiMessages
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API 오류 (${res.status})`)
      }

      const data = await res.json()
      const assistantText = data.content?.map(b => b.text).join('') || ''

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }])
    } catch (e) {
      if (e.name === 'AbortError') return
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => setMessages([])
  const cancel    = () => abortRef.current?.abort()

  return { messages, loading, error, sendMessage, clearChat, cancel }
}
