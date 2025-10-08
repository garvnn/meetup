/**
 * Messages Tab - Inbox-style meetup conversations with private group support
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { getMyMessages } from '../lib/data';
import { GroupChat } from '../components/GroupChat';

interface MessageThread {
  id: string;
  meetupTitle: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isPrivate: boolean;
  isGroup: boolean;
  memberCount?: number;
}

export default function MessagesPage() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<MessageThread | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, using mock data with enhanced features
      const mockMessages: MessageThread[] = [
        {
          id: '1',
          meetupTitle: 'PennApps Demo Meetup',
          lastMessage: 'Welcome to the PennApps Demo Meetup!',
          timestamp: '10 min ago',
          unreadCount: 2,
          isPrivate: false,
          isGroup: true,
          memberCount: 3,
        },
        {
          id: '2',
          meetupTitle: 'CS 101 Study Group',
          lastMessage: 'Quick question - for the fibonacci sequence, is it better to use recursion or iteration? I\'m getting different performance results',
          timestamp: '5 min ago',
          unreadCount: 1,
          isPrivate: false,
          isGroup: true,
          memberCount: 8,
        },
        {
          id: '3',
          meetupTitle: 'Coffee Chat',
          lastMessage: 'See you at the coffee shop!',
          timestamp: '1 hour ago',
          unreadCount: 1,
          isPrivate: false,
          isGroup: true,
          memberCount: 15,
        },
        {
          id: '4',
          meetupTitle: 'Private Study Session',
          lastMessage: 'Can we meet at 3pm?',
          timestamp: '2 hours ago',
          unreadCount: 0,
          isPrivate: true,
          isGroup: false,
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group: MessageThread) => {
    setSelectedGroup(group);
  };

  const handleBackToMessages = () => {
    setSelectedGroup(null);
    // Reload messages to get updated unread counts
    loadMessages();
  };

  // Show group chat if a group is selected
  if (selectedGroup) {
    return (
      <GroupChat
        meetupId={selectedGroup.id}
        meetupTitle={selectedGroup.meetupTitle}
        userId="user-1" // Mock user ID - in real app this would come from auth
        userName="You" // Mock user name - in real app this would come from user profile
        onBack={handleBackToMessages}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Join a meetup to start chatting!</Text>
          </View>
        ) : (
          messages.map((message) => (
            <TouchableOpacity 
              key={message.id} 
              style={styles.messageItem}
              onPress={() => handleGroupSelect(message)}
            >
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={[styles.meetupTitle, { color: colors.text }]}>{message.meetupTitle}</Text>
                  <View style={styles.badgesContainer}>
                    {message.isPrivate && (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateText}>Private</Text>
                      </View>
                    )}
                    {message.isGroup && message.memberCount && (
                      <View style={styles.memberBadge}>
                        <Ionicons name="people" size={12} color={colors.textTertiary} />
                        <Text style={[styles.memberText, { color: colors.textTertiary }]}>{message.memberCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                  {message.lastMessage}
                </Text>
                <Text style={[styles.timestamp, { color: colors.textTertiary }]}>{message.timestamp}</Text>
              </View>
              
              {message.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{message.unreadCount}</Text>
                </View>
              )}
              
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      {/* Floating Tab Bar */}
      <FloatingTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textTertiary + '20',
  },
  headerTitle: {
    ...TYPOGRAPHY.largeTitle,
    // color will be set dynamically using colors.text
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    // color will be set dynamically using colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headline,
    // color will be set dynamically using colors.text
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    // color will be set dynamically using colors.textSecondary
    textAlign: 'center',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textTertiary + '10',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  meetupTitle: {
    ...TYPOGRAPHY.headline,
    // color will be set dynamically using colors.text
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  privateBadge: {
    backgroundColor: COLORS.warning,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  privateText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.surface,
    fontWeight: '600',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  memberText: {
    ...TYPOGRAPHY.caption1,
    // color will be set dynamically using colors.textTertiary
    fontWeight: '500',
  },
  lastMessage: {
    ...TYPOGRAPHY.body,
    // color will be set dynamically using colors.textSecondary
    marginBottom: SPACING.xs,
  },
  timestamp: {
    ...TYPOGRAPHY.footnote,
    // color will be set dynamically using colors.textTertiary
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  unreadText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.surface,
    fontWeight: '600',
  },
});
