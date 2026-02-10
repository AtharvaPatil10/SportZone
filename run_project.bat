@echo off
echo ==================================================
echo Starting SportZone Application
echo ==================================================
pause

echo [1/7] Starting Discovery Server...
start "Discovery Server" cmd /k java -jar backend/discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar
timeout /t 2

echo [2/7] Starting API Gateway...
start "API Gateway" cmd /k java -jar backend/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
timeout /t 2

echo [3/7] Starting User Service...
start "User Service" cmd /k java -jar backend/user-service/target/user-service-0.0.1-SNAPSHOT.jar

echo [4/7] Starting Venue Service...
start "Venue Service" cmd /k java -jar backend/venue-service/target/venue-service-0.0.1-SNAPSHOT.jar

echo [5/7] Starting Booking Service...
start "Booking Service" cmd /k java -jar backend/booking-service/target/booking-service-0.0.1-SNAPSHOT.jar

echo [6/7] Starting Payment Service...
start "Payment Service" cmd /k java -jar backend/payment-service/target/payment-service-0.0.1-SNAPSHOT.jar

echo [7/7] Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo ==================================================
echo All Services Started!
echo ==================================================
pause
