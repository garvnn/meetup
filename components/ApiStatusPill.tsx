/**
 * API Status Pill - Shows current API health status
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkApiHealth, ApiHealthStatus } from '../lib/api';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';

interface ApiStatusPillProps {
  onPress?: () => void;
}

export const ApiStatusPill: React.FC<ApiStatusPillProps> = ({ onPress }) => {
  const [status, setStatus] = useState<ApiHealthStatus>('checking');
  const [message, setMessage] = useState('Checking...');

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const result = await checkApiHealth();
      setStatus(result.status);
      setMessage(result.message);
    } catch (error) {
      setStatus('offline');
      setMessage('API unreachable');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return COLORS.success;
      case 'offline': return COLORS.error;
      case 'checking': return COLORS.warning;
      default: return COLORS.textTertiary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return 'checkmark-circle';
      case 'offline': return 'close-circle';
      case 'checking': return 'time';
      default: return 'help-circle';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking';
      default: return 'Unknown';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: getStatusColor() + '20' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={getStatusIcon()} 
        size={12} 
        color={getStatusColor()} 
      />
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.full,
    gap: SPACING.xs,
  },
  text: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
  },
});
