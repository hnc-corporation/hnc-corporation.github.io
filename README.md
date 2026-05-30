# 스마트팜 PWA

시설원예 스마트팜 IoT 모니터링 데모 앱  
React + Vite + Tailwind CSS + Claude API

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

```bash
# 1. vite.config.js 에서 GITHUB_PAGES_BASE 를 본인 repo 이름으로 수정
# 예: const GITHUB_PAGES_BASE = '/smartfarm-pwa/'

# 2. package.json homepage 필드 추가 (선택)

# 3. 배포
npm run build
npm run deploy
```

## Capacitor 안드로이드 빌드 (추후)

```bash
npm install @capacitor/core @capacitor/android
npx cap init
npx cap add android
npm run build && npx cap copy
npx cap open android
```

## 폴더 구조

```
src/
├── components/    # 공통 UI 컴포넌트
├── data/          # 센서 데이터·시뮬레이션·상수
├── hooks/         # 전역 상태(useFarmStore), Claude API(useClaudeChat)
├── pages/         # 화면별 컴포넌트
│   ├── Dashboard.jsx    # 대시보드
│   ├── SensorDetail.jsx # 센서 상세 그래프
│   ├── Control.jsx      # 제어판
│   ├── AiDiagnosis.jsx  # AI 진단 챗봇
│   └── Settings.jsx     # 설정
├── styles/
│   └── index.css
├── utils/
│   └── storage.js       # localStorage 추상화
├── App.jsx
└── main.jsx
```

## 환경변수 (선택)

`.env` 파일 생성:
```
VITE_ANTHROPIC_KEY=sk-ant-...
```

`src/pages/Settings.jsx` 에서 초기값으로 사용 가능:
```js
const [localApiKey, setLocalApiKey] = useState(
  import.meta.env.VITE_ANTHROPIC_KEY || apiKey
)
```
