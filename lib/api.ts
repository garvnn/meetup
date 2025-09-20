/**
 * Centralized API configuration and networking layer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default API configuration - will be overridden by environment or QR code
const DEFAULT_API_URL = 'http://localhost:8000';
const STORAGE_KEY = 'api_base_url';

// API health status
export type ApiHealthStatus = 'online' | 'offline' | 'checking';

// API configuration interface
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  isHttps: boolean;
  isLocalhost: boolean;
}

// Get the current API base URL
export const getApiBaseUrl = async (): Promise<string> => {
  // Force use environment variable for now to bypass cache issues
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    console.log('🌐 Using environment API URL:', envUrl);
    return envUrl;
  }
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('🌐 Using stored API URL:', stored);
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read stored API URL:', error);
  }
  
  console.log('🌐 Using default API URL:', DEFAULT_API_URL);
  return DEFAULT_API_URL;
};

// Set the API base URL
export const setApiBaseUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, url);
  } catch (error) {
    console.error('Failed to store API URL:', error);
    throw error;
  }
};

// Get API configuration
export const getApiConfig = async (): Promise<ApiConfig> => {
  const baseUrl = await getApiBaseUrl();
  const isHttps = baseUrl.startsWith('https://');
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  
  return {
    baseUrl,
    timeout: 10000, // 10 seconds
    isHttps,
    isLocalhost,
  };
};

// Check if the current API URL is valid for the platform
export const validateApiUrl = async (): Promise<{ valid: boolean; reason?: string }> => {
  const config = await getApiConfig();
  
  // Check HTTPS requirement for physical iOS devices
  if (Platform && Platform.OS === 'ios' && !config.isHttps && !config.isLocalhost) {
    return {
      valid: false,
      reason: 'Physical iOS devices require HTTPS. Use ngrok or Cloudflare Tunnel for HTTPS access.'
    };
  }
  
  // Check Android emulator localhost
  if (Platform && Platform.OS === 'android' && config.baseUrl.includes('localhost')) {
    return {
      valid: false,
      reason: 'Android emulator should use 10.0.2.2 instead of localhost for local development.'
    };
  }
  
  return { valid: true };
};

// Make API request with error handling
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const config = await getApiConfig();
  const url = `${config.baseUrl}${endpoint}`;
  
  // Debug logging
  console.log('🌐 API Request:', {
    url,
    endpoint,
    baseUrl: config.baseUrl,
    method: options.method || 'GET'
  });
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    console.log('✅ API Response:', {
      url,
      status: response.status,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        url,
        status: response.status,
        error: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Request Failed:', {
      url,
      error: error instanceof Error ? error.message : String(error)
    });
    
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error(`Network request failed. Check your internet connection and API URL. Tried: ${url}`);
    }
    throw error;
  }
};

// Health check
export const checkApiHealth = async (): Promise<{ status: 'online' | 'offline'; message: string }> => {
  try {
    const response = await apiRequest<{ status: string }>('/health');
    return {
      status: 'online',
      message: 'API is reachable and healthy'
    };
  } catch (error) {
    return {
      status: 'offline',
      message: error instanceof Error ? error.message : 'API is unreachable'
    };
  }
};

// Create meetup API call
export const createMeetup = async (data: any) => {
  return apiRequest('/create_meetup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Accept invite API call
export const acceptInvite = async (data: any) => {
  return apiRequest('/accept_invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Soft ban API call
export const softBan = async (data: any) => {
  return apiRequest('/soft_ban', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Send message API call
export const sendMessage = async (data: any) => {
  return apiRequest('/send_message', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Get messages API call
export const getMessages = async (data: any) => {
  return apiRequest('/get_messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
