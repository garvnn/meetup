import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types matching the schema
export type Role = 'host' | 'admin' | 'member';
export type MessageType = 'chat' | 'announcement';
export type FileType = 'image' | 'pdf' | 'note';
export type TargetType = 'user' | 'message' | 'file';

export interface User {
  id: string;
  clerk_id: string;
  handle: string;
  photo_url?: string;
  created_at: string;
}

export interface Meetup {
  id: string;
  host_id: string;
  title: string;
  desc?: string;
  start_ts: string;
  end_ts: string;
  lat?: number;
  lng?: number;
  created_at: string;
  ended_at?: string;
  attendee_count: number;
  files_count: number;
  total_bytes: number;
}

export interface Membership {
  meetup_id: string;
  user_id: string;
  role: Role;
  soft_banned: boolean;
  soft_ban_reason?: string;
  joined_at: string;
}

export interface InviteToken {
  id: string;
  meetup_id: string;
  token: string;
  expires_at?: string;
  revoked_at?: string;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  meetup_id: string;
  user_id: string;
  type: MessageType;
  text: string;
  parent_id?: string;
  created_at: string;
  // Joined data
  user?: User;
}

export interface File {
  id: string;
  meetup_id: string;
  user_id: string;
  type: FileType;
  storage_path: string;
  filename?: string;
  size_bytes: number;
  note_title?: string;
  note_body?: string;
  created_at: string;
  deleted_at?: string;
  // Joined data
  user?: User;
}

export interface Report {
  id: string;
  meetup_id: string;
  target_type: TargetType;
  target_id: string;
  reporter_id: string;
  reason?: string;
  created_at: string;
}

export interface SoftBanEvent {
  id: string;
  meetup_id: string;
  target_user_id: string;
  enacted_by: string;
  reason?: string;
  created_at: string;
}

// Extended types for UI
export interface MeetupWithDetails extends Meetup {
  memberships: (Membership & { user: User })[];
  invite_tokens: InviteToken[];
  is_ended: boolean;
  is_host: boolean;
  is_member: boolean;
  is_soft_banned: boolean;
}

export interface MessageWithUser extends Message {
  user: User;
}

export interface FileWithUser extends File {
  user: User;
}

