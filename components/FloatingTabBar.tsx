/**
 * Custom floating tab bar with individual buttons
 * Replaces the default tab bar with floating buttons
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, RADII, TYPOGRAPHY, SHADOWS } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface TabItem {
  name: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'list', href: '/list', icon: 'list-outline', activeIcon: 'list', label: 'Events' },
  { name: 'map', href: '/map', icon: 'map-outline', activeIcon: 'map', label: 'Map' },
  { name: 'messages', href: '/messages', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages' },
  { name: 'past-events', href: '/past-events', icon: 'time-outline', activeIcon: 'time', label: 'Past' },
];

export const FloatingTabBar: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (href: string) => {
    router.push(href);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => handleTabPress(tab.href)}
            activeOpacity={0.9}
          >
            <BlurView 
              intensity={80} 
              tint={colors.background === '#1C1C1E' ? 'dark' : 'light'}
              style={[styles.buttonBlur, isActive && styles.activeButtonBlur, { backgroundColor: colors.surface }]}
            >
              <Ionicons 
                name={isActive ? tab.activeIcon : tab.icon} 
                size={20} 
                color={isActive ? colors.primary : colors.text} 
                style={styles.icon}
              />
              <Text style={[styles.label, isActive && styles.activeLabel, { color: isActive ? colors.primary : colors.text }]}>
                {tab.label}
              </Text>
            </BlurView>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70, // Moved up more to avoid covering Apple Maps logo
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: RADII.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    elevation: 0, // Remove Android elevation
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    ...SHADOWS.lg,
    transform: [{ scale: 1.05 }],
  },
  buttonBlur: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm, // Reduced from md to sm
    paddingHorizontal: SPACING.xs, // Kept at xs
    // backgroundColor will be set dynamically using colors.surface
    borderRadius: RADII.lg, // Kept at lg
    borderWidth: 0,
    overflow: 'hidden',
  },
  activeButtonBlur: {
    // backgroundColor will be set dynamically using colors.primary with opacity
    borderWidth: 0,
  },
  icon: {
    marginBottom: 2, // Reduced from 4 to 2
  },
  label: {
    ...TYPOGRAPHY.caption1,
    // color will be set dynamically using colors.text
    fontSize: 11, // Increased from 10 to 11
    fontWeight: '600',
    textAlign: 'center',
  },
  activeLabel: {
    // color will be set dynamically using colors.primary
    fontWeight: '700',
  },
});
