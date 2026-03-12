# Azure Web App 배포용 빌드: 프론트엔드 빌드 후 backend/static 에 복사
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "Building frontend..."
Set-Location (Join-Path $root "frontend")
npm ci
npm run build

$dist = Join-Path $root "frontend\dist"
$static = Join-Path $root "backend\static"
if (Test-Path $static) { Remove-Item $static -Recurse -Force }
New-Item -ItemType Directory -Path $static -Force | Out-Null
Copy-Item (Join-Path $dist "*") $static -Recurse -Force
Write-Host "Copied frontend build to backend/static"
Write-Host "Done. Deploy the backend folder to Azure Web App."
