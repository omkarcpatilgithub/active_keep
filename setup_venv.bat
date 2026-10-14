@echo off
REM Virtual Environment Setup Script

echo.
echo ========================================
echo Keep System Active - Virtual Environment Setup
echo ========================================
echo.

REM Check if venv already exists
if exist venv (
    echo Virtual environment already exists!
    echo Running in existing environment...
    goto :install_deps
)

echo Creating virtual environment...
python -m venv venv

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in your PATH
    pause
    exit /b 1
)

echo Virtual environment created successfully!

:install_deps
echo.
echo Installing dependencies...
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo To run the app:
echo   - Double-click: run_venv_advanced.bat
echo   - Or manually: venv\Scripts\activate then python keep_active_advanced.py
echo.
pause
