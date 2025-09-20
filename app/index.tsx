import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function MapScreen() {
  const [meetups, setMeetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = null; // Simplified for now

  useEffect(() => {
    loadMeetups();
  }, [user]);

  const loadMeetups = async () => {
    // Simplified for now - just simulate loading
    setTimeout(() => {
      setLoading(false);
      setMeetups([]);
    }, 1000);
  };

  const handleMeetupPress = (meetup: any) => {
    // Navigate to meetup detail
    // This would use router.push in a real implementation
    Alert.alert('Meetup Selected', `Opening ${meetup.title}`);
  };

  const handleCreateMeetup = () => {
    // Navigate to create meetup
    // This would use router.push in a real implementation
    Alert.alert('Create Meetup', 'Opening create meetup screen');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your meetups...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMeetups}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to PennApps Meetups</Text>
        <Text style={styles.subtitle}>Sign in to view your private meetups</Text>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Simplified for now

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Meetups</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateMeetup}>
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {meetups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No meetups yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first private meetup or ask someone to share an invite link with you.
            </Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateMeetup}>
              <Text style={styles.createFirstButtonText}>Create Your First Meetup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.meetupsList}>
            {meetups.map((meetup) => (
              <TouchableOpacity
                key={meetup.id}
                style={styles.meetupCard}
                onPress={() => handleMeetupPress(meetup)}
              >
                <View style={styles.meetupHeader}>
                  <Text style={styles.meetupTitle}>{meetup.title}</Text>
                  <View style={styles.attendeeBubble}>
                    <Text style={styles.attendeeCount}>{meetup.attendee_count || 0}</Text>
                  </View>
                </View>
                
                {meetup.desc && (
                  <Text style={styles.meetupDescription} numberOfLines={2}>
                    {meetup.desc}
                  </Text>
                )}
                
                <View style={styles.meetupMeta}>
                  <Text style={styles.meetupStatus}>Active</Text>
                  <Text style={styles.meetupAttendees}>{meetup.attendee_count || 0} attendees</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#FF3B30',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  meetupsList: {
    padding: 20,
  },
  meetupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  attendeeBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  attendeeCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  meetupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  meetupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetupStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  meetupAttendees: {
    fontSize: 12,
    color: '#666',
  },
  hostBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hostBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
