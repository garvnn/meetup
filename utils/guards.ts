import { CONFIG } from '../lib/config';
import { SupabaseService, MeetupWithDetails, TargetType } from '../lib/supabase';

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  action?: string;
}

export class Guards {
  // Check if user can post messages in a meetup
  static async canPostMessage(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has ended', action: 'read-only' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You are not a member of this meetup' };
      }

      if (meetup.is_soft_banned) {
        return { allowed: false, reason: 'You are temporarily restricted from posting in this meetup', action: 'view-only' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking message permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can upload files in a meetup
  static async canUploadFile(meetupId: string, userId: string, fileSize: number): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has ended', action: 'read-only' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You are not a member of this meetup' };
      }

      if (meetup.is_soft_banned) {
        return { allowed: false, reason: 'You are temporarily restricted from uploading files in this meetup', action: 'view-only' };
      }

      // Check file size limit
      if (fileSize > CONFIG.FILES.MAX_FILE_SIZE) {
        return { allowed: false, reason: `File size exceeds ${CONFIG.FILES.MAX_FILE_SIZE / (1024 * 1024)}MB limit` };
      }

      // Check meetup file quota
      if (meetup.files_count >= CONFIG.FILES.MAX_FILES_PER_MEETUP) {
        return { allowed: false, reason: `Meetup has reached the maximum of ${CONFIG.FILES.MAX_FILES_PER_MEETUP} files` };
      }

      if (meetup.total_bytes + fileSize > CONFIG.FILES.MAX_BYTES_PER_MEETUP) {
        return { allowed: false, reason: `Upload would exceed the ${CONFIG.FILES.MAX_BYTES_PER_MEETUP / (1024 * 1024)}MB storage limit` };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking file upload permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can delete a file
  static async canDeleteFile(fileId: string, userId: string, meetupId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has ended', action: 'read-only' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You are not a member of this meetup' };
      }

      if (meetup.is_soft_banned) {
        return { allowed: false, reason: 'You are temporarily restricted from deleting files in this meetup', action: 'view-only' };
      }

      // Host can delete any file, members can only delete their own
      if (!meetup.is_host) {
        // We'll need to check if the file belongs to the user
        // This would require fetching the file details
        return { allowed: true, reason: 'File ownership will be checked during deletion' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking file deletion permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can join a meetup
  static async canJoinMeetup(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has ended' };
      }

      if (meetup.is_member) {
        return { allowed: false, reason: 'You are already a member of this meetup' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking join permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can leave a meetup
  static async canLeaveMeetup(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You are not a member of this meetup' };
      }

      if (meetup.is_host) {
        return { allowed: false, reason: 'Hosts cannot leave their own meetup. End the meetup instead.' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking leave permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can end a meetup
  static async canEndMeetup(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has already ended' };
      }

      if (!meetup.is_host) {
        return { allowed: false, reason: 'Only the host can end the meetup' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking end meetup permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can report content
  static async canReport(meetupId: string, userId: string, targetType: TargetType, targetId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You must be a member to report content' };
      }

      // Can't report yourself
      if (targetType === 'user' && targetId === userId) {
        return { allowed: false, reason: 'You cannot report yourself' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking report permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can create announcements
  static async canCreateAnnouncement(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (meetup.is_ended) {
        return { allowed: false, reason: 'Meetup has ended', action: 'read-only' };
      }

      if (!meetup.is_host) {
        return { allowed: false, reason: 'Only the host can create announcements' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking announcement permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user should be soft-banned based on reports
  static async shouldSoftBan(meetupId: string, targetUserId: string): Promise<GuardResult> {
    try {
      const reports = await SupabaseService.getReportsForUser(
        meetupId, 
        targetUserId, 
        CONFIG.SOFT_BAN.TIME_WINDOW_MINUTES
      );

      if (reports.length >= CONFIG.SOFT_BAN.REPORTS_THRESHOLD) {
        return { 
          allowed: false, 
          reason: `User has ${reports.length} reports in the last ${CONFIG.SOFT_BAN.TIME_WINDOW_MINUTES} minutes`,
          action: 'soft-ban'
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking soft-ban status:', error);
      return { allowed: false, reason: 'Soft-ban check failed' };
    }
  }

  // Check if user can view meetup content
  static async canViewMeetup(meetupId: string, userId: string): Promise<GuardResult> {
    try {
      const meetup = await SupabaseService.getMeetupById(meetupId, userId);
      
      if (!meetup) {
        return { allowed: false, reason: 'Meetup not found' };
      }

      if (!meetup.is_member) {
        return { allowed: false, reason: 'You are not a member of this meetup' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking view permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check if user can create a meetup
  static async canCreateMeetup(userId: string): Promise<GuardResult> {
    try {
      // Basic check - in a real app, you might want to check for limits, etc.
      if (!userId) {
        return { allowed: false, reason: 'User not authenticated' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking create meetup permissions:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }
}
