@echo off
REM Keep System Active (Advanced) - Teams Status Manager

echo Keep System Active - Advanced Version
echo =====================================
echo.

echo Installing dependencies...
pip install -r requirements.txt -q

echo.
echo Starting Keep System Active (Advanced)...
echo.
python keep_active_advanced.py

pause
