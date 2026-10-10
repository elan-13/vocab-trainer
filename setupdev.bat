@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo  SRS Vocabulary Trainer - Development Setup
echo =======================================================

echo [1/6] Verifying prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

echo Prerequisites verified.

echo [2/6] Configuring Python virtual environment...
if not exist "env" (
    echo Creating virtual environment in .\env...
    python -m venv env
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

call .\env\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

echo [3/6] Installing backend dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b 1
)

echo [4/6] Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo [ERROR] Failed to run Alembic database migrations.
    pause
    exit /b 1
)

echo [5/6] Installing frontend dependencies...
pushd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies.
    popd
    pause
    exit /b 1
)
popd

echo [6/6] Installing local srs_sdk in editable mode...
if exist "srs_sdk" (
    pip install -e .\srs_sdk
    if errorlevel 1 (
        echo [WARNING] Could not install srs_sdk in editable mode.
    )
)

echo =======================================================
echo  Setup completed successfully!
echo  Run 'runapplication.bat' to start the application.
echo =======================================================

pause
