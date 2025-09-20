#!/bin/bash
# Start both backend and frontend with ngrok

echo "🎯 Starting PennApps Full Development Environment"
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    pkill -f "uvicorn.*8000"
    pkill -f "expo.*8083"
    pkill -f ngrok
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if backend is already running
if ! lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🚀 Starting backend server..."
    ./start_backend.sh --simple &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 5
    
    # Test backend health
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Backend is healthy"
    else
        echo "❌ Backend failed to start properly"
        exit 1
    fi
else
    echo "✅ Backend already running on port 8000"
fi

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
node setup_ngrok.js start
sleep 3

# Start Expo
echo "📱 Starting Expo development server..."
./start_expo.sh 8083 &
EXPO_PID=$!

echo ""
echo "🎉 All services started!"
echo "📱 Scan the QR code with Expo Go app"
echo "🌐 Backend: http://localhost:8000"
echo "📚 API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
