import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_CACHE_KEY = 'meetup_tokens';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_PREFERENCES_KEY = 'user_preferences';

export interface CachedToken {
  token: string;
  meetupId: string;
  title: string;
  lastAccessed: string;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export class TokenCache {
  // Auth token management with SecureStore
  static async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw error;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  // Meetup token management with AsyncStorage (less sensitive)
  static async getTokens(): Promise<CachedToken[]> {
    try {
      const cached = await AsyncStorage.getItem(TOKEN_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached tokens:', error);
      return [];
    }
  }

  static async addToken(token: CachedToken): Promise<void> {
    try {
      const tokens = await this.getTokens();
      const existingIndex = tokens.findIndex(t => t.token === token.token);
      
      if (existingIndex >= 0) {
        tokens[existingIndex] = token;
      } else {
        tokens.push(token);
      }
      
      await AsyncStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error adding token to cache:', error);
    }
  }

  static async removeToken(token: string): Promise<void> {
    try {
      const tokens = await this.getTokens();
      const filteredTokens = tokens.filter(t => t.token !== token);
      await AsyncStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(filteredTokens));
    } catch (error) {
      console.error('Error removing token from cache:', error);
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing token cache:', error);
    }
  }

  // User preferences management
  static async getUserPreferences(): Promise<UserPreferences> {
    try {
      const cached = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      return cached ? JSON.parse(cached) : {
        notificationsEnabled: true,
        locationSharingEnabled: true,
        theme: 'system' as const,
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        notificationsEnabled: true,
        locationSharingEnabled: true,
        theme: 'system' as const,
      };
    }
  }

  static async setUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const current = await this.getUserPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error setting user preferences:', error);
    }
  }

  // General cache management
  static async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        this.clearAuthToken(),
        this.clearTokens(),
        AsyncStorage.removeItem(USER_PREFERENCES_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Cache size management
  static async getCacheSize(): Promise<{ tokens: number; preferences: number }> {
    try {
      const tokens = await this.getTokens();
      const preferences = await this.getUserPreferences();
      
      return {
        tokens: tokens.length,
        preferences: JSON.stringify(preferences).length,
      };
    } catch (error) {
      console.error('Error getting cache size:', error);
      return { tokens: 0, preferences: 0 };
    }
  }

  // Cleanup expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const tokens = await this.getTokens();
      const now = new Date();
      const validTokens = tokens.filter(token => {
        // Keep tokens that were accessed within the last 30 days
        const lastAccessed = new Date(token.lastAccessed);
        const daysSinceAccess = (now.getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceAccess < 30;
      });

      if (validTokens.length !== tokens.length) {
        await AsyncStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(validTokens));
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}
