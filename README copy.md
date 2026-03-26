# 반도체 원가 증감 차이분석 시스템 (데모)

반도체 제조 원가의 월별 증감을 시각적으로 분석하는 프론트엔드 데모 애플리케이션입니다.

## 주요 기능

- **대시보드** — 원가요소별/공정별/제품별 증감 현황 및 차트
- **인과 그래프** — 원가 변동 원인의 계층적 네트워크 시각화
- **분석 실행** — 차이 계산 → 그래프 구축 → 인과관계 → 해석 시뮬레이션
- **AI 채팅** — 원가 관련 질의응답 (로컬 지식 기반)
- **보고서** — 경영진/원가팀/생산팀/구매팀별 맞춤 보고서
- **다국어** — 한국어/영어 전환 지원

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19, TypeScript |
| 빌드 도구 | Vite 6 |
| 스타일링 | Tailwind CSS 4 |
| 차트 | Recharts |
| 그래프 | react-force-graph-2d |
| 라우팅 | React Router 7 |
| 상태 관리 | TanStack Query |
| 애니메이션 | Motion (Framer Motion) |
| 국제화 | i18next |

## 로컬 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

## 빌드

```bash
cd frontend
npm run build
```

빌드 결과물은 `frontend/dist/` 에 생성됩니다.

## Azure Web App 배포

### 사전 준비

1. Azure Portal에서 Web App 생성 (런타임: Node 20 LTS)
2. Web App의 **게시 프로필(Publish Profile)** 다운로드

### GitHub 연동 배포

1. GitHub 저장소 Settings → Secrets and variables → Actions 에서:
   - `AZURE_WEBAPP_PUBLISH_PROFILE` (Secret) — 게시 프로필 XML 전체 내용 붙여넣기
   - `AZURE_WEBAPP_NAME` (Variable) — Azure Web App 이름

2. `main` 브랜치에 push하면 자동으로 빌드 및 배포됩니다.

### 수동 배포 (ZIP Deploy)

```bash
# 빌드
cd frontend && npm ci && npm run build && cd ..

# 배포 패키지 생성
mkdir deploy
cp server.js deploy/
cp package.json deploy/
cp -r frontend/dist deploy/frontend/dist
cd deploy && zip -r ../deploy.zip . && cd ..

# Azure CLI로 배포
az webapp deploy --resource-group <리소스그룹> --name <앱이름> --src-path deploy.zip --type zip
```

### Azure 설정

Web App 구성에서 다음을 설정합니다:
- **시작 명령**: `node server.js`
- **WEBSITES_PORT**: `8080` (또는 원하는 포트)

## 프로젝트 구조

```
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # 페이지 컴포넌트
│   │   ├── services/      # API 및 Mock 데이터
│   │   ├── i18n/          # 다국어 리소스
│   │   └── styles/        # 스타일시트
│   ├── package.json
│   └── vite.config.ts
├── server.js              # 프로덕션 정적 파일 서버
├── package.json           # 루트 빌드 스크립트
└── .github/workflows/     # CI/CD 파이프라인
```
