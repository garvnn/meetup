/**
 * iOS-style bottom sheet card with blur and rounded corners
 * Replaces native callouts with custom actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { ShareIcon, ChatIcon, JoinIcon, LeaveIcon, TimeIcon, LocationIcon, PeopleIcon } from './TabIcons';
import { COLORS, SPACING, RADII, TYPOGRAPHY, SHADOWS } from '../utils/theme';
import { Meetup } from '../lib/data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5; // Half height as requested

interface BottomSheetCardProps {
  meetup: Meetup | null;
  isVisible: boolean;
  onClose: () => void;
  onJoin: (meetupId: string) => void;
  onLeave: (meetupId: string) => void;
  onShare: (meetupId: string) => void;
  onOpenChat: (meetupId: string) => void;
}

export const BottomSheetCard: React.FC<BottomSheetCardProps> = ({
  meetup,
  isVisible,
  onClose,
  onJoin,
  onLeave,
  onShare,
  onOpenChat,
}) => {

  const handleJoin = () => {
    if (meetup) {
      onJoin(meetup.id);
    }
  };

  const handleLeave = () => {
    if (meetup) {
      onLeave(meetup.id);
    }
  };

  const handleShare = () => {
    if (meetup) {
      onShare(meetup.id);
    }
  };

  const handleOpenChat = () => {
    if (meetup) {
      onOpenChat(meetup.id);
    }
  };

  if (!meetup) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Grabber */}
          <View style={styles.grabber} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {meetup.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {meetup.description && (
            <Text style={styles.description} numberOfLines={3}>
              {meetup.description}
            </Text>
          )}

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <TimeIcon size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {formatDate(meetup.startTime)} • {formatTime(meetup.startTime)} - {formatTime(meetup.endTime)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <LocationIcon size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>Near campus</Text>
            </View>
            
            <View style={styles.detailRow}>
              <PeopleIcon size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{meetup.attendeeCount} attendees</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {meetup.isJoined ? (
              <>
                <TouchableOpacity style={styles.primaryAction} onPress={handleOpenChat}>
                  <ChatIcon size={20} color={COLORS.surface} />
                  <Text style={styles.primaryActionText}>Open Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryAction} onPress={handleShare}>
                  <ShareIcon size={20} color={COLORS.primary} />
                  <Text style={styles.secondaryActionText}>Share</Text>
                </TouchableOpacity>
                
                {!meetup.isHost && (
                  <TouchableOpacity style={styles.dangerAction} onPress={handleLeave}>
                    <LeaveIcon size={20} color={COLORS.error} />
                    <Text style={styles.dangerActionText}>Leave</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity style={styles.primaryAction} onPress={handleJoin}>
                <JoinIcon size={20} color={COLORS.surface} />
                <Text style={styles.primaryActionText}>Join Meetup</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: RADII['2xl'],
    borderTopRightRadius: RADII['2xl'],
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  grabber: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textSecondary,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  details: {
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TYPOGRAPHY.subhead,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    gap: SPACING.sm,
  },
  primaryActionText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    gap: SPACING.sm,
  },
  secondaryActionText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADII.lg,
    gap: SPACING.sm,
  },
  dangerActionText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.error,
    fontWeight: '600',
  },
});
