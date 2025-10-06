/**
 * Network Error UI - Shows when API is unreachable
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, TYPOGRAPHY, SHADOWS } from '../utils/theme';

interface NetworkErrorProps {
  onRetry: () => void;
  onOpenDeveloperPanel?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  onOpenDeveloperPanel 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline-outline" size={80} color={COLORS.error} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Can't reach the server</Text>

        {/* Description */}
        <Text style={styles.description}>
          Check your internet connection and API URL. The server might be down or unreachable.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={COLORS.surface} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          {onOpenDeveloperPanel && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onOpenDeveloperPanel}
              activeOpacity={0.8}
            >
              <Ionicons name="settings" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Developer Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          If the problem persists, check your API URL in the Developer Panel or contact your team lead.
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
