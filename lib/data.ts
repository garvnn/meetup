/**
 * Data layer - Query helpers for meetups and messages
 */

import { CONFIG } from './config';

export interface Meetup {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  latitude: number;
  longitude: number;
  attendeeCount: number;
  hostId: string;
  hostName: string;
  isJoined: boolean;
  isHost: boolean;
  lastMessage?: {
    text: string;
    timestamp: Date;
    senderName: string;
  };
}

export interface Message {
  id: string;
  meetupId: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'chat' | 'announcement';
}

// Mock data factory - generates meetups relative to user location
const createMockMeetups = (userLat: number, userLng: number): Meetup[] => {
  // Generate meetups within ~1km of user location
  const offset = 0.01; // ~1km offset
  
  return [
    {
      id: '1',
      title: 'PennApps Demo Meetup',
      description: 'A private meetup for testing the PennApps app',
      startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      latitude: userLat + offset * 0.5,
      longitude: userLng + offset * 0.3,
      attendeeCount: 3,
      hostId: 'host1',
      hostName: 'Demo Host',
      isJoined: true,
      isHost: false,
      lastMessage: {
        text: 'Welcome to the PennApps Demo Meetup!',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        senderName: 'Demo Host',
      },
    },
    {
      id: '2',
      title: 'Study Group',
      description: 'CS 101 study session',
      startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      latitude: userLat - offset * 0.2,
      longitude: userLng + offset * 0.8,
      attendeeCount: 8,
      hostId: 'host2',
      hostName: 'Study Leader',
      isJoined: true,
      isHost: false,
      lastMessage: {
        text: 'Bring your laptops!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        senderName: 'Study Leader',
      },
    },
    {
      id: '3',
      title: 'Coffee Chat',
      description: 'Casual coffee meetup',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      latitude: userLat + offset * 0.8,
      longitude: userLng - offset * 0.4,
      attendeeCount: 15,
      hostId: 'host3',
      hostName: 'Coffee Host',
      isJoined: false,
      isHost: false,
    },
  ];
};

// Store for mock meetups (only populated when location is available)
let MOCK_MEETUPS: Meetup[] = [];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    meetupId: '1',
    text: 'Welcome to the PennApps Demo Meetup!',
    senderId: 'host1',
    senderName: 'Demo Host',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'announcement',
  },
  {
    id: '2',
    meetupId: '1',
    text: 'Hey everyone, excited to be here!',
    senderId: 'user1',
    senderName: 'Test User',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'chat',
  },
  {
    id: '3',
    meetupId: '2',
    text: 'Bring your laptops!',
    senderId: 'host2',
    senderName: 'Study Leader',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'chat',
  },
];

// Initialize mock data with user location
export const initializeMockData = (userLat: number, userLng: number): void => {
  MOCK_MEETUPS = createMockMeetups(userLat, userLng);
};

export const getMyMeetups = async (userId?: string): Promise<Meetup[]> => {
  // In a real app, this would query Supabase
  // For now, return mock data (only if location is available)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return MOCK_MEETUPS.filter(meetup => meetup.isJoined || meetup.hostId === userId);
};

export const getMyMessages = async (userId?: string): Promise<Meetup[]> => {
  // Return meetups with recent messages
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_MEETUPS.filter(meetup => 
    meetup.isJoined && meetup.lastMessage
  );
};

export const getMeetupById = async (meetupId: string): Promise<Meetup | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_MEETUPS.find(meetup => meetup.id === meetupId) || null;
};

export const getMessagesForMeetup = async (meetupId: string): Promise<Message[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_MESSAGES.filter(message => message.meetupId === meetupId);
};

export const joinMeetup = async (meetupId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, this would call the API
  const meetup = MOCK_MEETUPS.find(m => m.id === meetupId);
  if (meetup) {
    meetup.isJoined = true;
    meetup.attendeeCount += 1;
    return true;
  }
  return false;
};

export const leaveMeetup = async (meetupId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const meetup = MOCK_MEETUPS.find(m => m.id === meetupId);
  if (meetup && meetup.hostId !== userId) {
    meetup.isJoined = false;
    meetup.attendeeCount = Math.max(0, meetup.attendeeCount - 1);
    return true;
  }
  return false;
};

export const searchMeetups = async (query: string, userId?: string): Promise<Meetup[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const meetups = await getMyMeetups(userId);
  if (!query.trim()) return meetups;
  
  return meetups.filter(meetup =>
    meetup.title.toLowerCase().includes(query.toLowerCase()) ||
    meetup.description?.toLowerCase().includes(query.toLowerCase())
  );
};

// Create meetup request interface
export interface CreateMeetupRequest {
  title: string;
  desc?: string;
  start_ts: string; // ISO string
  end_ts: string; // ISO string
  lat: number;
  lng: number;
  visibility: 'private' | 'public';
  token_ttl_hours?: number;
}

// Create meetup response interface
export interface CreateMeetupResponse {
  meetup_id: string;
  token: string;
  deep_link: string;
  success: boolean;
}

// Create a new meetup
export const createMeetup = async (request: CreateMeetupRequest): Promise<CreateMeetupResponse> => {
  const { createMeetup: apiCreateMeetup } = await import('./api');
  return apiCreateMeetup(request);
};

// Send a message to a meetup
export const sendMessageToMeetup = async (meetupId: string, userId: string, message: string, messageType: 'text' | 'announcement' = 'text'): Promise<boolean> => {
  try {
    const { sendMessage } = await import('./api');
    const response = await sendMessage({
      meetup_id: meetupId,
      user_id: userId,
      message: message,
      message_type: messageType
    });
    return response.success;
  } catch (error) {
    console.error('Failed to send message:', error);
    return false;
  }
};

// Get messages for a meetup
export const getMeetupMessages = async (meetupId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> => {
  try {
    const { getMessages } = await import('./api');
    const response = await getMessages({
      meetup_id: meetupId,
      user_id: userId,
      limit: limit,
      offset: offset
    });
    
    // Convert API response to our Message interface
    return response.messages.map((msg: any) => ({
      id: msg.id,
      meetupId: msg.meetup_id,
      text: msg.message,
      senderId: msg.user_id,
      senderName: msg.user_name,
      timestamp: new Date(msg.timestamp),
      type: msg.message_type === 'announcement' ? 'announcement' : 'chat'
    }));
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
};
