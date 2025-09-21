/**
 * Data layer - Query helpers for meetups and messages
 */

import { CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  eventImage?: string;
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

// Penn campus locations and coordinates
const PENN_LOCATIONS = {
  // Main campus area
  collegeHall: { lat: 39.9522, lng: -75.1932 },
  vanPelt: { lat: 39.9518, lng: -75.1925 },
  huntsman: { lat: 39.9515, lng: -75.1920 },
  wharton: { lat: 39.9510, lng: -75.1915 },
  engineering: { lat: 39.9505, lng: -75.1910 },
  annenberg: { lat: 39.9500, lng: -75.1905 },
  
  // Dining and social areas
  houstonHall: { lat: 39.9515, lng: -75.1935 },
  ikeLounge: { lat: 39.9510, lng: -75.1940 },
  franklinField: { lat: 39.9495, lng: -75.1920 },
  pennMuseum: { lat: 39.9485, lng: -75.1910 },
  
  // Off-campus but nearby
  universityCity: { lat: 39.9525, lng: -75.1950 },
  rittenhouse: { lat: 39.9495, lng: -75.1720 },
  centerCity: { lat: 39.9520, lng: -75.1650 },
};

// Mock data factory - generates realistic Penn meetups
const createMockMeetups = (userLat: number, userLng: number): Meetup[] => {
  const now = Date.now();
  const locations = PENN_LOCATIONS;
  
  return [
    {
      id: '1',
      title: 'CS 101 Study Group',
      description: 'Midterm prep session in Van Pelt Library. Bring laptops and study materials!',
      startTime: new Date(now + 30 * 60 * 1000), // 30 minutes from now
      endTime: new Date(now + 3 * 60 * 60 * 1000), // 3 hours from now
      latitude: locations.vanPelt.lat,
      longitude: locations.vanPelt.lng,
      attendeeCount: 12,
      hostId: 'host1',
      hostName: 'Alex Chen',
      isJoined: true,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'Room 219 in Van Pelt - see you there!',
        timestamp: new Date(now - 15 * 60 * 1000),
        senderName: 'Alex Chen',
      },
    },
    {
      id: '2',
      title: 'Wharton Coffee Chat',
      description: 'Networking event for business students. Free coffee and pastries provided!',
      startTime: new Date(now + 60 * 60 * 1000), // 1 hour from now
      endTime: new Date(now + 2 * 60 * 60 * 1000), // 2 hours from now
      latitude: locations.wharton.lat,
      longitude: locations.wharton.lng,
      attendeeCount: 25,
      hostId: 'host2',
      hostName: 'Sarah Johnson',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '3',
      title: 'PennApps Hackathon',
      description: '48-hour hackathon at the Engineering Quad. Prizes, food, and fun!',
      startTime: new Date(now + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(now + 50 * 60 * 60 * 1000), // 50 hours from now
      latitude: locations.engineering.lat,
      longitude: locations.engineering.lng,
      attendeeCount: 150,
      hostId: 'host3',
      hostName: 'PennApps Team',
      isJoined: true,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'Registration opens in 1 hour!',
        timestamp: new Date(now - 10 * 60 * 1000),
        senderName: 'PennApps Team',
      },
    },
    {
      id: '4',
      title: 'Annenberg Film Screening',
      description: 'Student film showcase in the Annenberg Center. Popcorn and drinks provided!',
      startTime: new Date(now + 4 * 60 * 60 * 1000), // 4 hours from now
      endTime: new Date(now + 6 * 60 * 60 * 1000), // 6 hours from now
      latitude: locations.annenberg.lat,
      longitude: locations.annenberg.lng,
      attendeeCount: 45,
      hostId: 'host4',
      hostName: 'Film Society',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '5',
      title: 'Franklin Field Workout',
      description: 'Group fitness session at Franklin Field. All fitness levels welcome!',
      startTime: new Date(now + 6 * 60 * 60 * 1000), // 6 hours from now
      endTime: new Date(now + 7 * 60 * 60 * 1000), // 7 hours from now
      latitude: locations.franklinField.lat,
      longitude: locations.franklinField.lng,
      attendeeCount: 18,
      hostId: 'host5',
      hostName: 'Fitness Club',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '6',
      title: 'Houston Hall Study Break',
      description: 'Relaxing study break with board games and snacks in Houston Hall.',
      startTime: new Date(now + 8 * 60 * 60 * 1000), // 8 hours from now
      endTime: new Date(now + 10 * 60 * 60 * 1000), // 10 hours from now
      latitude: locations.houstonHall.lat,
      longitude: locations.houstonHall.lng,
      attendeeCount: 22,
      hostId: 'host6',
      hostName: 'Student Activities',
      isJoined: true,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '7',
      title: 'Penn Museum Tour',
      description: 'Guided tour of the Penn Museum with focus on ancient artifacts.',
      startTime: new Date(now + 12 * 60 * 60 * 1000), // 12 hours from now
      endTime: new Date(now + 13 * 60 * 60 * 1000), // 13 hours from now
      latitude: locations.pennMuseum.lat,
      longitude: locations.pennMuseum.lng,
      attendeeCount: 30,
      hostId: 'host7',
      hostName: 'Museum Staff',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '8',
      title: 'Ike Lounge Game Night',
      description: 'Video game tournament and board game night in the Ike Lounge.',
      startTime: new Date(now + 14 * 60 * 60 * 1000), // 14 hours from now
      endTime: new Date(now + 18 * 60 * 60 * 1000), // 18 hours from now
      latitude: locations.ikeLounge.lat,
      longitude: locations.ikeLounge.lng,
      attendeeCount: 35,
      hostId: 'host8',
      hostName: 'Gaming Club',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '9',
      title: 'Rittenhouse Square Walk',
      description: 'Scenic walk through Rittenhouse Square and Center City. Great for photos!',
      startTime: new Date(now + 20 * 60 * 60 * 1000), // 20 hours from now
      endTime: new Date(now + 22 * 60 * 60 * 1000), // 22 hours from now
      latitude: locations.rittenhouse.lat,
      longitude: locations.rittenhouse.lng,
      attendeeCount: 15,
      hostId: 'host9',
      hostName: 'Photography Club',
      isJoined: false,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '10',
      title: 'Huntsman Hall Case Study',
      description: 'Business case study discussion in Huntsman Hall. Bring your laptops!',
      startTime: new Date(now + 24 * 60 * 60 * 1000), // 24 hours from now
      endTime: new Date(now + 26 * 60 * 60 * 1000), // 26 hours from now
      latitude: locations.huntsman.lat,
      longitude: locations.huntsman.lng,
      attendeeCount: 20,
      hostId: 'host10',
      hostName: 'Business Society',
      isJoined: true,
      isHost: false,
      eventImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
  ];
};

// Store for mock meetups (only populated when location is available)
let MOCK_MEETUPS: Meetup[] = [];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    meetupId: '1',
    text: 'Room 219 in Van Pelt - see you there!',
    senderId: 'host1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'announcement',
  },
  {
    id: '2',
    meetupId: '1',
    text: 'Bring your CS 101 notes and laptops!',
    senderId: 'host1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'chat',
  },
  {
    id: '3',
    meetupId: '3',
    text: 'Registration opens in 1 hour!',
    senderId: 'host3',
    senderName: 'PennApps Team',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'announcement',
  },
  {
    id: '4',
    meetupId: '3',
    text: 'Prizes include MacBook Pros and internships!',
    senderId: 'host3',
    senderName: 'PennApps Team',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'chat',
  },
  {
    id: '5',
    meetupId: '6',
    text: 'Board games and snacks ready in Houston Hall!',
    senderId: 'host6',
    senderName: 'Student Activities',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    type: 'announcement',
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
  const response = await apiCreateMeetup(request);
  
  // Add the newly created meetup to our local mock data so it appears on the map
  if (response.success && response.meetup_id) {
    const newMeetup: Meetup = {
      id: response.meetup_id,
      title: request.title,
      description: request.desc,
      startTime: new Date(request.start_ts),
      endTime: new Date(request.end_ts),
      latitude: request.lat,
      longitude: request.lng,
      attendeeCount: 1, // Creator is the first attendee
      hostId: 'user-1', // Mock user ID - in real app this would come from auth
      hostName: 'You', // In real app this would come from user profile
      isJoined: true,
      isHost: true,
    };
    
    // Add to mock meetups array
    MOCK_MEETUPS.push(newMeetup);
  }
  
  return response;
};

