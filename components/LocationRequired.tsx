/**
 * Location Required UI - Full screen when location is needed
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { COLORS, SPACING, RADII, TYPOGRAPHY, SHADOWS } from '../utils/theme';

interface LocationRequiredProps {
  onRetry: () => void;
}

export const LocationRequired: React.FC<LocationRequiredProps> = ({ onRetry }) => {
  const handleEnableLocation = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('Error', 'Could not open settings');
    }
  };

  const handleTryAgain = async () => {
    try {
      // Check if services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable Location Services in Settings to use this app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: handleEnableLocation }
          ]
        );
        return;
      }

      // Check permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please grant location permission to see meetups near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: onRetry }
          ]
        );
        return;
      }

      // If we get here, try to get location
      onRetry();
    } catch (error) {
      Alert.alert('Error', 'Could not check location settings');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Location Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={80} color={COLORS.textTertiary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Location Needed</Text>

        {/* Description */}
        <Text style={styles.description}>
          We can't find you. Turn on Location Services for meetups near you.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEnableLocation}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.surface} />
            <Text style={styles.primaryButtonText}>Enable Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleTryAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Location is required to show meetups in your area and create new ones.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.primary,
    fontWeight: '600',
  },
  helpText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
});
