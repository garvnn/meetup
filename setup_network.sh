#!/bin/bash

# Setup script to configure the app for network access
# This script automatically detects your IP address and updates the configuration

echo "🌐 Setting up network configuration for PennApps Meetup App"
echo "=========================================================="

# Get the local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not detect local IP address"
    echo "Please manually set EXPO_PUBLIC_API_URL environment variable"
    exit 1
fi

echo "📍 Detected local IP: $LOCAL_IP"
echo "🔧 Updating configuration files..."

# Update test_api.py
sed -i.bak "s|API_BASE = \"http://.*:8000\"|API_BASE = \"http://$LOCAL_IP:8000\"|g" test_api.py

# Create .env file for Expo
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://$LOCAL_IP:8000
EXPO_PUBLIC_NGROK_URL=https://8b5ef7372e1f.ngrok-free.app
EOF

echo "✅ Configuration updated!"
echo ""
echo "📱 To use on other devices:"
echo "1. Make sure all devices are on the same WiFi network"
echo "2. Start the backend: cd python-backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "3. Start the frontend: npx expo start"
echo "4. Other devices can connect to: http://$LOCAL_IP:8000"
echo ""
echo "🔗 Your API is accessible at: http://$LOCAL_IP:8000"
echo "📊 Test it with: python test_api.py"