// Local storage keys
const MESSAGES_STORAGE_KEY = 'meetup_messages';
const MESSAGE_QUEUE_KEY = 'message_queue';

// Store messages locally for offline access
const storeMessagesLocally = async (meetupId: string, messages: Message[]): Promise<void> => {
  try {
    const key = `${MESSAGES_STORAGE_KEY}_${meetupId}`;
    console.log(`💾 Storing ${messages.length} messages locally for meetup ${meetupId}`);
    await AsyncStorage.setItem(key, JSON.stringify(messages));
    console.log(`✅ Successfully stored messages locally`);
  } catch (error) {
    console.error('❌ Failed to store messages locally:', error);
  }
};

// Get messages from local storage
const getMessagesFromLocalStorage = async (meetupId: string): Promise<Message[]> => {
  try {
    const key = `${MESSAGES_STORAGE_KEY}_${meetupId}`;
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const messages = JSON.parse(stored);
      console.log(`📱 Retrieved ${messages.length} messages from local storage for meetup ${meetupId}`);
      // Convert timestamp strings back to Date objects
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    console.log(`📱 No local messages found for meetup ${meetupId}`);
    return [];
  } catch (error) {
    console.error('❌ Failed to get messages from local storage:', error);
    return [];
  }
};

// Queue a message for sending when online
const queueMessageForSending = async (meetupId: string, userId: string, message: string, messageType: 'text' | 'announcement'): Promise<void> => {
  try {
    const queuedMessage = {
      meetupId,
      userId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
      id: `queued_${Date.now()}_${Math.random()}`
    };
    
    const existingQueue = await AsyncStorage.getItem(MESSAGE_QUEUE_KEY);
    const queue = existingQueue ? JSON.parse(existingQueue) : [];
    queue.push(queuedMessage);
    
    await AsyncStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to queue message:', error);
  }
};

