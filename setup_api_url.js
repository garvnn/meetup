#!/usr/bin/env node
/**
 * Setup script to configure the API URL for your PennApps app
 * Run this after starting your backend server
 */

const { execSync } = require('child_process');
const os = require('os');

// Get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const apiUrl = `http://${localIP}:8000`;

console.log('🚀 PennApps API Setup');
console.log('==================');
console.log(`📱 Your computer's IP: ${localIP}`);
console.log(`🌐 API URL: ${apiUrl}`);
console.log('');
console.log('📋 To configure your app:');
console.log('');
console.log('1. Set environment variable:');
console.log(`   export EXPO_PUBLIC_API_URL="${apiUrl}"`);
console.log('');
console.log('2. Or add to your .env file:');
console.log(`   EXPO_PUBLIC_API_URL=${apiUrl}`);
console.log('');
console.log('3. Restart Expo:');
console.log('   npx expo start --clear');
console.log('');
console.log('4. Test the connection:');
console.log(`   curl ${apiUrl}/health`);
console.log('');
console.log('✅ Your backend should be running on this URL!');
