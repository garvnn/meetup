/**
 * List Tab - iOS table-style meetup list
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { getMyMeetups, initializeMockData, joinMeetup, leaveMeetup, Meetup } from '../lib/data';
import { CONFIG } from '../lib/config';
import { BottomSheetCard } from '../components/BottomSheetCard';
import { useRouter } from 'expo-router';
import { openGoogleCalendar } from '../utils/calendar';
import { hapticButton } from '../utils/haptics';
import { Alert } from 'react-native';

export default function ListPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  // Refresh data when tab becomes active
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading) {
        loadMeetups();
      }
    }, [isLoading])
  );

  const initializeData = async () => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        console.log('Location services not enabled');
        setIsLoading(false);
        return;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        setIsLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: CONFIG.LOCATION.TIMEOUT_MS,
      });

      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;

      // Initialize mock data with user location
      initializeMockData(userLat, userLng);

      // Load meetups
      await loadMeetups();

    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeetups = async () => {
    try {
      const userId = 'user-1'; // Mock user
      const fetchedMeetups = await getMyMeetups(userId);
      setMeetups(fetchedMeetups);
    } catch (err) {
      console.error('Failed to load meetups:', err);
    }
  };

  // Event selection handlers
  const handleEventPress = (meetup: Meetup) => {
    hapticButton();
    setSelectedMeetup(meetup);
  };

  const handleCloseBottomSheet = () => {
    setSelectedMeetup(null);
  };

  const handleJoinMeetup = async (meetupId: string) => {
    try {
      const success = await joinMeetup(meetupId, 'user-1');
      if (success) {
        await loadMeetups(); // Refresh the list
        setSelectedMeetup(null); // Close the bottom sheet
        Alert.alert('Success', 'You have joined the meetup!');
      } else {
        Alert.alert('Error', 'Failed to join the meetup. You may already be a member.');
      }
    } catch (error) {
      console.error('Failed to join meetup:', error);
      Alert.alert('Error', 'Failed to join the meetup. Please try again.');
    }
  };

  const handleLeaveMeetup = async (meetupId: string) => {
    try {
      const success = await leaveMeetup(meetupId, 'user-1');
      if (success) {
        await loadMeetups(); // Refresh the list
        setSelectedMeetup(null); // Close the bottom sheet
        Alert.alert('Success', 'You have left the meetup.');
      } else {
        Alert.alert('Error', 'Failed to leave the meetup. You may not be a member.');
      }
    } catch (error) {
      console.error('Failed to leave meetup:', error);
      Alert.alert('Error', 'Failed to leave the meetup. Please try again.');
    }
  };

  const handleShareMeetup = (meetupId: string) => {
    // For now, just show an alert. In a real app, this would generate a shareable link
    Alert.alert('Share Meetup', `Share link for meetup ${meetupId} would be generated here.`);
  };

  const handleOpenChat = (meetupId: string) => {
    router.push('/messages');
  };

  const handleAddToCalendar = async (meetup: Meetup) => {
    try {
      hapticButton();
      await openGoogleCalendar(meetup);
      Alert.alert('Calendar', 'Opening your calendar app to add this event.');
    } catch (error) {
      console.error('List: Failed to open calendar:', error);
      
      // Show a helpful message with the URL as fallback
      const { generateGoogleCalendarUrl } = await import('../utils/calendar');
      const calendarUrl = generateGoogleCalendarUrl(meetup);
      
      Alert.alert(
        'Calendar Not Available', 
        `Could not open calendar app automatically. This might be because you're using Expo Go which has limited URL support.\n\nYou can manually add this event by copying this URL and opening it in your browser:\n\n${calendarUrl}`,
        [
          { text: 'Copy URL', onPress: () => {
            // Try to copy to clipboard if available
            try {
              const { Clipboard } = require('react-native');
              Clipboard.setString(calendarUrl);
              Alert.alert('Copied!', 'Calendar URL copied to clipboard. Paste it in your browser to add the event.');
            } catch (clipboardError) {
              console.log('Clipboard not available:', clipboardError);
            }
          }},
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const filteredMeetups = meetups.filter(meetup =>
    meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (meetup.description && meetup.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading events...</Text>
        </View>
        <FloatingTabBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search events..."
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredMeetups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No events found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Create an event to get started'}
            </Text>
          </View>
        ) : (
          filteredMeetups.map((meetup) => (
          <TouchableOpacity 
            key={meetup.id} 
            style={[styles.meetupItem, { backgroundColor: colors.surface }]}
            onPress={() => handleEventPress(meetup)}
            activeOpacity={0.7}
          >
            <View style={styles.meetupContent}>
              <View style={styles.meetupHeader}>
                <Text style={[styles.meetupTitle, { color: colors.text }]}>{meetup.title}</Text>
                {meetup.isJoined && (
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedText}>Joined</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.meetupDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {meetup.description || 'No description available'}
              </Text>
              
              {meetup.locationName && (
                <Text style={[styles.meetupLocation, { color: colors.textSecondary }]}>
                  <Ionicons name="location" size={14} color={colors.textTertiary} /> {meetup.locationName}
                </Text>
              )}
              
              <View style={styles.meetupFooter}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time" size={16} color={colors.textTertiary} />
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                    {meetup.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {meetup.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                
                <View style={styles.attendeeContainer}>
                  <Ionicons name="people" size={16} color={colors.textTertiary} />
                  <Text style={[styles.attendeeText, { color: colors.textSecondary }]}>{meetup.attendeeCount} attending</Text>
                </View>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      {/* Bottom Sheet Card for Event Details */}
      <BottomSheetCard
        meetup={selectedMeetup}
        isVisible={!!selectedMeetup}
        onClose={handleCloseBottomSheet}
        onJoin={handleJoinMeetup}
        onLeave={handleLeaveMeetup}
        onShare={handleShareMeetup}
        onOpenChat={handleOpenChat}
        onAddToCalendar={handleAddToCalendar}
      />
      
      {/* Floating Tab Bar */}
      <FloatingTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically using colors.background
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textTertiary + '20',
  },
  headerTitle: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor will be set dynamically using colors.surface
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  meetupLocation: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor will be set dynamically using colors.surface
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  meetupContent: {
    flex: 1,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  meetupTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    flex: 1,
  },
  joinedBadge: {
    backgroundColor: COLORS.success,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  joinedText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.surface,
    fontWeight: '600',
  },
  meetupDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  meetupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
  attendeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  attendeeText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
});
