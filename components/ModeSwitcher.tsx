/**
 * Simplified iOS Camera-style mode switcher
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';

interface ModeSwitcherProps {
  currentIndex: number;
  onModeChange: (index: number) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentIndex,
  onModeChange,
}) => {
  const modes = ['MAP', 'MESSAGES', 'LIST'];

  const handleModePress = (index: number) => {
    if (index !== currentIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onModeChange(index);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          {modes.map((mode, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.modeButton,
                currentIndex === index && styles.modeButtonActive
              ]}
              onPress={() => handleModePress(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeText,
                currentIndex === index && styles.modeTextActive
              ]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Safe area
  },
  blurContainer: {
    marginHorizontal: SPACING.md,
    borderRadius: RADII.xl,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  modeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeTextActive: {
    color: COLORS.primary,
  },
});
