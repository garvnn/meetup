#!/usr/bin/env node
/**
 * Setup script for ngrok configuration
 * This script helps manage ngrok tunnels and updates environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backendPort: 8000,
  expoPort: 8083,
  configFile: path.join(__dirname, 'lib', 'config.ts'),
  connectionInfoFile: path.join(__dirname, 'connection_info.txt')
};

/**
 * Get the current ngrok tunnel URL
 */
function getNgrokUrl() {
  try {
    // Try to get URL from ngrok web interface
    const output = execSync('curl -s http://localhost:4040/api/tunnels', { encoding: 'utf8' });
    const data = JSON.parse(output);
    
    // Find the tunnel for our backend port
    const tunnel = data.tunnels.find(t => 
      t.config.addr === `http://localhost:${CONFIG.backendPort}` && 
      t.state === 'started'
    );
    
    return tunnel ? tunnel.public_url : null;
  } catch (error) {
    console.log('No active ngrok tunnels found or ngrok web interface not available');
    return null;
  }
}

/**
 * Start ngrok tunnel for the backend
 */
function startNgrokTunnel() {
  console.log(`🚀 Starting ngrok tunnel for backend on port ${CONFIG.backendPort}...`);
  
  try {
    // Kill any existing tunnels on the same port
    execSync(`pkill -f "ngrok.*${CONFIG.backendPort}"`, { stdio: 'ignore' });
    
    // Start new tunnel in background with web interface
    execSync(`ngrok http ${CONFIG.backendPort} --log=stdout > /dev/null 2>&1 &`, { stdio: 'inherit' });
    
    // Wait a moment for tunnel to start
    setTimeout(() => {
      const url = getNgrokUrl();
      if (url) {
        console.log(`✅ ngrok tunnel started: ${url}`);
        console.log(`🌐 ngrok web interface: http://localhost:4040`);
        updateConfig(url);
        updateConnectionInfo(url);
      } else {
        console.log('❌ Failed to get ngrok URL - check if backend is running');
        console.log('💡 Try: npm run backend');
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error starting ngrok tunnel:', error.message);
  }
}

/**
 * Update the config.ts file with the ngrok URL
 */
function updateConfig(ngrokUrl) {
  try {
    let configContent = fs.readFileSync(CONFIG.configFile, 'utf8');
    
    // Update the API base URL
    configContent = configContent.replace(
      /BASE_URL: process\.env\.EXPO_PUBLIC_API_URL \|\| 'http:\/\/localhost:8000'/,
      `BASE_URL: process.env.EXPO_PUBLIC_API_URL || '${ngrokUrl}'`
    );
    
    fs.writeFileSync(CONFIG.configFile, configContent);
    console.log(`✅ Updated config.ts with ngrok URL: ${ngrokUrl}`);
  } catch (error) {
    console.error('❌ Error updating config:', error.message);
  }
}

/**
 * Update connection info file
 */
function updateConnectionInfo(ngrokUrl) {
  const connectionInfo = `🎯 CONNECTION INFO FOR YOUR PENNAPPS APP

📱 Your iPhone Connection:
- Open Expo Go app on your iPhone
- Scan the QR code from your terminal
- OR manually enter: exp://10.251.118.211:${CONFIG.expoPort}

🔧 Backend Configuration:
- Backend URL: ${ngrokUrl}
- Local Backend: http://localhost:${CONFIG.backendPort}
- Status: ✅ Running and healthy

📋 Steps to Connect:
1. Make sure your iPhone and computer are on the same WiFi
2. Run: npx expo start --port ${CONFIG.expoPort}
3. Look for the QR code in your terminal
4. Scan with iPhone camera or Expo Go app
5. App will load with backend already configured

🧪 Test Commands:
- Test backend: curl ${ngrokUrl}/health
- Test local: curl http://localhost:${CONFIG.backendPort}/health

🔍 Troubleshooting:
- If QR code doesn't show, try: npx expo start --clear
- If connection fails, check WiFi network
- If app loads but backend fails, tap app title 5 times to open Developer Panel
`;

  fs.writeFileSync(CONFIG.connectionInfoFile, connectionInfo);
  console.log(`✅ Updated connection info file`);
}

/**
 * Stop ngrok tunnels
 */
function stopNgrokTunnels() {
  console.log('🛑 Stopping ngrok tunnels...');
  try {
    execSync('pkill -f ngrok', { stdio: 'ignore' });
    console.log('✅ Stopped all ngrok tunnels');
  } catch (error) {
    console.log('ℹ️  No ngrok tunnels to stop');
  }
}

/**
 * Show current status
 */
function showStatus() {
  console.log('📊 Current Status:');
  console.log(`- Backend Port: ${CONFIG.backendPort}`);
  console.log(`- Expo Port: ${CONFIG.expoPort}`);
  
  const ngrokUrl = getNgrokUrl();
  if (ngrokUrl) {
    console.log(`- ngrok URL: ${ngrokUrl}`);
    console.log(`- Status: ✅ Active`);
  } else {
    console.log(`- ngrok URL: Not running`);
    console.log(`- Status: ❌ Inactive`);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'start':
    startNgrokTunnel();
    break;
  case 'stop':
    stopNgrokTunnels();
    break;
  case 'status':
    showStatus();
    break;
  case 'restart':
    stopNgrokTunnels();
    setTimeout(startNgrokTunnel, 1000);
    break;
  default:
    console.log(`
🎯 PennApps ngrok Setup Script

Usage: node setup_ngrok.js <command>

Commands:
  start    - Start ngrok tunnel for backend
  stop     - Stop all ngrok tunnels
  restart  - Restart ngrok tunnel
  status   - Show current status

Examples:
  node setup_ngrok.js start
  node setup_ngrok.js status
  node setup_ngrok.js restart
`);
}
