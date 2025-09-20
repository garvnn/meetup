import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MeetupPin } from '../../components/MeetupPin';
import { BottomSheetCard } from '../../components/BottomSheetCard';
import { FloatingTabBar } from '../../components/FloatingTabBar';
import { SearchBar } from '../../components/SearchBar';
import { LocationRequired } from '../../components/LocationRequired';
import { FindingLocation } from '../../components/FindingLocation';
import { FAB } from '../../components/FAB';
import { DeveloperPanel } from '../../components/DeveloperPanel';
import CreateEvent from '../create-event';
import { getMyMeetups, initializeMockData, joinMeetup, leaveMeetup, Meetup } from '../../lib/data';
import { CONFIG } from '../../lib/config';
import { useTheme } from '../../utils/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY, RADII } from '../../utils/theme';
import { hapticButton } from '../../utils/haptics';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

type LocationState = 'needsLocation' | 'findingLocation' | 'hasLocation';

export default function MapPage() {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Location state machine
  const [locationState, setLocationState] = useState<LocationState>('needsLocation');
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  // Map data
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create event state
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createEventCoords, setCreateEventCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Developer panel state
  const [showDeveloperPanel, setShowDeveloperPanel] = useState(false);
  const [titleTapCount, setTitleTapCount] = useState(0);

  useEffect(() => {
    checkLocationAndInitialize();
  }, []);

  const checkLocationAndInitialize = async () => {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationState('needsLocation');
        return;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationState('needsLocation');
        return;
      }

      // Start finding location
      setLocationState('findingLocation');

      // Get current position with timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: CONFIG.LOCATION.TIMEOUT_MS,
      });

      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;

      // Set region
      setRegion({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });

      // Initialize mock data with user location
      initializeMockData(userLat, userLng);

      // Load meetups
      await loadMeetups();

      // Update state
      setLocationState('hasLocation');

    } catch (error) {
      console.error('Location error:', error);
      setLocationState('needsLocation');
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

  const handleRetryLocation = () => {
    checkLocationAndInitialize();
  };

  const handleTitlePress = () => {
    const newCount = titleTapCount + 1;
    setTitleTapCount(newCount);

    if (newCount >= 3) {
      console.log('Triple tap detected - opening developer panel');
      setShowDeveloperPanel(true);
      setTitleTapCount(0);
      hapticButton();
    } else {
      setTimeout(() => setTitleTapCount(0), 2000);
    }
  };

  const handleTestAPI = async () => {
    hapticButton();
    try {
      const { checkApiHealth } = await import('../../lib/api');
      const result = await checkApiHealth();
      Alert.alert('API Test', `Status: ${result.status}\nMessage: ${result.message}`);
    } catch (error) {
      Alert.alert('API Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePinPress = (meetup: Meetup) => {
    if (locationState !== 'hasLocation') return;
    
    setSelectedMeetup(meetup);
    hapticButton();
  };

  const handleCloseBottomSheet = () => {
    setSelectedMeetup(null);
  };

  const handleJoinMeetup = async (meetupId: string) => {
    Alert.alert('Join Meetup', `Joining meetup ${meetupId}`);
    const success = await joinMeetup(meetupId, 'user-1');
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Joined!', 'You have successfully joined the meetup.');
      await loadMeetups();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Already Joined', 'You are already a member of this meetup.');
    }
  };

  const handleLeaveMeetup = async (meetupId: string) => {
    Alert.alert('Leave Meetup', `Leaving meetup ${meetupId}`);
    const success = await leaveMeetup(meetupId, 'user-1');
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Left!', 'You have successfully left the meetup.');
      await loadMeetups();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Not a Member', 'You are not a member of this meetup.');
    }
  };

  const handleShareMeetup = (meetupId: string) => {
    Alert.alert('Share Meetup', `Sharing link for ${meetupId}`);
  };

  const handleOpenChat = (meetupId: string) => {
    router.push(`/meetup/${meetupId}`);
  };

  const handleCreateMeetup = () => {
    if (locationState !== 'hasLocation' || !region) {
      Alert.alert('Location Required', 'Turn on Location to create a meetup.');
      return;
    }
    
    setCreateEventCoords({
      lat: region.latitude,
      lng: region.longitude
    });
    setShowCreateEvent(true);
  };

  const handleLongPress = (event: any) => {
    if (locationState !== 'hasLocation') return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCreateEventCoords({ lat: latitude, lng: longitude });
    setShowCreateEvent(true);
  };

  const handleCreateEventSuccess = async (meetupId: string, deepLink: string) => {
    // Refresh meetups to show the new one
    await loadMeetups();
    
    // Center map on the new meetup if we have coordinates
    if (createEventCoords) {
      setRegion(prev => prev ? {
        ...prev,
        latitude: createEventCoords.lat,
        longitude: createEventCoords.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      } : null);
    }
    
    // Show success message
    if (deepLink) {
      Alert.alert('Meetup Created!', 'Your meetup has been created and shared successfully.');
    } else {
      Alert.alert('Meetup Created!', 'Your meetup has been created successfully.');
    }
  };

  const handleCloseCreateEvent = () => {
    setShowCreateEvent(false);
    setCreateEventCoords(null);
  };

  const filteredMeetups = meetups.filter(meetup =>
    meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meetup.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show create event screen if needed
  if (showCreateEvent && createEventCoords) {
    return (
      <CreateEvent
        onClose={handleCloseCreateEvent}
        onSuccess={handleCreateEventSuccess}
        onOpenDeveloperPanel={() => {
          setShowDeveloperPanel(true);
        }}
        initialLat={createEventCoords.lat}
        initialLng={createEventCoords.lng}
      />
    );
  }

  // Render based on location state
  if (locationState === 'needsLocation') {
    return <LocationRequired onRetry={handleRetryLocation} />;
  }

  if (locationState === 'findingLocation') {
    return <FindingLocation />;
  }

      if (locationState === 'hasLocation' && region) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeAreaHeader} edges={['top']}>
              <View style={styles.header}>
                <TouchableOpacity 
                  onPress={handleTitlePress} 
                  onLongPress={() => {
                    console.log('Long press detected - opening developer panel');
                    hapticButton();
                    setShowDeveloperPanel(true);
                  }}
                  delayLongPress={500}
                  style={styles.titleContainer}
                >
                  <Text style={[styles.headerTitle, { color: colors.text }]}>Maps</Text>
                </TouchableOpacity>
                <View style={styles.headerButtons}>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('Settings button pressed - opening developer panel');
                      hapticButton();
                      setShowDeveloperPanel(true);
                    }}
                    style={styles.settingsButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="settings" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleTestAPI}
                    style={styles.settingsButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="wifi" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
            
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation
                showsMyLocationButton={false}
                // Remove compass and traffic
                showsCompass={false}
                showsTraffic={false}
                // Disable native callouts
                showsCallout={false}
                // Disable other UI elements we don't want
                showsBuildings={false}
                showsIndoors={false}
                showsPointsOfInterest={false}
                showsScale={false}
                showsIndoorLevelPicker={false}
                // Keep only essential features
                showsUserLocationButton={false}
                showsMapTypeControl={false}
                showsZoomControl={false}
                // Long press to create meetup
                onLongPress={handleLongPress}
              >
                {filteredMeetups.map(meetup => (
                  <Marker
                    key={meetup.id}
                    coordinate={{ latitude: meetup.latitude, longitude: meetup.longitude }}
                    onPress={() => handlePinPress(meetup)}
                    title=""
                    description=""
                    tracksViewChanges={false}
                  >
                    <MeetupPin
                      attendeeCount={meetup.attendeeCount}
                      title={meetup.title}
                      isSelected={selectedMeetup?.id === meetup.id}
                    />
                  </Marker>
                ))}
              </MapView>

              <View style={styles.searchBarContainer}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search meetups..."
                />
              </View>

              <FAB
                onPress={handleCreateMeetup}
                disabled={false} // Only enabled when we have location
              />

              <BottomSheetCard
                meetup={selectedMeetup}
                isVisible={!!selectedMeetup}
                onClose={handleCloseBottomSheet}
                onJoin={handleJoinMeetup}
                onLeave={handleLeaveMeetup}
                onShare={handleShareMeetup}
                onOpenChat={handleOpenChat}
              />
            </View>
            
            {/* Floating Tab Bar */}
            <FloatingTabBar />
          </View>
        );
      }

  // Show developer panel if needed
  if (showDeveloperPanel) {
    return (
      <DeveloperPanel onClose={() => setShowDeveloperPanel(false)} />
    );
  }

  // Fallback (should not reach here)
  return <LocationRequired onRetry={handleRetryLocation} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaHeader: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textTertiary + '20',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  settingsButton: {
    padding: SPACING.md,
    borderRadius: RADII.sm,
    backgroundColor: 'transparent',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
});