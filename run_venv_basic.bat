@echo off
REM Keep System Active (Basic) - Virtual Environment Version

REM Check if virtual environment exists
if not exist venv (
    echo Virtual environment not found!
    echo.
    echo Please run setup_venv.bat first to create the virtual environment.
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the app
echo Keep System Active - Basic Version (Virtual Environment)
echo ======================================================
echo.
python keep_active.py

REM If app closes, deactivate venv
call venv\Scripts\deactivate.bat
pause
