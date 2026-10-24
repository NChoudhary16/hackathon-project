@echo off
echo ========================================================
echo   StockFlow iPDS - Launching Backend & Frontend
echo ========================================================
echo.
echo Starting Express Backend API on port 5000...
start "StockFlow Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Next.js Frontend on port 3000...
start "StockFlow Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Services are running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:5000/api/health
echo ========================================================
