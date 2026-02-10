@echo off
echo ==================================================
echo Building SportZone Microservices
echo ==================================================
echo.

echo [1/6] Building Discovery Server...
cd backend/discovery-server
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Discovery Server
    pause
    exit /b %errorlevel%
)
cd ../..

echo [2/6] Building API Gateway...
cd backend/api-gateway
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for API Gateway
    pause
    exit /b %errorlevel%
)
cd ../..

echo [3/6] Building User Service...
cd backend/user-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for User Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [4/6] Building Venue Service...
cd backend/venue-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Venue Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [5/6] Building Booking Service...
cd backend/booking-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Booking Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [6/6] Building Payment Service...
cd backend/payment-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Payment Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo.
echo ==================================================
echo All Services Built Successfully!
echo ==================================================
pause
