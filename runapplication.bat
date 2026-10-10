@echo off
setlocal

echo =======================================================
echo  Starting SRS Vocabulary Trainer Application
echo =======================================================

if not exist "env\Scripts\activate.bat" (
    echo [ERROR] Virtual environment 'env' not found. Please run 'setupdev.bat' first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found. Please run 'setupdev.bat' first.
    pause
    exit /b 1
)

echo Starting Backend server on http://localhost:8000...
start "SRS Backend (FastAPI)" cmd /k "call .\env\Scripts\activate.bat && python main.py"
if errorlevel 1 (
    echo [ERROR] Failed to start backend process.
    pause
    exit /b 1
)

echo Starting Frontend server on http://localhost:3000...
start "SRS Frontend (Vite React)" cmd /k "cd frontend && npm run dev"
if errorlevel 1 (
    echo [ERROR] Failed to start frontend process.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo  Application is running!
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://localhost:8000
echo  - Interactive Swagger Docs: http://localhost:8000/docs
echo =======================================================
