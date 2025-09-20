/**
 * Developer Panel - Hidden panel for API configuration and testing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getApiBaseUrl, setApiBaseUrl, checkApiHealth, validateApiUrl } from '../lib/api';
import { useTheme } from '../utils/ThemeContext';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { hapticButton, hapticSuccess, hapticError } from '../utils/haptics';

interface DeveloperPanelProps {
  onClose: () => void;
}

// Safe platform label resolver
const getPlatformLabel = (): string => {
  try {
    if (Platform && Platform.OS) {
      switch (Platform.OS) {
        case 'ios': return 'iOS';
        case 'android': return 'Android';
        case 'web': return 'Web';
        default: return 'Unknown';
      }
    }
    return 'Unknown';
  } catch (error) {
    console.warn('Platform detection failed:', error);
    return 'Unknown';
  }
};

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onClose }) => {
  const { colors, themeMode, toggleTheme } = useTheme();
  const [currentUrl, setCurrentUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [healthStatus, setHealthStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [healthMessage, setHealthMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const url = await getApiBaseUrl();
      setCurrentUrl(url);
      setNewUrl(url);
      await runHealthCheck();
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const runHealthCheck = async () => {
    setHealthStatus('checking');
    setHealthMessage('Checking API health...');
    
    try {
      console.log('🔍 Running health check...');
      const result = await checkApiHealth();
      console.log('📊 Health check result:', result);
      
      setHealthStatus(result.status);
      setHealthMessage(result.message);
      
      // Show alert with detailed info
      Alert.alert(
        'API Health Check',
        `Status: ${result.status}\nMessage: ${result.message}\nURL: ${currentUrl}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Health check failed:', error);
      setHealthStatus('offline');
      setHealthMessage(error instanceof Error ? error.message : 'Health check failed');
      
      Alert.alert(
        'API Health Check Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\nURL: ${currentUrl}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleUpdateUrl = async () => {
    if (!newUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL');
      return;
    }

    // Add protocol if missing
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setIsValidating(true);
    
    try {
      // Validate URL format
      new URL(url);
      
      // Validate for platform compatibility
      const validation = await validateApiUrl();
      if (!validation.valid) {
        Alert.alert(
          'Invalid URL for Platform',
          validation.reason,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Anyway', onPress: () => saveUrl(url) }
          ]
        );
        return;
      }
      
      await saveUrl(url);
    } catch (error) {
      Alert.alert('Invalid URL', 'Please enter a valid URL (e.g., https://api.example.com)');
    } finally {
      setIsValidating(false);
    }
  };

  const saveUrl = async (url: string) => {
    try {
      await setApiBaseUrl(url);
      setCurrentUrl(url);
      setNewUrl(url);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'URL Updated',
        'API URL has been updated. You may need to restart the app for changes to take effect.',
        [
          { text: 'OK', onPress: () => runHealthCheck() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'Reset API URL to default (http://localhost:8000)?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => saveUrl('http://localhost:8000') }
      ]
    );
  };

  const handleClearCache = async () => {
    try {
      // Clear the stored API URL
      await AsyncStorage.removeItem('api_base_url');
      
      // Reload the current config
      await loadCurrentConfig();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Cache Cleared', 'API URL cache has been cleared. The app will now use the environment variable.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case 'online': return COLORS.success;
      case 'offline': return COLORS.error;
      case 'checking': return COLORS.warning;
      default: return COLORS.textTertiary;
    }
  };

  const getHealthStatusIcon = () => {
    switch (healthStatus) {
      case 'online': return 'checkmark-circle';
      case 'offline': return 'close-circle';
      case 'checking': return 'time';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          hapticButton();
          onClose();
        }} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Developer Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Configuration</Text>
          
          <View style={styles.configItem}>
            <Text style={[styles.configLabel, { color: colors.text }]}>API Base URL:</Text>
            <Text style={[styles.configValue, { color: colors.textSecondary }]} numberOfLines={2}>
              {currentUrl}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={[styles.configLabel, { color: colors.text }]}>Platform:</Text>
            <Text style={[styles.configValue, { color: colors.textSecondary }]}>
              {getPlatformLabel()}
            </Text>
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>API Health</Text>
            <TouchableOpacity onPress={() => {
              hapticButton();
              runHealthCheck();
            }} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.healthStatus}>
            <Ionicons 
              name={getHealthStatusIcon()} 
              size={24} 
              color={getHealthStatusColor()} 
            />
            <View style={styles.healthInfo}>
              <Text style={[styles.healthStatusText, { color: getHealthStatusColor() }]}>
                {healthStatus.toUpperCase()}
              </Text>
              <Text style={[styles.healthMessage, { color: colors.textSecondary }]}>{healthMessage}</Text>
            </View>
          </View>
        </View>

        {/* URL Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Update API URL</Text>
          
          <TextInput
            style={[styles.urlInput, { color: colors.text, backgroundColor: colors.surface }]}
            value={newUrl}
            onChangeText={setNewUrl}
            placeholder="https://api.example.com"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                hapticButton();
                handleUpdateUrl();
              }}
              disabled={isValidating}
            >
              <Text style={styles.primaryButtonText}>
                {isValidating ? 'Validating...' : 'Update URL'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                hapticButton();
                handleResetToDefault();
              }}
            >
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={() => {
                hapticButton();
                handleClearCache();
              }}
            >
              <Text style={styles.warningButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Settings</Text>
          
          <View style={styles.configItem}>
            <Text style={[styles.configLabel, { color: colors.text }]}>Current Theme:</Text>
            <Text style={[styles.configValue, { color: colors.textSecondary }]}>
              {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              hapticButton();
              toggleTheme();
            }}
          >
            <Ionicons 
              name={themeMode === 'dark' ? 'sunny' : 'moon'} 
              size={20} 
              color={colors.surface} 
              style={{ marginRight: SPACING.sm }}
            />
            <Text style={styles.primaryButtonText}>
              Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Platform Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Notes</Text>
          
          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>iOS Physical Device:</Text>
              <Text style={styles.noteText}>
                Requires HTTPS. Use ngrok or Cloudflare Tunnel for local development.
              </Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Android Emulator:</Text>
              <Text style={styles.noteText}>
                Use 10.0.2.2 instead of localhost for local development.
              </Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>iOS Simulator:</Text>
              <Text style={styles.noteText}>
                Supports http://localhost:8000 for local development.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  configItem: {
    marginBottom: SPACING.md,
  },
  configLabel: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  configValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADII.sm,
    fontFamily: 'monospace',
  },
  refreshButton: {
    padding: SPACING.sm,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    gap: SPACING.md,
  },
  healthInfo: {
    flex: 1,
  },
  healthStatusText: {
    ...TYPOGRAPHY.headline,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  healthMessage: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
  },
  urlInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textTertiary + '30',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: COLORS.warning,
  },
  warningButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  noteText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.primary,
    lineHeight: 18,
  },
});
