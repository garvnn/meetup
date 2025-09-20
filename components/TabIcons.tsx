/**
 * SF Symbol icon wrappers using @expo/vector-icons
 */

import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const MapIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Ionicons name="map" size={size} color={color} />
);

export const MessagesIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Ionicons name="chatbubbles" size={size} color={color} />
);

export const ListIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.text }) => (
  <Ionicons name="list" size={size} color={color} />
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.textSecondary }) => (
  <Ionicons name="search" size={size} color={color} />
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.textSecondary }) => (
  <Ionicons name="close" size={size} color={color} />
);

export const ShareIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.primary }) => (
  <Ionicons name="share" size={size} color={color} />
);

export const ChatIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.primary }) => (
  <Ionicons name="chatbubble" size={size} color={color} />
);

export const JoinIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.success }) => (
  <Ionicons name="person-add" size={size} color={color} />
);

export const LeaveIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.error }) => (
  <Ionicons name="person-remove" size={size} color={color} />
);

export const TimeIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.textSecondary }) => (
  <Ionicons name="time" size={size} color={color} />
);

export const LocationIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.textSecondary }) => (
  <Ionicons name="location" size={size} color={color} />
);

export const PeopleIcon: React.FC<IconProps> = ({ size = 24, color = COLORS.textSecondary }) => (
  <Ionicons name="people" size={size} color={color} />
);

export const EmptyIcon: React.FC<IconProps> = ({ size = 48, color = COLORS.textTertiary }) => (
  <MaterialIcons name="inbox" size={size} color={color} />
);
