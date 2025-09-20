#!/bin/bash
# Start the Expo development server

echo "📱 Starting PennApps Expo Development Server..."

# Check if port 8083 is already in use
if lsof -Pi :8083 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8083 is already in use. Stopping existing process..."
    pkill -f "expo.*8083"
    sleep 2
fi

# Set default port
PORT=${1:-8083}

echo "🌐 Starting Expo server on port $PORT"
echo "📱 Scan the QR code with Expo Go app on your phone"
echo ""

# Start Expo with specified port
npx expo start --port $PORT
