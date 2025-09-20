#!/bin/bash
# Start the Python backend server

echo "🚀 Starting PennApps Backend Server..."

# Navigate to backend directory
cd python-backend

# Activate virtual environment
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Please run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Stopping existing process..."
    pkill -f "uvicorn.*8000"
    sleep 2
fi

# Start the server
echo "🌐 Starting server on http://localhost:8000"
echo "📚 API docs available at: http://localhost:8000/docs"
echo ""

# Use simple_main.py for faster startup during development
if [ "$1" = "--simple" ]; then
    echo "🔧 Using simple backend (faster startup)"
    uvicorn simple_main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "🔧 Using full backend"
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
fi
