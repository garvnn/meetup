# 🎯 PennApps ngrok Setup Guide

This guide helps you set up ngrok for your PennApps meetup app development environment.

## 🚀 Quick Start

### Option 1: One-Command Setup
```bash
npm run dev
```
This will start the backend, ngrok tunnel, and Expo development server all at once.

### Option 2: Manual Setup
```bash
# 1. Start backend
npm run backend

# 2. Start ngrok tunnel
npm run ngrok:start

# 3. Start Expo (in another terminal)
npm run expo
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start everything (backend + ngrok + expo) |
| `npm run backend` | Start Python backend server |
| `npm run backend:simple` | Start simplified backend (faster) |
| `npm run expo` | Start Expo development server |
| `npm run ngrok:start` | Start ngrok tunnel |
| `npm run ngrok:stop` | Stop ngrok tunnel |
| `npm run ngrok:status` | Check ngrok status |
| `npm run ngrok:restart` | Restart ngrok tunnel |
| `npm run test:api` | Test API endpoints |

## 🔧 Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 8000 | Python FastAPI server |
| Expo Dev Server | 8083 | React Native development server |
| ngrok Tunnel | Dynamic | Public tunnel to backend |

## 📱 Mobile Testing

1. **Install Expo Go** on your iPhone/Android
2. **Connect to same WiFi** as your computer
3. **Scan QR code** from terminal
4. **Test deep links**: `pennapps://join/demo123abc`

## 🌐 ngrok Configuration

### Automatic Setup
The `setup_ngrok.js` script automatically:
- Starts ngrok tunnel for port 8000
- Updates `config.ts` with the ngrok URL
- Updates `connection_info.txt` with current URLs

### Manual ngrok Commands
```bash
# Start tunnel
ngrok http 8000

# Check status
ngrok api tunnels list

# Stop all tunnels
pkill -f ngrok
```

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Restart backend
npm run backend:simple
```

### ngrok Issues
```bash
# Check ngrok status
npm run ngrok:status

# Restart ngrok
npm run ngrok:restart

# Check ngrok auth
ngrok config check
```

### Expo Issues
```bash
# Clear Expo cache
npx expo start --clear

# Check Expo status
npx expo doctor
```

### Port Conflicts
```bash
# Kill processes on specific ports
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:8083 | xargs kill -9  # Expo
```

## 📊 Development Workflow

1. **Start Development Environment**
   ```bash
   npm run dev
   ```

2. **Test API Endpoints**
   ```bash
   npm run test:api
   ```

3. **Check Connection Info**
   ```bash
   cat connection_info.txt
   ```

4. **Monitor Logs**
   - Backend logs: Terminal where you ran `npm run backend`
   - Expo logs: Terminal where you ran `npm run expo`
   - ngrok logs: `ngrok api tunnels list`

## 🔐 Environment Variables

The app uses these environment variables (set automatically by scripts):

- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_NGROK_URL`: ngrok tunnel URL
- `EXPO_PUBLIC_DEV_MODE`: Development mode flag

## 📱 Testing Deep Links

Test these deep links on your mobile device:
- `pennapps://join/demo123abc` - Join meetup
- `pennapps://share/demo123abc` - Share meetup

## 🎉 Success Indicators

✅ **Backend Running**: `curl http://localhost:8000/health` returns 200  
✅ **ngrok Active**: `npm run ngrok:status` shows active tunnel  
✅ **Expo Running**: QR code appears in terminal  
✅ **Mobile Connected**: App loads on phone via Expo Go  

## 🆘 Getting Help

1. Check `connection_info.txt` for current URLs
2. Run `npm run ngrok:status` to check tunnel status
3. Check backend logs for API errors
4. Use Developer Panel in app (tap title 5 times)

## 🔄 Reset Everything

```bash
# Stop all services
npm run ngrok:stop
pkill -f "uvicorn.*8000"
pkill -f "expo.*8083"

# Clear caches
npx expo start --clear

# Restart everything
npm run dev
```
