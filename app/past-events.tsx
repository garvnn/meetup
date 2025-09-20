/**
 * Past Events Tab - Gallery of completed meetups with photos and files
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '../utils/theme';
import { FloatingTabBar } from '../components/FloatingTabBar';

interface PastEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  attendeeCount: number;
  photos: string[];
  files: Array<{
    name: string;
    type: 'pdf' | 'doc' | 'image' | 'other';
    size: string;
  }>;
  isPrivate: boolean;
}

export default function PastEventsPage() {
  const [pastEvents] = useState<PastEvent[]>([
    {
      id: '1',
      title: 'Hackathon Finale',
      description: 'Amazing weekend building apps together',
      date: 'Dec 15, 2024',
      attendeeCount: 25,
      photos: [
        'https://picsum.photos/300/200?random=1',
        'https://picsum.photos/300/200?random=2',
        'https://picsum.photos/300/200?random=3',
      ],
      files: [
        { name: 'Project_Presentation.pdf', type: 'pdf', size: '2.3 MB' },
        { name: 'Team_Photo.jpg', type: 'image', size: '1.8 MB' },
      ],
      isPrivate: false,
    },
    {
      id: '2',
      title: 'Study Group Finals',
      description: 'CS 101 final exam prep session',
      date: 'Dec 10, 2024',
      attendeeCount: 12,
      photos: [
        'https://picsum.photos/300/200?random=4',
        'https://picsum.photos/300/200?random=5',
      ],
      files: [
        { name: 'Study_Notes.pdf', type: 'pdf', size: '1.2 MB' },
        { name: 'Practice_Problems.docx', type: 'doc', size: '890 KB' },
        { name: 'Group_Study.jpg', type: 'image', size: '2.1 MB' },
      ],
      isPrivate: true,
    },
    {
      id: '3',
      title: 'Coffee Chat Networking',
      description: 'Casual networking over coffee',
      date: 'Dec 8, 2024',
      attendeeCount: 8,
      photos: [
        'https://picsum.photos/300/200?random=6',
      ],
      files: [
        { name: 'Contact_List.xlsx', type: 'other', size: '156 KB' },
      ],
      isPrivate: false,
    },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Events</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {pastEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.isPrivate && (
                  <View style={styles.privateBadge}>
                    <Text style={styles.privateText}>Private</Text>
                  </View>
                )}
              </View>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
            
            <Text style={styles.eventDescription}>{event.description}</Text>
            
            <View style={styles.eventStats}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={16} color={COLORS.textTertiary} />
                <Text style={styles.statText}>{event.attendeeCount} attended</Text>
              </View>
            </View>

            {/* Photos Section */}
            {event.photos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Photos ({event.photos.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
                  {event.photos.map((photo, index) => (
                    <TouchableOpacity key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Files Section */}
            {event.files.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Files ({event.files.length})</Text>
                {event.files.map((file, index) => (
                  <TouchableOpacity key={index} style={styles.fileItem}>
                    <Text style={styles.fileIcon}>{getFileIcon(file.type)}</Text>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{file.name}</Text>
                      <Text style={styles.fileSize}>{file.size}</Text>
                    </View>
                    <Ionicons name="download" size={20} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  eventTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    flex: 1,
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
  eventDate: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
  eventDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoItem: {
    marginRight: SPACING.sm,
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: RADII.sm,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADII.sm,
    marginBottom: SPACING.xs,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  fileSize: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
  },
});
