/**
 * Create Event UI - Full-screen create meetup flow
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Share,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createMeetup, CreateMeetupRequest } from '../lib/data';
import { checkApiHealth, validateApiUrl } from '../lib/api';
import { NetworkError } from '../components/NetworkError';
import { useTheme } from '../utils/ThemeContext';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { hapticButton, hapticSuccess, hapticError } from '../utils/haptics';

interface CreateEventProps {
  onClose: () => void;
  onSuccess: (meetupId: string, deepLink: string) => void;
  onOpenDeveloperPanel?: () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function CreateEvent({ onClose, onSuccess, onOpenDeveloperPanel, initialLat, initialLng }: CreateEventProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [isCreating, setIsCreating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [apiHealth, setApiHealth] = useState<'online' | 'offline' | 'checking'>('checking');
  const [showNetworkError, setShowNetworkError] = useState(false);
  
  // Date picker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  
  // Location states
  const [locationName, setLocationName] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    // Check if we have location
    if (initialLat && initialLng) {
      setHasLocation(true);
      // Set default times (1 hour from now, 2 hours duration)
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      setStartDate(start);
      setEndDate(end);
      setSelectedDuration('2h');
      
      // Get location name from coordinates
      getLocationName(initialLat, initialLng);
    } else {
      setHasLocation(false);
    }

    // Check API health
    checkApiHealthStatus();
  }, [initialLat, initialLng]);

  const checkApiHealthStatus = async () => {
    setApiHealth('checking');
    try {
      const result = await checkApiHealth();
      setApiHealth(result.status);
      if (result.status === 'offline') {
        setShowNetworkError(true);
      }
    } catch (error) {
      setApiHealth('offline');
      setShowNetworkError(true);
    }
  };

  const getLocationName = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        // Create a readable location name
        const parts = [];
        
        if (location.name) parts.push(location.name);
        if (location.street) parts.push(location.street);
        if (location.city) parts.push(location.city);
        if (location.region) parts.push(location.region);
        if (location.country) parts.push(location.country);
        
        const locationString = parts.length > 0 
          ? parts.join(', ') 
          : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        setLocationName(locationString);
      } else {
        // Fallback to coordinates if reverse geocoding fails
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to coordinates
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Utility functions for time handling
  const snapToFiveMinutes = (date: Date): Date => {
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / 5) * 5;
    const newDate = new Date(date);
    newDate.setMinutes(snappedMinutes, 0, 0);
    return newDate;
  };

  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDurationInMinutes = (duration: string): number => {
    switch (duration) {
      case '30m': return 30;
      case '1h': return 60;
      case '2h': return 120;
      case '3h': return 180;
      case '6h': return 360;
      case '12h': return 720;
      case '24h': return 1440;
      default: return 120; // Default to 2 hours
    }
  };

  const setDuration = (duration: string) => {
    setSelectedDuration(duration);
    if (duration !== 'custom') {
      const minutes = getDurationInMinutes(duration);
      const newEndDate = new Date(startDate.getTime() + minutes * 60 * 1000);
      setEndDate(snapToFiveMinutes(newEndDate));
    }
  };

  const validateDuration = (start: Date, end: Date, visibility: 'private' | 'public'): boolean => {
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    if (visibility === 'public' && durationHours > 6) {
      return false;
    }
    if (visibility === 'private' && durationHours > 24) {
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!hasLocation) {
      Alert.alert('Location Required', 'Location is required to create a meetup.');
      return;
    }

    if (apiHealth !== 'online') {
      Alert.alert('API Offline', 'Cannot create meetup while API is offline. Check your connection and try again.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a meetup title.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Times', 'End time must be after start time.');
      return;
    }

    if (!validateDuration(startDate, endDate, visibility)) {
      const maxHours = visibility === 'public' ? 6 : 24;
      Alert.alert('Duration Too Long', `${visibility} events cannot exceed ${maxHours} hours.`);
      return;
    }

    if (startDate < new Date()) {
      Alert.alert('Invalid Time', 'Start time cannot be in the past.');
      return;
    }

    setIsCreating(true);

    try {
      const request: CreateMeetupRequest = {
        title: title.trim(),
        desc: description.trim() || undefined,
        start_ts: startDate.toISOString(),
        end_ts: endDate.toISOString(),
        lat: initialLat!,
        lng: initialLng!,
        visibility,
        token_ttl_hours: undefined, // Use default (until meetup ends)
      };

      const result = await createMeetup(request);
      
      hapticSuccess();
      
      Alert.alert(
        'Meetup Created!',
        'Your meetup has been created successfully.',
        [
          {
            text: 'Create & Share',
            onPress: () => handleCreateAndShare(result.deep_link, result.meetup_id)
          },
          {
            text: 'Create Only',
            onPress: () => handleCreateOnly(result.meetup_id)
          }
        ]
      );

    } catch (error) {
      console.error('Error creating meetup:', error);
      hapticError();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create meetup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAndShare = async (deepLink: string, meetupId: string) => {
    try {
      await Share.share({
        message: `Join my meetup: ${title}\n\n${deepLink}`,
        url: deepLink,
        title: `Join ${title}`,
      });
      
      onSuccess(meetupId, deepLink);
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      // Still call success callback even if sharing fails
      onSuccess(meetupId, deepLink);
      onClose();
    }
  };

  const handleCreateOnly = (meetupId: string) => {
    onSuccess(meetupId, '');
    onClose();
  };

  // Date picker handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const snappedDate = snapToFiveMinutes(selectedDate);
      setStartDate(snappedDate);
      
      // Update end date if duration is set
      if (selectedDuration && selectedDuration !== 'custom') {
        const minutes = getDurationInMinutes(selectedDuration);
        const newEndDate = new Date(snappedDate.getTime() + minutes * 60 * 1000);
        setEndDate(snapToFiveMinutes(newEndDate));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(snapToFiveMinutes(selectedDate));
      setSelectedDuration('custom');
    }
  };


  // Show network error if API is offline
  if (showNetworkError) {
    return (
      <NetworkError
        onRetry={checkApiHealthStatus}
        onOpenDeveloperPanel={onOpenDeveloperPanel}
      />
    );
  }

  if (!hasLocation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            hapticButton();
            onClose();
          }} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Meetup</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Location Required</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            Location is required to create a meetup. Please enable location services and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform && Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            hapticButton();
            onClose();
          }} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Meetup</Text>
          <TouchableOpacity 
            onPress={() => {
              hapticButton();
              handleCreate();
            }} 
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            disabled={isCreating}
          >
            <Text style={[styles.createButtonText, isCreating && styles.createButtonTextDisabled]}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, backgroundColor: colors.surface }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter meetup title"
              placeholderTextColor={colors.textTertiary}
              maxLength={200}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { color: colors.text, backgroundColor: colors.surface }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your meetup (optional)"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
          </View>

          {/* Start Time */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Start Time *</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                hapticButton();
                setShowStartPicker(true);
              }}
            >
              <Text style={styles.timeButtonText}>
                {formatTimeForDisplay(startDate)}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Duration */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Duration *</Text>
            <View style={styles.durationChips}>
              {['30m', '1h', '2h', '3h', '6h', '12h', '24h'].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationChip,
                    selectedDuration === duration && styles.durationChipSelected
                  ]}
                  onPress={() => {
                    hapticButton();
                    setDuration(duration);
                  }}
                >
                  <Text style={[
                    styles.durationChipText,
                    selectedDuration === duration && styles.durationChipTextSelected
                  ]}>
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.durationChip,
                  selectedDuration === 'custom' && styles.durationChipSelected
                ]}
                onPress={() => {
                  hapticButton();
                  setSelectedDuration('custom');
                }}
              >
                <Text style={[
                  styles.durationChipText,
                  selectedDuration === 'custom' && styles.durationChipTextSelected
                ]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* End Time */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>End Time *</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                hapticButton();
                setShowEndPicker(true);
              }}
            >
              <Text style={styles.timeButtonText}>
                {formatTimeForDisplay(endDate)}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>

          {/* Visibility */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Visibility</Text>
            <View style={styles.visibilityContainer}>
              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'private' && styles.visibilityButtonActive
                ]}
                onPress={() => {
                  hapticButton();
                  setVisibility('private');
                }}
              >
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={visibility === 'private' ? colors.surface : colors.textSecondary} 
                />
                <Text style={[
                  styles.visibilityButtonText,
                  visibility === 'private' && styles.visibilityButtonTextActive
                ]}>
                  Private
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'public' && styles.visibilityButtonActive
                ]}
                onPress={() => {
                  hapticButton();
                  setVisibility('public');
                }}
              >
                <Ionicons 
                  name="globe" 
                  size={20} 
                  color={visibility === 'public' ? colors.surface : colors.textSecondary} 
                />
                <Text style={[
                  styles.visibilityButtonText,
                  visibility === 'public' && styles.visibilityButtonTextActive
                ]}>
                  Public
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Info */}
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            {isLoadingLocation ? (
              <Text style={styles.locationText}>
                Loading location...
              </Text>
            ) : (
              <Text style={styles.locationText}>
                {locationName || `${initialLat?.toFixed(4)}, ${initialLng?.toFixed(4)}`}
              </Text>
            )}
          </View>

          {/* Public Meetup Info */}
          {visibility === 'public' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Public meetups are visible to everyone and have a maximum duration of 6 hours.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
  closeButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
  },
  placeholder: {
    width: 60, // Same width as create button for centering
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  createButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  inputGroup: {
    marginTop: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
  },
  timeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  durationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  durationChip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
  },
  durationChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationChipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  durationChipTextSelected: {
    color: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  visibilityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  visibilityButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  visibilityButtonTextActive: {
    color: COLORS.surface,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  locationText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
