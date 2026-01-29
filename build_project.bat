@echo off
echo ==================================================
echo Building SportZone Microservices
echo ==================================================
echo.

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.15.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

set MAVEN_HOME=C:\maven-mvnd-1.0.3-windows-amd64\mvn
set PATH=%MAVEN_HOME%\bin;%PATH%
set MVN_CMD=mvn

echo [1/6] Building Discovery Server...
cd backend/discovery-server
call %MVN_CMD% clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Discovery Server
    pause
    exit /b %errorlevel%
)
cd ../..

echo [2/6] Building API Gateway...
cd backend/api-gateway
call %MVN_CMD% clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for API Gateway
    pause
    exit /b %errorlevel%
)
cd ../..

echo [3/6] Building User Service...
cd backend/user-service
call %MVN_CMD% clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for User Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [4/6] Building Venue Service...
cd backend/venue-service
call %MVN_CMD% clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Venue Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [5/6] Building Booking Service...
cd backend/booking-service
call %MVN_CMD% clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Build Failed for Booking Service
    pause
    exit /b %errorlevel%
)
cd ../..

echo [6/6] Building Payment Service...
cd backend/payment-service
call %MVN_CMD% clean package -DskipTests
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
