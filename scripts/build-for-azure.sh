#!/usr/bin/env bash
# Azure Web App 배포용 빌드: 프론트엔드 빌드 후 backend/static 에 복사
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"
npm ci
npm run build
STATIC="$ROOT/backend/static"
rm -rf "$STATIC"
mkdir -p "$STATIC"
cp -r dist/* "$STATIC/"
echo "Copied frontend build to backend/static"
echo "Done. Deploy the backend folder to Azure Web App."
