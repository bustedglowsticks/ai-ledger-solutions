@echo off
echo 🚀 QUANTUM BOT COMMAND CENTER - SETUP SCRIPT
echo ============================================

echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install express mongoose nodemailer jsonwebtoken xrpl cors bcrypt dotenv nodemon jest
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend
call npm install react react-dom react-scripts tailwindcss d3 gsap axios react-router-dom jwt-decode recharts autoprefixer postcss
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed successfully!
echo.
echo 🎯 Next Steps:
echo 1. Start MongoDB (if not running)
echo 2. Run: cd backend && npm start
echo 3. Run: cd frontend && npm start
echo 4. Access dashboard at http://localhost:3000
echo.
echo 📧 Master Admin Credentials:
echo Email: master@quantumbot.com
echo Password: QuantumMaster2024!
echo.
pause
