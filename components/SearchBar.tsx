/**
 * iOS-style search bar with blur/glass effect
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { SearchIcon, CloseIcon } from './TabIcons';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search meetups...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          <SearchIcon size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textTertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <CloseIcon size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  blurContainer: {
    borderRadius: RADII.full,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
  },
});
