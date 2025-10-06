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
              tint="light"
              style={[styles.buttonBlur, isActive && styles.activeButtonBlur]}
            >
              <Ionicons 
                name={isActive ? tab.activeIcon : tab.icon} 
                size={24} 
                color={isActive ? COLORS.primary : '#000000'} 
                style={styles.icon}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>
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
    bottom: 20,
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
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADII.xl,
    borderWidth: 0,
    overflow: 'hidden',
  },
  activeButtonBlur: {
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    borderWidth: 0,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    ...TYPOGRAPHY.caption1,
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