// Supabase service functions
export class SupabaseService {
  // Meetup operations
  static async getMeetupsForUser(userId: string): Promise<MeetupWithDetails[]> {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        meetup_id,
        meetups (
          id,
          host_id,
          title,
          desc,
          start_ts,
          end_ts,
          lat,
          lng,
          created_at,
          ended_at,
          attendee_count,
          files_count,
          total_bytes
        )
      `)
      .eq('user_id', userId)
      .eq('meetups.ended_at', null);

    if (error) throw error;
    return data?.map(item => ({
      ...item.meetups,
      memberships: [],
      invite_tokens: [],
      is_ended: false,
      is_host: item.meetups.host_id === userId,
      is_member: true,
      is_soft_banned: false,
    })) || [];
  }

  static async getMeetupById(meetupId: string, userId: string): Promise<MeetupWithDetails | null> {
    const { data, error } = await supabase
      .from('meetups')
      .select(`
        *,
        memberships (
          *,
          user:users (*)
        ),
        invite_tokens (*)
      `)
      .eq('id', meetupId)
      .single();

    if (error) return null;

    const membership = data.memberships.find((m: any) => m.user_id === userId);
    
    return {
      ...data,
      is_ended: !!data.ended_at,
      is_host: data.host_id === userId,
      is_member: !!membership,
      is_soft_banned: membership?.soft_banned || false,
    };
  }

  static async createMeetup(meetup: Partial<Meetup>, hostId: string): Promise<Meetup> {
    const { data, error } = await supabase
      .from('meetups')
      .insert({
        ...meetup,
        host_id: hostId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async endMeetup(meetupId: string, hostId: string): Promise<void> {
    const { error } = await supabase
      .from('meetups')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', meetupId)
      .eq('host_id', hostId);

    if (error) throw error;
  }

  // Membership operations
  static async joinMeetup(meetupId: string, userId: string, role: Role = 'member'): Promise<void> {
    const { error } = await supabase
      .from('memberships')
      .upsert({
        meetup_id: meetupId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Update attendee count
    await this.updateAttendeeCount(meetupId);
  }

  static async leaveMeetup(meetupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('meetup_id', meetupId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update attendee count
    await this.updateAttendeeCount(meetupId);
  }

  static async updateAttendeeCount(meetupId: string): Promise<void> {
    const { count, error } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('meetup_id', meetupId);

    if (error) throw error;

    await supabase
      .from('meetups')
      .update({ attendee_count: count || 0 })
      .eq('id', meetupId);
  }

  // Message operations
  static async getMessages(meetupId: string): Promise<MessageWithUser[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users (*)
      `)
      .eq('meetup_id', meetupId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async sendMessage(meetupId: string, userId: string, text: string, type: MessageType = 'chat'): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        meetup_id: meetupId,
        user_id: userId,
        text,
        type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // File operations
  static async getFiles(meetupId: string): Promise<FileWithUser[]> {
    const { data, error } = await supabase
      .from('files')
      .select(`
        *,
        user:users (*)
      `)
      .eq('meetup_id', meetupId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async uploadFile(
    meetupId: string,
    userId: string,
    file: File,
    type: FileType,
    noteTitle?: string,
    noteBody?: string
  ): Promise<File> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `meetups/${meetupId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('meetup-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save file record
    const { data, error } = await supabase
      .from('files')
      .insert({
        meetup_id: meetupId,
        user_id: userId,
        type,
        storage_path: filePath,
        filename: file.name,
        size_bytes: file.size,
        note_title: noteTitle,
        note_body: noteBody,
      })
      .select()
      .single();

    if (error) throw error;

    // Update file count and total bytes
    await this.updateFileStats(meetupId);

    return data;
  }

  static async deleteFile(fileId: string, userId: string, isHost: boolean): Promise<void> {
    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    // Check permissions
    if (!isHost && file.user_id !== userId) {
      throw new Error('Not authorized to delete this file');
    }

    // Mark as deleted
    const { error } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', fileId);

    if (error) throw error;

    // Update file stats
    await this.updateFileStats(file.meetup_id);
  }

  static async updateFileStats(meetupId: string): Promise<void> {
    const { data, error } = await supabase
      .from('files')
      .select('size_bytes')
      .eq('meetup_id', meetupId)
      .is('deleted_at', null);

    if (error) throw error;

    const filesCount = data.length;
    const totalBytes = data.reduce((sum, file) => sum + file.size_bytes, 0);

    await supabase
      .from('meetups')
      .update({ files_count: filesCount, total_bytes: totalBytes })
      .eq('id', meetupId);
  }

  // Invite token operations
  static async createInviteToken(meetupId: string, createdBy: string, expiresAt?: string): Promise<InviteToken> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({
        meetup_id: meetupId,
        token,
        expires_at: expiresAt,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getInviteToken(token: string): Promise<InviteToken | null> {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .is('revoked_at', null)
      .single();

    if (error) return null;
    return data;
  }

  // Report operations
  static async createReport(
    meetupId: string,
    targetType: TargetType,
    targetId: string,
    reporterId: string,
    reason?: string
  ): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        meetup_id: meetupId,
        target_type: targetType,
        target_id: targetId,
        reporter_id: reporterId,
        reason,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReportsForUser(meetupId: string, targetUserId: string, timeWindowMinutes: number = 10): Promise<Report[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('meetup_id', meetupId)
      .eq('target_id', targetUserId)
      .gte('created_at', cutoffTime);

    if (error) throw error;
    return data || [];
  }

  // Realtime subscriptions
  static subscribeToMeetupUpdates(meetupId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`meetup-${meetupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `meetup_id=eq.${meetupId}`,
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'files',
        filter: `meetup_id=eq.${meetupId}`,
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'memberships',
        filter: `meetup_id=eq.${meetupId}`,
      }, callback)
      .subscribe();
  }
}
