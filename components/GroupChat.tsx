/**
 * Group Chat Component - Individual group message interface
 * This component handles messaging for a specific group/meetup
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { Message, getMeetupMessages, sendMessageToMeetup, markMessagesAsRead, processQueuedMessages, testApiConnection } from '../lib/data';

interface GroupChatProps {
  meetupId: string;
  meetupTitle: string;
  userId: string;
  userName: string;
  onBack: () => void;
}

interface ChatMessage extends Message {
  isOwn: boolean;
  isAnnouncement: boolean;
  status?: 'sending' | 'sent' | 'failed' | 'queued';
}

export function GroupChat({ meetupId, meetupTitle, userId, userName, onBack }: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load messages when component mounts
  useEffect(() => {
    loadMessages();
    // Mark messages as read when entering chat
    markMessagesAsRead(meetupId, userId);
  }, [meetupId]);

  // Process queued messages when component mounts
  useEffect(() => {
    processQueuedMessages();
    // Test API connection for debugging
    testApiConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive (only for new messages, not when loading)
  useEffect(() => {
    if (messages.length > 0 && !loading && !refreshing) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, loading, refreshing]);

  const loadMessages = async (isRefresh = false, loadMore = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setCurrentOffset(0);
      } else if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentOffset(0);
      }
      
      const offset = loadMore ? currentOffset : 0;
      const limit = 20; // Load 20 messages at a time
      
      console.log(`🔄 Loading messages for meetup ${meetupId}, offset: ${offset}, limit: ${limit}`);
      const fetchedMessages = await getMeetupMessages(meetupId, userId, limit, offset);
      console.log(`📨 Fetched ${fetchedMessages.length} messages from data layer`);
      
      // Transform messages to include UI-specific properties
      const chatMessages: ChatMessage[] = fetchedMessages.map(msg => ({
        ...msg,
        isOwn: msg.senderId === userId,
        isAnnouncement: msg.type === 'announcement',
        status: 'sent' as const // Messages from server are considered sent
      }));
      
      console.log(`💬 Setting ${chatMessages.length} messages in UI state`);
      
      if (loadMore) {
        // Prepend older messages to the beginning
        setMessages(prev => [...chatMessages, ...prev]);
        setCurrentOffset(prev => prev + limit);
      } else {
        // Replace all messages (refresh or initial load)
        setMessages(chatMessages);
        setCurrentOffset(limit);
      }
      
      // Check if we have more messages to load
      setHasMoreMessages(fetchedMessages.length === limit);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    await loadMessages(true);
  };

  const handleLoadMore = async () => {
    if (hasMoreMessages && !loadingMore) {
      await loadMessages(false, true);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    // Load more when scrolled to top
    if (contentOffset.y <= 0 && hasMoreMessages && !loadingMore) {
      handleLoadMore();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    console.log(`📤 Sending message: "${messageText}" to meetup ${meetupId}`);
    setNewMessage('');
    setSending(true);

    // Optimistically add message to UI
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      meetupId,
      text: messageText,
      senderId: userId,
      senderName: userName,
      timestamp: new Date(),
      type: 'chat',
      isOwn: true,
      isAnnouncement: false,
      status: 'sending'
    };

    try {

      console.log(`➕ Adding temporary message to UI with ID: ${tempMessage.id}`);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg.text === messageText && msg.senderId === userId && Math.abs(msg.timestamp.getTime() - tempMessage.timestamp.getTime()) < 1000);
        if (exists) {
          console.log(`⚠️ Message already exists, not adding duplicate`);
          return prev;
        }
        return [...prev, tempMessage];
      });

      // Send to backend
      console.log(`🚀 Calling sendMessageToMeetup...`);
      const success = await sendMessageToMeetup(meetupId, userId, messageText, 'text');
      console.log(`📡 Send result: ${success}`);
      
      if (success) {
        // Update the temporary message with a success indicator
        console.log(`✅ Message sent successfully, updating status`);
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        ));
        
        // Don't reload messages automatically - the message is already in the UI
        console.log(`✅ Message status updated, no reload needed`);
      } else {
        // Keep the message but mark it as queued
        console.log(`⏳ Message queued, updating status`);
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'queued' as const }
            : msg
        ));
        
        // Show info message
        Alert.alert('Message Queued', 'Message will be sent when connection is restored.');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      // Keep the message but mark it as queued
      console.log(`⏳ Message queued due to error, updating status`);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'queued' as const }
          : msg
      ));
      
      Alert.alert('Message Queued', 'Message will be sent when connection is restored.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    if (message.isAnnouncement) {
      return (
        <View key={`${message.id}-${index}`} style={styles.announcementContainer}>
          <View style={styles.announcementBubble}>
            <Ionicons name="megaphone" size={16} color={COLORS.warning} />
            <Text style={styles.announcementText}>{message.text}</Text>
          </View>
          <Text style={styles.announcementSender}>- {message.senderName}</Text>
        </View>
      );
    }

    return (
      <View
        key={`${message.id}-${index}`}
        style={[
          styles.messageContainer,
          message.isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            message.isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}
        >
          {!message.isOwn && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              message.isOwn ? styles.ownMessageText : styles.otherMessageText
            ]}
          >
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                message.isOwn ? styles.ownMessageTime : styles.otherMessageTime
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
            {message.isOwn && message.status && (
              <View style={styles.statusContainer}>
                {message.status === 'sending' && (
                  <Ionicons name="time-outline" size={12} color={COLORS.textTertiary} />
                )}
                {message.status === 'sent' && (
                  <Ionicons name="checkmark" size={12} color={COLORS.primary} />
                )}
                {message.status === 'queued' && (
                  <Ionicons name="cloud-upload-outline" size={12} color={COLORS.warning} />
                )}
                {message.status === 'failed' && (
                  <Ionicons name="alert-circle-outline" size={12} color={COLORS.error} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {meetupTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <Text style={styles.loadingMoreText}>Loading older messages...</Text>
            </View>
          )}
          
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Start the conversation by sending a message!
              </Text>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textTertiary}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Ionicons name="hourglass-outline" size={20} color={COLORS.surface} />
              ) : (
                <Ionicons name="send" size={20} color={COLORS.surface} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textTertiary + '20',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: SPACING.sm,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADII.sm,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADII.sm,
  },
  senderName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  messageText: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.surface,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    ...TYPOGRAPHY.caption2,
    marginTop: 2,
  },
  ownMessageTime: {
    color: COLORS.surface + '80',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.textTertiary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 4,
  },
  announcementContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  announcementBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  announcementText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  announcementSender: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.textTertiary + '20',
    backgroundColor: COLORS.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
  },
});
