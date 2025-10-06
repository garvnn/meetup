import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { supabase } from './supabase';
import { CONFIG } from './config';
import { TokenCache } from './tokenCache';

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  handle?: string;
}

export class AuthService {
  private static clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

  static getClerkPublishableKey(): string {
    return this.clerkPublishableKey;
  }

  static async signUp(email: string, phone?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically be handled by Clerk's sign-up flow
      // For now, we'll return success as Clerk handles the actual sign-up
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }

  static async signIn(email: string, phone?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically be handled by Clerk's sign-in flow
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clerk handles sign out through useAuth hook
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // This would be called from a component using useUser hook
      // For now, return null as the actual user comes from Clerk context
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async ensureUserInDatabase(clerkUser: any): Promise<string> {
    try {
      // Check if user exists in our database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        return existingUser.id;
      }

      // Create user in our database
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkUser.id,
          handle: clerkUser.username || `user_${clerkUser.id.slice(-8)}`,
          photo_url: clerkUser.imageUrl,
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return newUser.id;
    } catch (error) {
      console.error('Error ensuring user in database:', error);
      throw error;
    }
  }

  static async verifyOTP(email?: string, phone?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clerk handles OTP verification through their components
      // This is a placeholder for any additional verification logic
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'OTP verification failed' };
    }
  }

  static async cacheAuthToken(token: string): Promise<void> {
    try {
      await TokenCache.setAuthToken(token);
    } catch (error) {
      console.error('Error caching auth token:', error);
    }
  }

  static async getCachedAuthToken(): Promise<string | null> {
    try {
      return await TokenCache.getAuthToken();
    } catch (error) {
      console.error('Error getting cached auth token:', error);
      return null;
    }
  }

  static async clearAuthCache(): Promise<void> {
    try {
      await TokenCache.clearAuthToken();
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  }

  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Clerk handles auth state changes through their context
    // This is a placeholder for any additional auth state logic
    return () => {}; // No-op unsubscribe function
  }
}

// Hook for getting current user from Clerk context
export function useAuthUser(): AuthUser | null {
  const { user } = useUser();
  
  if (!user) return null;

  return {
    id: user.id,
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    phone: user.primaryPhoneNumber?.phoneNumber || undefined,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    imageUrl: user.imageUrl || undefined,
    handle: user.username || undefined,
  };
}

// Hook for auth actions
export function useAuthActions() {
  const { signOut } = useAuth();

  return {
    signOut: async () => {
      await signOut();
      await AuthService.clearAuthCache();
    },
  };
}
