#!/bin/bash
# Quick start script for PennApps development

echo "🎯 PennApps Quick Start"
echo "======================"

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is already running"
else
    echo "🚀 Starting backend..."
    ./start_backend.sh --simple &
    sleep 5
fi

# Check if ngrok is running
if curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo "✅ ngrok is already running"
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data['tunnels'] else '')")
    echo "🌐 ngrok URL: $NGROK_URL"
else
    echo "🚀 Starting ngrok..."
    ngrok http 8000 > /dev/null 2>&1 &
    sleep 3
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data['tunnels'] else '')")
    echo "🌐 ngrok URL: $NGROK_URL"
fi

echo ""
echo "📱 Next steps:"
echo "1. Run: npx expo start --port 8084"
echo "2. Scan QR code with Expo Go app"
echo "3. Test deep link: pennapps://join/demo123abc"
echo ""
echo "🧪 Test commands:"
echo "- Backend: curl http://localhost:8000/health"
echo "- ngrok: curl $NGROK_URL/health"
echo ""
echo "🌐 URLs:"
echo "- Backend: http://localhost:8000"
echo "- ngrok: $NGROK_URL"
echo "- ngrok web: http://localhost:4040"
