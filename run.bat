@echo off
REM Keep System Active - Teams Status Manager

echo Keep System Active - Basic Version
echo ==================================
echo.

echo Installing dependencies...
pip install -r requirements.txt -q

echo.
echo Starting Keep System Active (Basic)...
echo.
python keep_active.py

pause
