# Network Setup Guide

This guide explains how to make the PennApps Meetup API work on any computer and allow other devices to connect.

## Quick Setup (Automated)

Run the setup script to automatically configure everything:

```bash
./setup_network.sh
```

This script will:
- Detect your computer's IP address
- Update all configuration files
- Create environment variables
- Provide instructions for other devices

## Manual Setup

### 1. Find Your Computer's IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```cmd
ipconfig | findstr "IPv4"
```

### 2. Update Configuration Files

**Update `test_api.py`:**
```python
API_BASE = "http://YOUR_IP_ADDRESS:8000"
```

**Update `lib/config.ts`:**
```typescript
API: {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_IP_ADDRESS:8000',
  // ... rest of config
}
```

**Create `.env` file:**
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8000
EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### 3. Start the Backend Server

Make sure to bind to all interfaces (0.0.0.0):

```bash
cd python-backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the Frontend

```bash
npx expo start
```

## For Other Developers

### Option 1: Use Your Computer's IP (Same Network)

1. **Get the host computer's IP address**
2. **Update the configuration** using the setup script or manually
3. **Make sure all devices are on the same WiFi network**
4. **Connect using the IP address** (e.g., `http://192.168.1.100:8000`)

### Option 2: Use ngrok (Internet Access)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 8000
   ```

3. **Update configuration with ngrok URL:**
   ```bash
   export EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
   ```

### Option 3: Deploy to Cloud (Production)

For production use, deploy to services like:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**

## Testing the Setup

### Test from the same computer:
```bash
python test_api.py
```

### Test from another device:
1. Open a web browser on another device
2. Go to `http://YOUR_IP_ADDRESS:8000/health`
3. You should see: `{"status": "healthy", ...}`

### Test the mobile app:
1. Start the Expo development server
2. Scan the QR code with Expo Go
3. The app should connect to your API

## Troubleshooting

### "Connection refused" errors:
- Make sure the backend is running with `--host 0.0.0.0`
- Check that the IP address is correct
- Ensure devices are on the same network

### "Module not found" errors:
- Make sure you're in the correct virtual environment
- Install dependencies: `pip install -r requirements.txt`

### Mobile app can't connect:
- Check that the IP address in the config matches your computer's IP
- Try using ngrok for internet access
- Make sure the Expo app has network permissions

## Security Notes

- **Local network only**: Using IP addresses only works on the same WiFi network
- **ngrok**: Provides internet access but exposes your API publicly
- **Production**: Use proper authentication and HTTPS in production

## Environment Variables

The app uses these environment variables:

- `EXPO_PUBLIC_API_URL`: Your computer's IP address (e.g., `http://192.168.1.100:8000`)
- `EXPO_PUBLIC_NGROK_URL`: ngrok URL for internet access
- `EXPO_PUBLIC_APP_URL`: Your app's public URL for deep linking

## Example IP Addresses

- **Local development**: `http://localhost:8000` (same computer only)
- **Local network**: `http://192.168.1.100:8000` (same WiFi network)
- **Internet access**: `https://abc123.ngrok-free.app` (via ngrok)
- **Production**: `https://your-app.herokuapp.com` (deployed)
