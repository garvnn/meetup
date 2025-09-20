/**
 * Finding Location UI - Loading state while getting location
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/theme';

export const FindingLocation: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Location Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={60} color={COLORS.primary} />
        </View>

        {/* Spinner */}
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />

        {/* Title */}
        <Text style={styles.title}>Finding your location...</Text>

        {/* Description */}
        <Text style={styles.description}>
          Please wait while we locate you to show nearby meetups.
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
    marginBottom: SPACING.lg,
  },
  spinner: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
});
