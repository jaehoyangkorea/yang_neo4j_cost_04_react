# Azure Web App 배포 가이드

이 문서는 **반도체 원가 증감 차이분석 시스템**을 Azure Web App에 올리는 방법을 설명합니다.

## 배포 방식 요약

- **단일 Web App**: FastAPI 백엔드가 API와 React 빌드(정적 파일)를 함께 서빙합니다.
- 배포 단위: `backend/` 폴더(프론트 빌드 결과물 `backend/static/` 포함).

---

## 1. 사전 준비

- Azure 구독
- **PostgreSQL**: Azure Database for PostgreSQL 또는 외부 PostgreSQL (연결 문자열 준비)
- **Neo4j**: Neo4j Aura 등 (URI, 사용자/비밀번호 준비)
- (선택) LLM: Azure OpenAI 등 설정

---

## 2. 로컬에서 배포용 빌드

프론트엔드를 빌드하고 결과물을 `backend/static/`에 넣습니다.

**Windows (PowerShell):**
```powershell
.\scripts\build-for-azure.ps1
```

**Linux / macOS:**
```bash
chmod +x scripts/build-for-azure.sh
./scripts/build-for-azure.sh
```

또는 수동:
```bash
cd frontend && npm ci && npm run build
# frontend/dist/ 내용을 backend/static/ 로 통째로 복사
```

이후 `backend/` 아래에 `static/`(index.html, assets/ 등)이 있어야 합니다.

---

## 3. Azure Web App 생성

### 3.1 리소스 생성

1. [Azure Portal](https://portal.azure.com) → **Web App** 생성
2. **Runtime**: Python 3.11 또는 3.12
3. **Operating System**: Linux 권장
4. **Region**: 사용할 리전 선택
5. **Pricing**: Basic B1 이상 권장(DB/Neo4j 외부 연결 시)

### 3.2 설정

**구성(Configuration) → 애플리케이션 설정**에서 다음을 추가/수정:

| 이름 | 값 | 비고 |
|------|-----|------|
| `PORT` | `8000` | Azure가 주입할 수 있으면 생략 가능 |
| `POSTGRES_HOST` | 호스트명 | Azure PostgreSQL 등 |
| `POSTGRES_PORT` | `5432` | |
| `POSTGRES_USER` | DB 사용자 | |
| `POSTGRES_PASSWORD` | DB 비밀번호 | |
| `POSTGRES_DB` | `semicon_cost` | DB 이름 |
| `NEO4J_URI` | Neo4j 연결 URI | |
| `NEO4J_USERNAME` | Neo4j 사용자 | |
| `NEO4J_PASSWORD` | Neo4j 비밀번호 | |
| (선택) `LLM_PROVIDER` | `azure_openai` 등 | |
| (선택) Azure OpenAI 키/엔드포인트 등 | | .env.example 참고 |

**일반 설정**:

- **시작 명령어(Startup Command)**  
  - **방법 A**: `python run_azure.py`  
    - `PORT`/`WEBSITES_PORT`를 읽어서 해당 포트로 서버 실행
  - **방법 B**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`  
    - Azure에서 포트를 8000으로 고정한 경우

---

## 4. 배포 방법

### 4.1 ZIP 배포 (수동)

1. 위 2번대로 `backend/static/`까지 포함해 **backend 폴더 전체**를 ZIP으로 압축  
   - 루트에 `app/`, `static/`, `requirements.txt`, `run_azure.py` 등이 들어가야 함.
2. Web App **고급 도구(Kudu)** 또는 **배포 센터**에서 ZIP 배포 실행  
   - 또는 Azure CLI:  
     `az webapp deploy --resource-group <RG> --name <APP_NAME> --src-path backend.zip --type zip`

### 4.2 GitHub Actions (CI/CD)

1. Web App에서 **배포 센터** → GitHub 연결, 저장소/브랜치 선택
2. 워크플로에서 **빌드 단계**에 다음을 포함:
   - Node: 프론트 빌드 후 `backend/static/` 생성
   - Python: `pip install -r backend/requirements.txt` (배포 루트를 `backend`로 두는 경우)
3. **배포 단계**는 Azure가 제공하는 GitHub Actions 템플릿 그대로 사용 가능  
   - 배포 경로가 `backend`인지 확인

### 4.3 Azure CLI 예시 (배포만)

```bash
# 빌드 후 backend 폴더를 ZIP
cd backend
zip -r ../backend.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc"

# Web App에 ZIP 배포
az webapp deploy --resource-group <리소스그룹> --name <Web App 이름> --src-path ../backend.zip --type zip
```

---

## 5. 배포 후 확인

- `https://<your-app>.azurewebsites.net/`  
  - React 앱(SPA)이 뜨고, 같은 호스트의 `/api/...`로 API 호출이 되면 성공
- `https://<your-app>.azurewebsites.net/api/health`  
  - `{"status":"healthy", ...}` 형태로 응답 확인

---

## 6. 문제 해결

| 현상 | 확인 사항 |
|------|-----------|
| 500 / 앱이 안 뜸 | 구성 → 애플리케이션 설정에 DB/Neo4j/LLM 변수 누락 여부, 로그(Log stream) 확인 |
| 정적 파일 404 | `backend/static/`에 `index.html`, `assets/`가 포함되어 배포되었는지 확인 |
| API 404 | 시작 명령어가 `app.main:app`을 가리키는지, 포트가 8000(또는 PORT)인지 확인 |
| DB 연결 실패 | 방화벽에서 Azure 서비스 허용, SSL 모드(필요 시) 및 연결 문자열 확인 |

---

## 7. 요약 체크리스트

- [ ] 로컬에서 `scripts/build-for-azure.ps1`(또는 .sh) 실행 → `backend/static/` 생성
- [ ] Azure Web App 생성 (Python 3.11/3.12, Linux)
- [ ] 애플리케이션 설정에 PostgreSQL, Neo4j, (선택) LLM 변수 설정
- [ ] 시작 명령어: `python run_azure.py` 또는 `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [ ] `backend/` 전체(static 포함)를 ZIP 또는 GitHub로 배포
- [ ] `https://<app>.azurewebsites.net/` 및 `/api/health` 접속 확인
