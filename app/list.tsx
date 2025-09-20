/**
 * List Tab - iOS table-style meetup list
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { FloatingTabBar } from '../components/FloatingTabBar';

export default function ListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [meetups] = useState([
    {
      id: '1',
      title: 'PennApps Demo Meetup',
      description: 'A private meetup for testing the PennApps app',
      startTime: '2:30 PM',
      endTime: '4:30 PM',
      attendeeCount: 3,
      isJoined: true,
      isHost: false,
    },
    {
      id: '2',
      title: 'Study Group',
      description: 'CS 101 study session',
      startTime: '3:30 PM',
      endTime: '6:30 PM',
      attendeeCount: 8,
      isJoined: true,
      isHost: false,
    },
    {
      id: '3',
      title: 'Coffee Chat',
      description: 'Casual coffee meetup',
      startTime: '4:30 PM',
      endTime: '5:30 PM',
      attendeeCount: 15,
      isJoined: false,
      isHost: false,
    },
  ]);

  const filteredMeetups = meetups.filter(meetup =>
    meetup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meetup.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetups</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search meetups..."
            placeholderTextColor={COLORS.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredMeetups.map((meetup) => (
          <TouchableOpacity key={meetup.id} style={styles.meetupItem}>
            <View style={styles.meetupContent}>
              <View style={styles.meetupHeader}>
                <Text style={styles.meetupTitle}>{meetup.title}</Text>
                {meetup.isJoined && (
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedText}>Joined</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.meetupDescription} numberOfLines={2}>
                {meetup.description}
              </Text>
              
              <View style={styles.meetupFooter}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time" size={16} color={COLORS.textTertiary} />
                  <Text style={styles.timeText}>
                    {meetup.startTime} - {meetup.endTime}
                  </Text>
                </View>
                
                <View style={styles.attendeeContainer}>
                  <Ionicons name="people" size={16} color={COLORS.textTertiary} />
                  <Text style={styles.attendeeText}>{meetup.attendeeCount} attending</Text>
                </View>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ))}
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
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  meetupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  meetupContent: {
    flex: 1,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  meetupTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    flex: 1,
  },
  joinedBadge: {
    backgroundColor: COLORS.success,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  joinedText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.surface,
    fontWeight: '600',
  },
  meetupDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  meetupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
  attendeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  attendeeText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
});
