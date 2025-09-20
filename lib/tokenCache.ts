import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_CACHE_KEY = 'meetup_tokens';

export interface CachedToken {
  token: string;
  meetupId: string;
  title: string;
  lastAccessed: string;
}

export class TokenCache {
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

  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing token cache:', error);
    }
  }
}
