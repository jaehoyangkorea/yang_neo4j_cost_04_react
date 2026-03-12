"""
Azure Web App 등에서 사용하는 엔트리포인트.
환경변수 PORT(또는 WEBSITES_PORT)를 사용해 uvicorn 실행.
"""
import os

import uvicorn

port = int(os.environ.get("PORT") or os.environ.get("WEBSITES_PORT") or 8000)
uvicorn.run(
    "app.main:app",
    host="0.0.0.0",
    port=port,
)
