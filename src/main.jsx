// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { FarmProvider } from './hooks/useFarmStore'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FarmProvider>
      <App />
    </FarmProvider>
  </React.StrictMode>
)

// PWA Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa가 자동 생성하는 SW 등록
    import('./registerSW.js').catch(() => {})
  })
}
