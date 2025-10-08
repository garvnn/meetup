/**
 * Floating Action Button for creating meetups
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, SHADOWS } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface FABProps {
  onPress: () => void;
  disabled?: boolean;
}

export const FAB: React.FC<FABProps> = ({ onPress, disabled = false }) => {
  const { colors } = useTheme();
  
  const handlePress = () => {
    if (disabled) {
      Alert.alert(
        'Location Required',
        'Turn on Location to create a meetup.',
        [{ text: 'OK' }]
      );
      return;
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        disabled && styles.fabDisabled,
        SHADOWS.lg,
        { backgroundColor: disabled ? colors.textTertiary : colors.primary }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons 
        name="add" 
        size={24} 
        color={disabled ? colors.textTertiary : colors.surface} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 130, // Moved down to reduce gap with tab bar
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    // backgroundColor will be set dynamically using colors.primary
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fabDisabled: {
    // backgroundColor will be set dynamically using colors.textTertiary
  },
});
