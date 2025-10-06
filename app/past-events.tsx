/**
 * Past Meetups Tab - Gallery of completed meetups with photos and files
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([
    {
      id: '1',
      title: 'Hackathon',
      description: 'Fun weekend building apps together',
      date: 'Dec 15, 2024',
      attendeeCount: 25,
      photos: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
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
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
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
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=100&auto=format&fm=webp',
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

  const pickImage = async (eventId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = result.assets[0].uri;
      setPastEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, photos: [...event.photos, newPhoto] }
          : event
      ));
      Alert.alert('Success', 'Photo added to meetup!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Meetups</Text>
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
                      <Image 
                        source={{ uri: photo }} 
                        style={styles.photo}
                        resizeMode="cover"
                        quality={100}
                        priority="high"
                        progressiveRenderingEnabled={true}
                        onLoadStart={() => console.log('Past event photo loading started')}
                        onLoad={() => console.log('Past event photo loaded successfully')}
                        onError={(error) => console.log('Past event photo load error:', error)}
                      />
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

            {/* Upload Button */}
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => pickImage(event.id)}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
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
    width: 160, // Increased from 120
    height: 120, // Increased from 80
    borderRadius: RADII.md, // Increased from sm
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADII.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  uploadButtonText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
});
