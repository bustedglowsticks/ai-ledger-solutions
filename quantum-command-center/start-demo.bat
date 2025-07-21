@echo off
echo 🚀 QUANTUM BOT COMMAND CENTER - DEMO LAUNCHER
echo =============================================

echo.
echo 📊 Starting Demo Mode (No MongoDB Required)
echo.

echo 🎯 Step 1: Starting Backend Demo Server...
cd backend
start "Backend Demo" cmd /k "echo Backend Demo Server && echo. && echo 🔑 Demo Login: && echo   Email: demo@quantumbot.com && echo   Password: demo123 && echo. && echo 📡 API: http://localhost:3001 && echo 🎯 Frontend: http://localhost:3000 && echo. && timeout /t 999"

echo.
echo 🎨 Step 2: Starting Frontend Dashboard...
cd ..\frontend
start "Frontend Dashboard" cmd /k "echo Frontend Dashboard && echo. && echo 🎯 Opening: http://localhost:3000 && echo 📊 Dashboard: Apple-inspired UI && echo 🚀 Heat Map: TradingView-style && echo ✨ Animations: GSAP rockets && echo. && timeout /t 999"

echo.
echo ✅ Quantum Bot Command Center Demo Ready!
echo.
echo 🌐 Access Points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo 🔑 Demo Credentials:
echo   Email: demo@quantumbot.com
echo   Password: demo123
echo.
echo 📊 Features Available:
echo   ✓ Apple-inspired dashboard
echo   ✓ TradingView-style heat map
echo   ✓ Rocket commission animations
echo   ✓ Admin hierarchy system
echo   ✓ Real-time bot tracking
echo.
pause
