$WorkspaceRoot = $PSScriptRoot
if (-not $WorkspaceRoot) { $WorkspaceRoot = (Get-Location).Path }

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Starting SRS Vocabulary Trainer Application" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$PythonExe = Join-Path $WorkspaceRoot "env\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Virtual environment python '$PythonExe' not found." -ForegroundColor Red
    exit 1
}

$FrontendDir = Join-Path $WorkspaceRoot "frontend"
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "[ERROR] Frontend dependencies not found." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Backend server on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $WorkspaceRoot -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting SRS Backend on http://localhost:8000...' -ForegroundColor Green; & '$PythonExe' main.py"

Write-Host "Starting Frontend server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $FrontendDir -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting SRS Frontend on http://localhost:3000...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Application is running!" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host " - Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host " - Interactive Swagger Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
