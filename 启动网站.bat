@echo off
chcp 65001 >nul
cd /d "%~dp0"
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Server already running on port 3000.
) else (
    start "" /min cmd /c "python -m http.server 3000"
    echo [OK] Starting server on port 3000...
)
ping -n 3 127.0.0.1 >nul
start "" "http://127.0.0.1:3000/index.html"
echo [OK] Opened http://127.0.0.1:3000/index.html
echo.
echo Close the minimized server window to stop the server.
ping -n 4 127.0.0.1 >nul
exit
