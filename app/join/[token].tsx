import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthUser } from '../../lib/auth';
import { SupabaseService } from '../../lib/supabase';
import { Formatters } from '../../utils/formatters';
import { CONFIG } from '../../lib/config';

export default function JoinScreen() {
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const user = useAuthUser();

  useEffect(() => {
    if (token && typeof token === 'string') {
      loadInviteInfo(token);
    }
  }, [token]);

  const loadInviteInfo = async (inviteToken: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get invite token info from backend
      const response = await fetch(`${CONFIG.API.BASE_URL}/accept_invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: inviteToken,
          user_id: user?.id || 'demo-user', // Fallback for demo
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInviteInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid or expired invite link');
      }
    } catch (err) {
      console.error('Error loading invite info:', err);
      setError('Failed to load invite information. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeetup = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to join this meetup.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => {
            // This would trigger Clerk sign-in in a real implementation
            Alert.alert('Sign In', 'Clerk sign-in would be triggered here');
          }}
        ]
      );
      return;
    }

    if (!token || typeof token !== 'string') {
      setError('Invalid invite token');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Accept the invite
      const response = await fetch(`${CONFIG.API.BASE_URL}/accept_invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          user_id: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        Alert.alert(
          'Success!',
          'You have successfully joined the meetup!',
          [
            {
              text: 'View Meetup',
              onPress: () => {
                // Navigate to meetup detail
                router.push(`/meetup/${data.meetup_id}`);
              }
            }
          ]
        );
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to join meetup');
      }
    } catch (err) {
      console.error('Error joining meetup:', err);
      setError('Failed to join meetup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading invite...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Join</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            The invite link may be expired, revoked, or invalid. Please ask the host for a fresh link.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadInviteInfo(token as string)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join Meetup</Text>
        <Text style={styles.subtitle}>
          You've been invited to join a private meetup!
        </Text>

        {inviteInfo && (
          <View style={styles.inviteInfo}>
            <Text style={styles.inviteTitle}>Meetup Details</Text>
            <Text style={styles.inviteText}>
              Meetup ID: {Formatters.formatToken(inviteInfo.meetup_id)}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {user ? (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinMeetup}
              disabled={loading}
            >
              <Text style={styles.joinButtonText}>
                {loading ? 'Joining...' : 'Join Meetup'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => {
                Alert.alert('Sign In', 'Clerk sign-in would be triggered here');
              }}
            >
              <Text style={styles.signInButtonText}>Sign In to Join</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleGoHome}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>About Private Meetups</Text>
          <Text style={styles.infoText}>
            • Only people with invite links can join{'\n'}
            • You'll be able to chat and share files{'\n'}
            • The meetup will appear on your home screen{'\n'}
            • You can leave anytime
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  inviteInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inviteText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    marginBottom: 40,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  homeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
