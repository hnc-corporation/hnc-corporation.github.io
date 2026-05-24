# 혁신밸리 모니터 웹앱

밀양스마트밸리6 온실 환경 실시간 모니터링 PWA

## GitHub Pages 무료 배포 방법

### 1단계: GitHub 저장소 생성
1. https://github.com 접속 → 로그인
2. 우측 상단 `+` → `New repository`
3. Repository name: `gcs-monitor` (원하는 이름)
4. **Public** 선택
5. `Create repository` 클릭

### 2단계: 파일 업로드
1. 생성된 저장소에서 `Add file` → `Upload files`
2. 아래 파일 모두 업로드:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
3. `Commit changes` 클릭

### 3단계: GitHub Pages 활성화
1. 저장소 상단 `Settings` 탭
2. 왼쪽 메뉴 `Pages`
3. Source: `Deploy from a branch`
4. Branch: `main` / `/ (root)` 선택
5. `Save` 클릭

### 4단계: 접속
- 약 1~2분 후 아래 주소로 접속 가능
- `https://[깃허브아이디].github.io/gcs-monitor/`

---

## 아이폰 홈화면에 추가 (PWA)

1. Safari에서 위 주소 접속
2. 하단 공유 버튼 (□↑) 탭
3. `홈 화면에 추가` 선택
4. `추가` 탭
→ 앱처럼 전체화면으로 실행됩니다!

---

## 주의사항

API 서버(api.gcsmagma.com)가 **CORS 허용** 설정이 되어있어야 합니다.
만약 CORS 오류가 발생하면 API 서버 담당자에게
`Access-Control-Allow-Origin: *` 헤더 추가를 요청하세요.
