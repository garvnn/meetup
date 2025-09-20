import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { TargetType } from '../lib/supabase';
import { SupabaseService } from '../lib/supabase';
import { Guards } from '../utils/guards';
import { Formatters } from '../utils/formatters';

interface ReportButtonProps {
  meetupId: string;
  targetType: TargetType;
  targetId: string;
  reporterId: string;
  targetName?: string;
  onReportSubmitted?: () => void;
  style?: any;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Spam or harassment',
  'Off-topic discussion',
  'Violence or threats',
  'Hate speech',
  'Other',
];

export function ReportButton({
  meetupId,
  targetType,
  targetId,
  reporterId,
  targetName,
  onReportSubmitted,
  style,
}: ReportButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting.');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for reporting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user can report
      const canReport = await Guards.canReport(meetupId, reporterId, targetType, targetId);
      if (!canReport.allowed) {
        Alert.alert('Cannot Report', canReport.reason || 'You cannot report this content.');
        return;
      }

      const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

      // Submit the report
      await SupabaseService.createReport(meetupId, targetType, targetId, reporterId, reason);

      // Check if this should trigger a soft-ban
      if (targetType === 'user') {
        const shouldSoftBan = await Guards.shouldSoftBan(meetupId, targetId);
        if (!shouldSoftBan.allowed) {
          // Call the backend to enact soft-ban
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/soft_ban`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                meetup_id: meetupId,
                target_user_id: targetId,
                enacted_by: reporterId,
                reason: `Auto-soft-ban after ${shouldSoftBan.reason}`,
              }),
            });

            if (response.ok) {
              Alert.alert(
                'Report Submitted',
                'The content has been reported and the user has been temporarily restricted.',
                [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
              );
            } else {
              Alert.alert(
                'Report Submitted',
                'The content has been reported. The user will be reviewed by moderators.',
                [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
              );
            }
          } catch (error) {
            console.error('Error calling soft-ban endpoint:', error);
            Alert.alert(
              'Report Submitted',
              'The content has been reported. The user will be reviewed by moderators.',
              [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
            );
          }
        } else {
          Alert.alert(
            'Report Submitted',
            'Thank you for reporting this content. It will be reviewed by moderators.',
            [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
          );
        }
      } else {
        Alert.alert(
          'Report Submitted',
          'Thank you for reporting this content. It will be reviewed by moderators.',
          [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
        );
      }

      onReportSubmitted?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetDisplayName = () => {
    if (targetName) return targetName;
    
    switch (targetType) {
      case 'user':
        return 'this user';
      case 'message':
        return 'this message';
      case 'file':
        return 'this file';
      default:
        return 'this content';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.reportButton, style]}
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel={`Report ${getTargetDisplayName()}`}
      >
        <Text style={styles.reportButtonText}>Report</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report {getTargetDisplayName()}</Text>
            <Text style={styles.modalSubtitle}>
              Help us keep the community safe by reporting inappropriate content.
            </Text>

            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.reasonButtonSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonButtonText,
                      selectedReason === reason && styles.reasonButtonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedReason === 'Other' && (
              <TextInput
                style={styles.customReasonInput}
                placeholder="Please describe the issue..."
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!selectedReason || (selectedReason === 'Other' && !customReason.trim())) && styles.submitButtonDisabled,
                ]}
                onPress={handleReport}
                disabled={isSubmitting || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reportButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reasonButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  reasonButtonText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  reasonButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 80,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF3B30',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
