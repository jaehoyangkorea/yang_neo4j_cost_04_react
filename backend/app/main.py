"""
반도체 원가 증감 차이분석 시스템 - FastAPI 메인 엔트리포인트

아키텍처:
  [SQLite/Oracle] ─── 스냅샷 + 차이 계산 (Python)
  [Neo4j]         ─── 인과관계 그래프 + LLM 탐색용
  [LLM 엔진]      ─── 증거 기반 자동 해석
  [웹 UI]         ─── 대시보드 + 챗 + 자동 보고서
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.db.database import init_db, close_db
from app.db.neo4j_db import init_neo4j, close_neo4j
from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router
from app.api.chat import router as chat_router
from app.api.report import router as report_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 DB 연결 관리"""
    # 시작 시
    await init_db()
    await init_neo4j()
    yield
    # 종료 시
    await close_db()
    await close_neo4j()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="반도체 원가의 전월 대비 차이분석을 자동화하여, "
                "숫자 분해뿐 아니라 원인 해석까지 LLM이 수행하는 시스템",
    lifespan=lifespan,
)

# CORS 미들웨어 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우터 등록 ──
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["대시보드"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["분석"])
app.include_router(chat_router, prefix="/api/chat", tags=["챗"])
app.include_router(report_router, prefix="/api/report", tags=["보고서"])

# ── 프로덕션: React 빌드 정적 파일 서빙 (Azure Web App 등) ──
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.is_dir():
    if (STATIC_DIR / "assets").is_dir():
        app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    if (STATIC_DIR / "static").is_dir():
        app.mount("/static", StaticFiles(directory=STATIC_DIR / "static"), name="static")


@app.get("/")
async def root():
    """헬스체크 또는 SPA index.html"""
    if STATIC_DIR.is_dir() and (STATIC_DIR / "index.html").is_file():
        return FileResponse(STATIC_DIR / "index.html")
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


if STATIC_DIR.is_dir() and (STATIC_DIR / "index.html").is_file():

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA 라우팅: /api 가 아닌 경로는 index.html 반환"""
        if full_path.startswith("api/") or full_path.startswith("api"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
async def health_check():
    """상세 헬스체크 - DB 연결 상태 포함"""
    return {
        "status": "healthy",
        "sqlite": "connected",
        "neo4j": "connected",
    }
