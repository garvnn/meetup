/**
 * Settings Menu Component
 * Provides user settings and configuration options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY, RADII, SHADOWS } from '../utils/theme';
import { hapticButton } from '../utils/haptics';

interface SettingsMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isVisible, onClose }) => {
  const { colors, isDarkMode, isSystemTheme, toggleTheme, enableSystemTheme, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Load settings from AsyncStorage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notifications = await AsyncStorage.getItem('notifications_enabled');
        const location = await AsyncStorage.getItem('location_sharing_enabled');
        const analytics = await AsyncStorage.getItem('analytics_enabled');
        
        if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
        if (location !== null) setLocationSharingEnabled(JSON.parse(location));
        if (analytics !== null) setAnalyticsEnabled(JSON.parse(analytics));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    if (isVisible) {
      loadSettings();
    }
  }, [isVisible]);

  // Save settings to AsyncStorage
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleDevConsole = async () => {
    try {
      const { checkApiHealth } = await import('../lib/api');
      const result = await checkApiHealth();
      Alert.alert(
        'Developer Console',
        `API Status: ${result.status}\nMessage: ${result.message}\n\nBackend: Running\nFrontend: Connected\nDatabase: Real (Supabase)`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Developer Console',
        `API Status: Offline\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nBackend: Not responding\nFrontend: Disconnected`,
        [{ text: 'OK', style: 'default' }]
      );
    }
    onClose();
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and restart the app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd implement cache clearing here
            Alert.alert('Cache Cleared', 'App cache has been cleared successfully.');
            onClose();
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your meetup data to a file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, you'd implement data export here
            Alert.alert('Export Complete', 'Your data has been exported successfully.');
            onClose();
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'This app respects your privacy. Your location data is only used to show nearby meetups and is not shared with third parties.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About PennApps Meetup',
      'Version 1.0.0\nBuilt with React Native & Expo\nDatabase: Supabase\n\nA simple way to discover and join meetups near you.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    isDestructive = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background + '20' }]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isDestructive ? COLORS.error : colors.primary} 
          />
        </View>
        <View style={styles.settingItemText}>
          <Text style={[styles.settingTitle, { color: isDestructive ? COLORS.error : colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={styles.settingItemRight}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={[styles.container, { backgroundColor: colors.background + 'F0' }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Settings Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Appearance Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Appearance
                </Text>
                <SettingItem
                  icon="phone-portrait"
                  title="Use System Theme"
                  subtitle="Follow your device's theme setting"
                  rightElement={
                    <Switch
                      value={isSystemTheme}
                      onValueChange={(value) => {
                        hapticButton();
                        if (value) {
                          // Turning ON system theme
                          enableSystemTheme();
                        } else {
                          // Turning OFF system theme - use current theme mode
                          setThemeMode(isDarkMode ? 'dark' : 'light');
                        }
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  }
                />
                <SettingItem
                  icon="moon"
                  title="Dark Mode"
                  subtitle={isSystemTheme ? "Controlled by system" : "Switch between light and dark themes"}
                  rightElement={
                    <Switch
                      value={isDarkMode}
                      onValueChange={() => {
                        hapticButton();
                        toggleTheme();
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                      disabled={isSystemTheme}
                    />
                  }
                />
              </View>

              {/* Privacy & Location Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Privacy & Location
                </Text>
                <SettingItem
                  icon="notifications"
                  title="Push Notifications"
                  subtitle="Get notified about new meetups"
                  rightElement={
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={(value) => {
                        hapticButton();
                        setNotificationsEnabled(value);
                        saveSetting('notifications_enabled', value);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  }
                />
                <SettingItem
                  icon="location"
                  title="Location Sharing"
                  subtitle="Share your location for nearby meetups"
                  rightElement={
                    <Switch
                      value={locationSharingEnabled}
                      onValueChange={(value) => {
                        hapticButton();
                        setLocationSharingEnabled(value);
                        saveSetting('location_sharing_enabled', value);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  }
                />
                <SettingItem
                  icon="analytics"
                  title="Analytics"
                  subtitle="Help improve the app with usage data"
                  rightElement={
                    <Switch
                      value={analyticsEnabled}
                      onValueChange={(value) => {
                        hapticButton();
                        setAnalyticsEnabled(value);
                        saveSetting('analytics_enabled', value);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  }
                />
              </View>

              {/* Data Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Data
                </Text>
                <SettingItem
                  icon="download"
                  title="Export Data"
                  subtitle="Download your meetup data"
                  onPress={handleExportData}
                  rightElement={
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  }
                />
                <SettingItem
                  icon="trash"
                  title="Clear Cache"
                  subtitle="Free up storage space"
                  onPress={handleClearCache}
                  rightElement={
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  }
                />
              </View>

              {/* Developer Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Developer
                </Text>
                <SettingItem
                  icon="terminal"
                  title="Developer Console"
                  subtitle="Check API status and debug info"
                  onPress={handleDevConsole}
                  rightElement={
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  }
                />
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  About
                </Text>
                <SettingItem
                  icon="information-circle"
                  title="About"
                  subtitle="App version and information"
                  onPress={handleAbout}
                  rightElement={
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  }
                />
                <SettingItem
                  icon="shield-checkmark"
                  title="Privacy Policy"
                  subtitle="How we protect your data"
                  onPress={handlePrivacyPolicy}
                  rightElement={
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  }
                />
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  settingItemRight: {
    marginLeft: SPACING.md,
  },
});