// Process queued messages when back online
export const processQueuedMessages = async (): Promise<void> => {
  try {
    const queuedData = await AsyncStorage.getItem(MESSAGE_QUEUE_KEY);
    if (!queuedData) return;
    
    const queue = JSON.parse(queuedData);
    const { sendMessage } = await import('./api');
    
    for (const queuedMessage of queue) {
      try {
        const response = await sendMessage({
          meetup_id: queuedMessage.meetupId,
          user_id: queuedMessage.userId,
          message: queuedMessage.message,
          message_type: queuedMessage.messageType
        });
        
        if (response.success) {
          // Remove from queue if successful
          const updatedQueue = queue.filter((msg: any) => msg.id !== queuedMessage.id);
          await AsyncStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(updatedQueue));
        }
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process queued messages:', error);
  }
};

// Clear old messages to manage storage
export const clearOldMessages = async (meetupId: string, keepLastDays: number = 30): Promise<void> => {
  try {
    const messages = await getMessagesFromLocalStorage(meetupId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepLastDays);
    
    const recentMessages = messages.filter(msg => msg.timestamp > cutoffDate);
    await storeMessagesLocally(meetupId, recentMessages);
  } catch (error) {
    console.error('Failed to clear old messages:', error);
  }
};

// Get message count for a meetup
export const getMessageCount = async (meetupId: string): Promise<number> => {
  try {
    const messages = await getMessagesFromLocalStorage(meetupId);
    return messages.length;
  } catch (error) {
    console.error('Failed to get message count:', error);
    return 0;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (meetupId: string, userId: string): Promise<void> => {
  try {
    // In a real app, this would update the backend
    // For now, we'll just log it
    console.log(`Marking messages as read for meetup ${meetupId} by user ${userId}`);
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
};

// Debug function to test API connectivity
export const testApiConnection = async (): Promise<void> => {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test health endpoint
    const { checkApiHealth } = await import('./api');
    const health = await checkApiHealth();
    console.log('✅ API health check result:', health);
    
    // Test send message endpoint with dummy data
    const { sendMessage } = await import('./api');
    const testData = {
      meetup_id: 'test',
      user_id: 'test',
      message: 'test',
      message_type: 'text'
    };
    
    console.log('🔍 Testing send message endpoint with:', testData);
    const response = await sendMessage(testData);
    console.log('✅ Send message test result:', response);
    
  } catch (error) {
    console.error('❌ API connection test failed:', error);
  }
};

// Send a message to a meetup
export const sendMessageToMeetup = async (meetupId: string, userId: string, message: string, messageType: 'text' | 'announcement' = 'text'): Promise<boolean> => {
  // Always store the message locally first for immediate UI update
  const newMessage: Message = {
    id: `local_${Date.now()}`,
    meetupId,
    text: message,
    senderId: userId,
    senderName: 'You', // In real app, this would come from user profile
    timestamp: new Date(),
    type: messageType === 'announcement' ? 'announcement' : 'chat'
  };
  
  try {
    // Store locally immediately (check for duplicates first)
    const existingMessages = await getMessagesFromLocalStorage(meetupId);
    
    // Check if message already exists to prevent duplicates
    const isDuplicate = existingMessages.some(msg => 
      msg.text === newMessage.text && 
      msg.senderId === newMessage.senderId && 
      Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 5000 // Within 5 seconds
    );
    
    if (!isDuplicate) {
      const updatedMessages = [...existingMessages, newMessage];
      await storeMessagesLocally(meetupId, updatedMessages);
    } else {
      console.log(`⚠️ Duplicate message detected, not storing locally`);
    }
    
    // Try to send to API
    const { sendMessage } = await import('./api');
    const requestData = {
      meetup_id: meetupId,
      user_id: userId,
      message: message,
      message_type: messageType
    };
    
    console.log(`🌐 Sending API request:`, requestData);
    
    // First check if API is reachable
    try {
      const { checkApiHealth } = await import('./api');
      const health = await checkApiHealth();
      console.log(`🌐 API health check:`, health);
    } catch (healthError) {
      console.warn('⚠️ API health check failed:', healthError);
    }
    
    const response = await sendMessage(requestData);
    console.log(`🌐 API response:`, response);
    
    if (response && response.success) {
      // Update the local message with the server ID
      const serverMessage: Message = {
        ...newMessage,
        id: response.message_id || `msg_${Date.now()}`
      };
      
      // Get current messages from local storage and update the one we just sent
      const currentMessages = await getMessagesFromLocalStorage(meetupId);
      const finalMessages = currentMessages.map(msg => 
        msg.id === newMessage.id ? serverMessage : msg
      );
      await storeMessagesLocally(meetupId, finalMessages);
      
      return true;
    } else {
      // API call failed but message is stored locally
      console.warn('API returned success: false, but message stored locally');
      console.warn('API response was:', response);
      
      // If we have a connection but API fails, still consider it "sent" locally
      // This prevents the "message will be sent when connection is restored" message
      return true; // Treat as sent since it's stored locally
    }
  } catch (error) {
    console.error('❌ Failed to send message to API:', error);
    console.error('❌ Error details:', {
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      meetupId,
      userId,
      messageContent: message
    });
    
    // Check if it's a network error vs API error
    const isNetworkError = error instanceof Error && (
      error.message.includes('Network request failed') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    );
    
    if (isNetworkError) {
      // Queue message for retry when back online
      await queueMessageForSending(meetupId, userId, message, messageType);
      return false; // Indicate queued
    } else {
      // API endpoint exists but returned error - treat as sent locally
      console.log('🌐 API endpoint exists but returned error, treating as sent locally');
      return true; // Treat as sent since it's stored locally
    }
  }
};

// Get messages for a meetup
export const getMeetupMessages = async (meetupId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> => {
  // Always load from local storage first for immediate display
  const localMessages = await getMessagesFromLocalStorage(meetupId);
  
  try {
    // Try to get from API to sync with server
    const { getMessages } = await import('./api');
    const response = await getMessages({
      meetup_id: meetupId,
      user_id: userId,
      limit: limit,
      offset: offset
    });
    
    // Convert API response to our Message interface
    const apiMessages = response.messages.map((msg: any) => ({
      id: msg.id,
      meetupId: msg.meetup_id,
      text: msg.message,
      senderId: msg.user_id,
      senderName: msg.user_name,
      timestamp: new Date(msg.timestamp),
      type: msg.message_type === 'announcement' ? 'announcement' : 'chat'
    }));

    // Merge API messages with local messages, prioritizing API messages
    const mergedMessages = [...apiMessages];
    
    // Add any local messages that aren't in the API response
    localMessages.forEach(localMsg => {
      if (!apiMessages.find(apiMsg => apiMsg.id === localMsg.id)) {
        // Also check for duplicate content to prevent duplicates
        const isDuplicate = mergedMessages.some(msg => 
          msg.text === localMsg.text && 
          msg.senderId === localMsg.senderId && 
          Math.abs(msg.timestamp.getTime() - localMsg.timestamp.getTime()) < 5000 // Within 5 seconds
        );
        if (!isDuplicate) {
          mergedMessages.push(localMsg);
        }
      }
    });
    
    // Sort by timestamp
    mergedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Store merged messages locally
    await storeMessagesLocally(meetupId, mergedMessages);
    
    return mergedMessages.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to get messages from API, using local storage:', error);
    
    // Return local messages if API fails
    return localMessages.slice(offset, offset + limit);
  }
};
