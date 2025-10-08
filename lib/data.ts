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
  locationName?: string;
  attendeeCount: number;
  hostId: string;
  hostName: string;
  isJoined: boolean;
  isHost: boolean;
  wasEverJoined: boolean; // Track if user was ever a member
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

// Penn campus locations and coordinates with names - Updated with accurate GPS coordinates
const PENN_LOCATIONS = {
  // Main campus area - Core academic buildings
  collegeHall: { lat: 39.9522, lng: -75.1932, name: 'College Hall' },
  vanPelt: { lat: 39.9518, lng: -75.1925, name: 'Van Pelt Library' },
  huntsman: { lat: 39.9515, lng: -75.1920, name: 'Huntsman Hall' },
  wharton: { lat: 39.9510, lng: -75.1915, name: 'Wharton School' },
  engineering: { lat: 39.9505, lng: -75.1910, name: 'Engineering Quad' },
  annenberg: { lat: 39.9500, lng: -75.1905, name: 'Annenberg Center' },
  towne: { lat: 39.9508, lng: -75.1912, name: 'Towne Building' },
  moore: { lat: 39.9512, lng: -75.1918, name: 'Moore Building' },
  davidRittenhouse: { lat: 39.9516, lng: -75.1922, name: 'David Rittenhouse Labs' },
  
  // Dining and social areas
  houstonHall: { lat: 39.9515, lng: -75.1935, name: 'Houston Hall' },
  ikeLounge: { lat: 39.9510, lng: -75.1940, name: 'Ike Lounge' },
  franklinField: { lat: 39.9495, lng: -75.1920, name: 'Franklin Field' },
  pennMuseum: { lat: 39.9485, lng: -75.1910, name: 'Penn Museum' },
  irvineAuditorium: { lat: 39.9518, lng: -75.1945, name: 'Irvine Auditorium' },
  harrisonCollegeHouse: { lat: 39.9512, lng: -75.1942, name: 'Harrison College House' },
  hillCollegeHouse: { lat: 39.9508, lng: -75.1945, name: 'Hill College House' },
  stoufferCollegeHouse: { lat: 39.9505, lng: -75.1948, name: 'Stouffer College House' },
  
  // Libraries and study spaces
  fisherFineArts: { lat: 39.9519, lng: -75.1928, name: 'Fisher Fine Arts Library' },
  biotech: { lat: 39.9502, lng: -75.1908, name: 'Biotech Commons' },
  levinBuilding: { lat: 39.9503, lng: -75.1913, name: 'Levin Building' },
  
  // Off-campus but nearby
  universityCity: { lat: 39.9525, lng: -75.1950, name: 'University City' },
  rittenhouse: { lat: 39.9495, lng: -75.1720, name: 'Rittenhouse Square' },
  centerCity: { lat: 39.9520, lng: -75.1650, name: 'Center City' },
  walnutStreet: { lat: 39.9515, lng: -75.1700, name: 'Walnut Street' },
  spruceStreet: { lat: 39.9500, lng: -75.1700, name: 'Spruce Street' },
  locustWalk: { lat: 39.9510, lng: -75.1925, name: 'Locust Walk' },
};

// Mock data factory - generates realistic meetups around user location
const createMockMeetups = (userLat: number, userLng: number): Meetup[] => {
  const now = Date.now();
  
  // Generate locations around user's actual location (within ~2km radius)
  // Using offsets in degrees (roughly 0.01 degree = ~1.1km at mid-latitudes)
  const generateNearbyLocation = (latOffset: number, lngOffset: number) => ({
    lat: userLat + latOffset,
    lng: userLng + lngOffset,
  });
  
  const locations = {
    location1: { ...generateNearbyLocation(0.002, 0.002), name: 'Coffee Shop' },
    location2: { ...generateNearbyLocation(-0.003, 0.001), name: 'Library' },
    location3: { ...generateNearbyLocation(0.001, -0.002), name: 'Student Center' },
    location4: { ...generateNearbyLocation(-0.002, -0.003), name: 'Study Room' },
    location5: { ...generateNearbyLocation(0.003, 0.001), name: 'Campus Building' },
    location6: { ...generateNearbyLocation(0.001, 0.003), name: 'Business School' },
    location7: { ...generateNearbyLocation(-0.001, 0.002), name: 'Engineering Quad' },
    location8: { ...generateNearbyLocation(0.004, -0.001), name: 'Arts Center' },
    location9: { ...generateNearbyLocation(-0.004, 0.002), name: 'Sports Field' },
    location10: { ...generateNearbyLocation(0.002, -0.004), name: 'Community Center' },
  };
  
  return [
    // Academic Study Groups
    {
      id: '1',
      title: 'PennApps Demo Meetup',
      description: 'Showcase your hackathon projects and see what others built!',
      startTime: new Date(now + 15 * 60 * 1000),
      endTime: new Date(now + 2 * 60 * 60 * 1000),
      latitude: locations.location7.lat,
      longitude: locations.location7.lng,
      locationName: locations.location7.name,
      attendeeCount: 3,
      hostId: 'host1',
      hostName: 'PennApps Team',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'Welcome to the PennApps Demo Meetup!',
        timestamp: new Date(now - 10 * 60 * 1000),
        senderName: 'PennApps Team',
      },
    },
    {
      id: '2',
      title: 'CS 101 Study Group',
      description: 'Midterm prep session for CS 101. Focus on recursion, data structures, and algorithms.',
      startTime: new Date(now + 30 * 60 * 1000),
      endTime: new Date(now + 3 * 60 * 60 * 1000),
      latitude: locations.location2.lat,
      longitude: locations.location2.lng,
      locationName: locations.location2.name,
      attendeeCount: 8,
      hostId: 'host2',
      hostName: 'Alex Chen',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'Quick question - for the fibonacci sequence, is it better to use recursion or iteration? I\'m getting different performance results',
        timestamp: new Date(now - 5 * 60 * 1000),
        senderName: 'Lisa Wang',
      },
    },
    {
      id: '3',
      title: 'Coffee Chat',
      description: 'Casual coffee meetup for networking and conversation. Free coffee provided!',
      startTime: new Date(now + 45 * 60 * 1000),
      endTime: new Date(now + 2 * 60 * 60 * 1000),
      latitude: locations.location1.lat,
      longitude: locations.location1.lng,
      locationName: locations.location1.name,
      attendeeCount: 15,
      hostId: 'host3',
      hostName: 'Coffee Club',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'See you at the coffee shop!',
        timestamp: new Date(now - 60 * 60 * 1000),
        senderName: 'Coffee Club',
      },
    },
    {
      id: '4',
      title: 'Private Study Session',
      description: 'One-on-one study session for advanced topics. By invitation only.',
      startTime: new Date(now + 3 * 60 * 60 * 1000),
      endTime: new Date(now + 5 * 60 * 60 * 1000),
      latitude: locations.location4.lat,
      longitude: locations.location4.lng,
      locationName: locations.location4.name,
      attendeeCount: 2,
      hostId: 'user7',
      hostName: 'David Kim',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'Can we meet at 3pm?',
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        senderName: 'David Kim',
      },
    },
    {
      id: '5',
      title: 'Calculus Study Session',
      description: 'Math 104 study group. Bring calculators!',
      startTime: new Date(now + 2 * 60 * 60 * 1000),
      endTime: new Date(now + 4 * 60 * 60 * 1000),
      latitude: locations.location5.lat,
      longitude: locations.location5.lng,
      locationName: locations.location5.name,
      attendeeCount: 15,
      hostId: 'host5',
      hostName: 'David Kim',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Wharton Business Events
    {
      id: '6',
      title: 'Wharton Coffee Chat',
      description: 'Networking event for business students. Free coffee and pastries provided!',
      startTime: new Date(now + 60 * 60 * 1000),
      endTime: new Date(now + 2 * 60 * 60 * 1000),
      latitude: locations.location6.lat,
      longitude: locations.location6.lng,
      locationName: locations.location6.name,
      attendeeCount: 25,
      hostId: 'host4',
      hostName: 'Sarah Johnson',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '7',
      title: 'Investment Banking Workshop',
      description: 'Learn about investment banking careers in Huntsman Hall',
      startTime: new Date(now + 3 * 60 * 60 * 1000),
      endTime: new Date(now + 5 * 60 * 60 * 1000),
      latitude: locations.location6.lat,
      longitude: locations.location6.lng,
      attendeeCount: 40,
      hostId: 'host5',
      hostName: 'Wharton Finance Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '8',
      title: 'Case Study Competition',
      description: 'Business case study competition in David Rittenhouse Labs',
      startTime: new Date(now + 6 * 60 * 60 * 1000),
      endTime: new Date(now + 8 * 60 * 60 * 1000),
      latitude: locations.location8.lat,
      longitude: locations.location8.lng,
      attendeeCount: 30,
      hostId: 'host6',
      hostName: 'Business Society',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Engineering & Tech Events
    {
      id: '9',
      title: 'PennApps XXVI 2025',
      description: 'PennApps XXVI - Fall 2025 Hackathon! 36-hour coding marathon at the Engineering Quad. Free food, workshops, and networking. Open to all students. Register now!',
      startTime: new Date('2025-09-19T18:00:00Z'), // Friday 6 PM EST
      endTime: new Date('2025-09-21T06:00:00Z'),   // Sunday 6 AM EST (36 hours)
      latitude: locations.location7.lat,
      longitude: locations.location7.lng,
      locationName: locations.location7.name,
      attendeeCount: 1200,
      hostId: 'host7',
      hostName: 'PennApps Team',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
      lastMessage: {
        text: 'PennApps XXVI registration is LIVE! 1200+ hackers expected.',
        timestamp: new Date(now - 10 * 60 * 1000),
        senderName: 'PennApps Team',
      },
    },
    {
      id: '10',
      title: 'Robotics Club Demo',
      description: 'Student-built robots showcase in Towne Building',
      startTime: new Date(now + 4 * 60 * 60 * 1000),
      endTime: new Date(now + 6 * 60 * 60 * 1000),
      latitude: locations.location7.lat,
      longitude: locations.location7.lng,
      attendeeCount: 35,
      hostId: 'host8',
      hostName: 'Penn Robotics',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '11',
      title: 'AI Workshop',
      description: 'Machine learning workshop in Levin Building',
      startTime: new Date(now + 8 * 60 * 60 * 1000),
      endTime: new Date(now + 10 * 60 * 60 * 1000),
      latitude: locations.location5.lat,
      longitude: locations.location5.lng,
      attendeeCount: 20,
      hostId: 'host9',
      hostName: 'AI Society',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Arts & Culture Events
    {
      id: '12',
      title: 'Film Screening',
      description: 'Student film showcase in the Annenberg Center. Popcorn and drinks provided!',
      startTime: new Date(now + 4 * 60 * 60 * 1000),
      endTime: new Date(now + 6 * 60 * 60 * 1000),
      latitude: locations.location8.lat,
      longitude: locations.location8.lng,
      attendeeCount: 45,
      hostId: 'host10',
      hostName: 'Film Society',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '13',
      title: 'Penn Jazz Ensemble Concert',
      description: 'Fall semester concert at Irvine Auditorium',
      startTime: new Date(now + 12 * 60 * 60 * 1000),
      endTime: new Date(now + 14 * 60 * 60 * 1000),
      latitude: locations.location8.lat,
      longitude: locations.location8.lng,
      attendeeCount: 180,
      hostId: 'host11',
      hostName: 'Penn Music',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '14',
      title: 'Art Gallery Opening',
      description: 'Student art exhibition in Fisher Fine Arts Library',
      startTime: new Date(now + 16 * 60 * 60 * 1000),
      endTime: new Date(now + 18 * 60 * 60 * 1000),
      latitude: locations.location2.lat,
      longitude: locations.location2.lng,
      attendeeCount: 60,
      hostId: 'host12',
      hostName: 'Art Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Sports & Fitness
    {
      id: '15',
      title: 'Group Workout',
      description: 'Group fitness session at Franklin Field. All fitness levels welcome!',
      startTime: new Date(now + 6 * 60 * 60 * 1000),
      endTime: new Date(now + 7 * 60 * 60 * 1000),
      latitude: locations.location9.lat,
      longitude: locations.location9.lng,
      attendeeCount: 18,
      hostId: 'host13',
      hostName: 'Fitness Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '16',
      title: 'Penn Quakers Basketball Game',
      description: 'Home game vs Princeton - Ivy League rivalry at the Palestra',
      startTime: new Date(now + 20 * 60 * 60 * 1000),
      endTime: new Date(now + 22 * 60 * 60 * 1000),
      latitude: locations.location9.lat,
      longitude: locations.location9.lng,
      attendeeCount: 1200,
      hostId: 'host14',
      hostName: 'Penn Athletics',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '17',
      title: 'Intramural Soccer',
      description: 'Intramural soccer game at Franklin Field',
      startTime: new Date(now + 10 * 60 * 60 * 1000),
      endTime: new Date(now + 11 * 60 * 60 * 1000),
      latitude: locations.location9.lat,
      longitude: locations.location9.lng,
      attendeeCount: 22,
      hostId: 'host15',
      hostName: 'Intramural Sports',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Social & Gaming Events
    {
      id: '16',
      title: 'Study Break',
      description: 'Relaxing study break with board games and snacks in Houston Hall.',
      startTime: new Date(now + 8 * 60 * 60 * 1000),
      endTime: new Date(now + 10 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 22,
      hostId: 'host16',
      hostName: 'Student Activities',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '17',
      title: 'Game Night',
      description: 'Video game tournament and board game night in the Ike Lounge.',
      startTime: new Date(now + 14 * 60 * 60 * 1000),
      endTime: new Date(now + 18 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 35,
      hostId: 'host17',
      hostName: 'Gaming Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '18',
      title: 'Trivia Night',
      description: 'Weekly trivia night in Harrison College House',
      startTime: new Date(now + 18 * 60 * 60 * 1000),
      endTime: new Date(now + 20 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 50,
      hostId: 'host18',
      hostName: 'Harrison House',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Cultural & International Events
    {
      id: '19',
      title: 'International Students Mixer',
      description: 'Cultural exchange event in Hill College House',
      startTime: new Date(now + 22 * 60 * 60 * 1000),
      endTime: new Date(now + 24 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 65,
      hostId: 'host19',
      hostName: 'International Students',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '20',
      title: 'Museum Tour',
      description: 'Guided tour of the Penn Museum with focus on ancient artifacts.',
      startTime: new Date(now + 12 * 60 * 60 * 1000),
      endTime: new Date(now + 13 * 60 * 60 * 1000),
      latitude: locations.location10.lat,
      longitude: locations.location10.lng,
      attendeeCount: 30,
      hostId: 'host20',
      hostName: 'Museum Staff',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '21',
      title: 'Language Exchange',
      description: 'Practice different languages with native speakers in Stouffer College House',
      startTime: new Date(now + 26 * 60 * 60 * 1000),
      endTime: new Date(now + 28 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 25,
      hostId: 'host21',
      hostName: 'Language Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Off-Campus Events
    {
      id: '22',
      title: 'Scenic Walk',
      description: 'Scenic walk through Rittenhouse Square and Center City. Great for photos!',
      startTime: new Date(now + 20 * 60 * 60 * 1000),
      endTime: new Date(now + 22 * 60 * 60 * 1000),
      latitude: locations.location1.lat,
      longitude: locations.location1.lng,
      attendeeCount: 15,
      hostId: 'host22',
      hostName: 'Photography Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '23',
      title: 'Food Tour',
      description: 'Explore Philadelphia\'s best food spots in Center City',
      startTime: new Date(now + 24 * 60 * 60 * 1000),
      endTime: new Date(now + 26 * 60 * 60 * 1000),
      latitude: locations.location1.lat,
      longitude: locations.location1.lng,
      attendeeCount: 20,
      hostId: 'host23',
      hostName: 'Food Society',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '24',
      title: 'Group Shopping',
      description: 'Group shopping trip to Walnut Street shops',
      startTime: new Date(now + 28 * 60 * 60 * 1000),
      endTime: new Date(now + 30 * 60 * 60 * 1000),
      latitude: locations.location1.lat,
      longitude: locations.location1.lng,
      attendeeCount: 12,
      hostId: 'host24',
      hostName: 'Shopping Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },

    // Special Interest Groups
    {
      id: '25',
      title: 'Debate Society Practice',
      description: 'Weekly debate practice session in College Hall',
      startTime: new Date(now + 30 * 60 * 60 * 1000),
      endTime: new Date(now + 32 * 60 * 60 * 1000),
      latitude: locations.location7.lat,
      longitude: locations.location7.lng,
      attendeeCount: 18,
      hostId: 'host25',
      hostName: 'Debate Society',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '26',
      title: 'Sustainability Club Cleanup',
      description: 'Campus cleanup and environmental awareness event',
      startTime: new Date(now + 32 * 60 * 60 * 1000),
      endTime: new Date(now + 34 * 60 * 60 * 1000),
      latitude: locations.location3.lat,
      longitude: locations.location3.lng,
      attendeeCount: 35,
      hostId: 'host26',
      hostName: 'Sustainability Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '27',
      title: 'Pre-Med Study Group',
      description: 'MCAT prep session for organic chemistry in Biotech Commons',
      startTime: new Date(now + 34 * 60 * 60 * 1000),
      endTime: new Date(now + 36 * 60 * 60 * 1000),
      latitude: locations.location5.lat,
      longitude: locations.location5.lng,
      attendeeCount: 22,
      hostId: 'host27',
      hostName: 'Pre-Med Society',
      isJoined: true,
      isHost: false,
      wasEverJoined: true,
      eventImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
    {
      id: '28',
      title: 'Political Science Forum',
      description: 'Discussion on current political events in College Hall',
      startTime: new Date(now + 36 * 60 * 60 * 1000),
      endTime: new Date(now + 38 * 60 * 60 * 1000),
      latitude: locations.location7.lat,
      longitude: locations.location7.lng,
      attendeeCount: 30,
      hostId: 'host28',
      hostName: 'Political Science Club',
      isJoined: false,
      isHost: false,
      wasEverJoined: false,
      eventImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop&q=80&auto=format&fm=webp',
    },
  ];
};

// Store for mock meetups (only populated when location is available)
let MOCK_MEETUPS: Meetup[] = [];
let MOCK_MEETUPS_INITIALIZED = false;

// Function to get a relevant image based on event title/description
const getEventImage = (title: string, description?: string): string => {
  const text = (title + ' ' + (description || '')).toLowerCase();
  console.log('getEventImage: Analyzing text:', text);
  
  // Add timestamp to force cache refresh
  const timestamp = Date.now();
  
  // TEST: If title contains "TEST", return a very obvious different image
  if (text.includes('test')) {
    console.log('getEventImage: TEST MODE - returning test image');
    return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Mountain landscape for testing
  }
  
  // SIMPLE TEST: If title contains "SIMPLE", return a completely different image
  if (text.includes('simple')) {
    console.log('getEventImage: SIMPLE TEST MODE - returning simple test image');
    return `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Gym/fitness image for testing
  }
  
  // RED TEST: If title contains "RED", return a red image
  if (text.includes('red')) {
    console.log('getEventImage: RED TEST MODE - returning red test image');
    return `https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Red image for testing
  }
  
  // BLUE TEST: If title contains "BLUE", return a blue image
  if (text.includes('blue')) {
    console.log('getEventImage: BLUE TEST MODE - returning blue test image');
    return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Blue image for testing
  }
  
  // Study/Education related
  if (text.includes('study') || text.includes('class') || text.includes('learn') || text.includes('course')) {
    console.log('getEventImage: Selected study image');
    return `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Books/study image
  }
  
  // Hackathon/Programming related
  if (text.includes('hackathon') || text.includes('code') || text.includes('programming') || text.includes('tech') || text.includes('app')) {
    console.log('getEventImage: Selected hackathon/tech image');
    return `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Coding/laptop image
  }
  
  // Coffee/Networking related
  if (text.includes('coffee') || text.includes('networking') || text.includes('chat') || text.includes('meet')) {
    console.log('getEventImage: Selected coffee/networking image');
    return `https://images.unsplash.com/photo-1509048191080-dc6b4c3df1e5?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`; // Coffee cup image
  }
  
  // Food related
  if (text.includes('food') || text.includes('eat') || text.includes('lunch') || text.includes('dinner') || text.includes('meal')) {
    console.log('getEventImage: Selected food image');
    return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`;
  }
  
  // Sports/Fitness related
  if (text.includes('sport') || text.includes('gym') || text.includes('fitness') || text.includes('run') || text.includes('workout')) {
    console.log('getEventImage: Selected sports/fitness image');
    return `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`;
  }
  
  // Music/Entertainment related
  if (text.includes('music') || text.includes('concert') || text.includes('party') || text.includes('dance') || text.includes('fun')) {
    console.log('getEventImage: Selected music/entertainment image');
    return `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`;
  }
  
  // Default to a general meeting/event image
  console.log('getEventImage: Selected default image');
  return `https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop&q=80&auto=format&fm=webp&t=${timestamp}`;
};

const MOCK_MESSAGES: Message[] = [
  // PennApps Demo Meetup messages
  {
    id: '1',
    meetupId: '1',
    text: 'Welcome to the PennApps Demo Meetup!',
    senderId: 'host1',
    senderName: 'PennApps Team',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    type: 'announcement',
  },
  {
    id: '2',
    meetupId: '1',
    text: 'Looking forward to seeing everyone\'s projects!',
    senderId: 'user1',
    senderName: 'Sarah Kim',
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    type: 'chat',
  },
  {
    id: '3',
    meetupId: '1',
    text: 'Same here! This is going to be awesome',
    senderId: 'user2',
    senderName: 'Mike Johnson',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    type: 'chat',
  },

  // CS 101 Study Group conversation - authentic multi-person discussion
  {
    id: '4',
    meetupId: '2',
    text: 'Hey everyone! Welcome to our CS 101 study group. We\'ll be meeting in Van Pelt Library Room 219 at 2pm.',
    senderId: 'host2',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'announcement',
  },
  {
    id: '5',
    meetupId: '2',
    text: 'Thanks Alex! I\'m struggling with the recursion homework. Anyone else having trouble?',
    senderId: 'user3',
    senderName: 'Sarah Kim',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
    type: 'chat',
  },
  {
    id: '6',
    meetupId: '2',
    text: 'Same here! The factorial function is confusing me',
    senderId: 'user4',
    senderName: 'Mike Johnson',
    timestamp: new Date(Date.now() - 85 * 60 * 1000), // 85 minutes ago
    type: 'chat',
  },
  {
    id: '7',
    meetupId: '2',
    text: 'I\'m also stuck on the binary search recursion problem',
    senderId: 'user5',
    senderName: 'Emma Davis',
    timestamp: new Date(Date.now() - 80 * 60 * 1000), // 80 minutes ago
    type: 'chat',
  },
  {
    id: '8',
    meetupId: '2',
    text: 'The base case keeps confusing me. When do I stop the recursion?',
    senderId: 'user6',
    senderName: 'Lisa Wang',
    timestamp: new Date(Date.now() - 75 * 60 * 1000), // 75 minutes ago
    type: 'chat',
  },
  {
    id: '9',
    meetupId: '2',
    text: 'I think I understand it but I keep getting stack overflow errors',
    senderId: 'user7',
    senderName: 'David Kim',
    timestamp: new Date(Date.now() - 70 * 60 * 1000), // 70 minutes ago
    type: 'chat',
  },
  {
    id: '10',
    meetupId: '2',
    text: 'Anyone know how to trace through a recursive call step by step?',
    senderId: 'user3',
    senderName: 'Sarah Kim',
    timestamp: new Date(Date.now() - 65 * 60 * 1000), // 65 minutes ago
    type: 'chat',
  },
  {
    id: '11',
    meetupId: '2',
    text: 'I\'m bringing my laptop to work on this together',
    senderId: 'user4',
    senderName: 'Mike Johnson',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 60 minutes ago
    type: 'chat',
  },
  {
    id: '12',
    meetupId: '2',
    text: 'Same! Maybe we can debug together',
    senderId: 'user5',
    senderName: 'Emma Davis',
    timestamp: new Date(Date.now() - 55 * 60 * 1000), // 55 minutes ago
    type: 'chat',
  },
  {
    id: '13',
    meetupId: '2',
    text: 'Don\'t forget to bring your laptops and CS 101 textbook!',
    senderId: 'host2',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: 'announcement',
  },
  {
    id: '14',
    meetupId: '2',
    text: 'Quick question - for the fibonacci sequence, is it better to use recursion or iteration? I\'m getting different performance results',
    senderId: 'user6',
    senderName: 'Lisa Wang',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    type: 'chat',
  },

  // Coffee Chat messages
  {
    id: '16',
    meetupId: '3',
    text: 'See you at the coffee shop!',
    senderId: 'host3',
    senderName: 'Coffee Club',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    type: 'chat',
  },
  {
    id: '17',
    meetupId: '3',
    text: 'Looking forward to it!',
    senderId: 'user6',
    senderName: 'Lisa Wang',
    timestamp: new Date(Date.now() - 55 * 60 * 1000), // 55 minutes ago
    type: 'chat',
  },

  // Private Study Session messages
  {
    id: '18',
    meetupId: '4',
    text: 'Can we meet at 3pm?',
    senderId: 'user7',
    senderName: 'David Kim',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'chat',
  },
  {
    id: '19',
    meetupId: '4',
    text: 'That works for me!',
    senderId: 'user-1', // This is "You"
    senderName: 'You',
    timestamp: new Date(Date.now() - 115 * 60 * 1000), // 115 minutes ago
    type: 'chat',
  },
];

// Initialize mock data with user location
export const initializeMockData = (userLat: number, userLng: number): void => {
  // Only initialize once to preserve user-created meetups
  if (!MOCK_MEETUPS_INITIALIZED) {
    console.log('Data: Initializing mock data at user location:', userLat, userLng);
    
    // Always use the actual user location to generate meetups nearby
    MOCK_MEETUPS = createMockMeetups(userLat, userLng);
    
    MOCK_MEETUPS_INITIALIZED = true;
  } else {
    console.log('Data: Mock data already initialized, preserving', MOCK_MEETUPS.length, 'meetups');
  }
};

// Utility function to calculate distance between two points in meters
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export const getMyMeetups = async (userId?: string): Promise<Meetup[]> => {
  // In a real app, this would query Supabase
  // For now, return mock data (only if location is available)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const filteredMeetups = MOCK_MEETUPS.filter(meetup => meetup.isJoined || meetup.hostId === userId || meetup.wasEverJoined);
  console.log('Data: getMyMeetups returning', filteredMeetups.length, 'meetups for user', userId);
  return filteredMeetups;
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
    // Check if user is already a member
    if (meetup.isJoined) {
      return false; // Already joined
    }
    
    // Join the meetup
    meetup.isJoined = true;
    meetup.wasEverJoined = true;
    meetup.attendeeCount += 1;
    return true;
  }
  return false;
};

export const leaveMeetup = async (meetupId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const meetup = MOCK_MEETUPS.find(m => m.id === meetupId);
  if (meetup && meetup.hostId !== userId) {
    // Check if user is actually a member
    if (!meetup.isJoined) {
      return false; // Not a member
    }
    
    // Leave the meetup (but don't remove it from the list)
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
  photo?: string; // Camera photo URI
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
  try {
    const { createMeetup: apiCreateMeetup } = await import('./api');
    const response = await apiCreateMeetup(request);
    
    console.log('Data: API response for createMeetup:', response);
    
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
        locationName: 'Custom Location', // Will be updated with reverse geocoding
        attendeeCount: 1, // Creator is the first attendee
        hostId: 'user-1', // Mock user ID - in real app this would come from auth
        hostName: 'You', // In real app this would come from user profile
        isJoined: true,
        isHost: true,
        wasEverJoined: true,
        eventImage: (() => {
          // Use camera photo if provided, otherwise use smart selection
          if (request.photo) {
            console.log('createMeetup: Using camera photo:', request.photo);
            return request.photo;
          } else {
            console.log('createMeetup: Selecting image for title:', request.title, 'description:', request.desc);
            const imageUrl = getEventImage(request.title, request.desc);
            console.log('createMeetup: Selected image URL:', imageUrl);
            return imageUrl;
          }
        })(), // Use camera photo or smart image selection
      };
      
      // Add to mock meetups array
      MOCK_MEETUPS.push(newMeetup);
      console.log('Data: Added new meetup to MOCK_MEETUPS:', newMeetup.title, 'Total meetups:', MOCK_MEETUPS.length);
    } else {
      console.log('Data: API call failed or returned no meetup_id, response:', response);
    }
    
    return response;
  } catch (error) {
    console.error('Data: Error in createMeetup:', error);
    // Return a mock response for offline mode
    const mockMeetupId = `mock-${Date.now()}`;
    const newMeetup: Meetup = {
      id: mockMeetupId,
      title: request.title,
      description: request.desc,
      startTime: new Date(request.start_ts),
      endTime: new Date(request.end_ts),
      latitude: request.lat,
      longitude: request.lng,
      locationName: 'Custom Location',
      attendeeCount: 1,
      hostId: 'user-1',
      hostName: 'You',
      isJoined: true,
      isHost: true,
      wasEverJoined: true,
      eventImage: (() => {
        // Use camera photo if provided, otherwise use smart selection
        if (request.photo) {
          console.log('createMeetup (fallback): Using camera photo:', request.photo);
          return request.photo;
        } else {
          console.log('createMeetup (fallback): Selecting image for title:', request.title, 'description:', request.desc);
          const imageUrl = getEventImage(request.title, request.desc);
          console.log('createMeetup (fallback): Selected image URL:', imageUrl);
          return imageUrl;
        }
      })(), // Use camera photo or smart image selection
    };
    
    // Add to mock meetups array even if API fails
    MOCK_MEETUPS.push(newMeetup);
    console.log('Data: Added mock meetup due to API error:', newMeetup.title, 'Total meetups:', MOCK_MEETUPS.length);
    
    return {
      success: true,
      meetup_id: mockMeetupId,
      token: 'mock-token',
      deep_link: 'pennapps://join/mock-token',
    };
  }
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
  // For CS 101 Study Group (meetupId '2'), always use mock data for demo
  if (meetupId === '2') {
    console.log('Using mock data for CS 101 Study Group demo');
    const mockMessages = MOCK_MESSAGES.filter(msg => msg.meetupId === meetupId);
    // Store mock messages locally for future use
    if (mockMessages.length > 0) {
      await storeMessagesLocally(meetupId, mockMessages);
    }
    return mockMessages.slice(offset, offset + limit);
  }

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
    
    // If local storage is empty, fall back to mock data
    if (localMessages.length === 0) {
      console.log('No local messages found, using mock data for meetup:', meetupId);
      const mockMessages = MOCK_MESSAGES.filter(msg => msg.meetupId === meetupId);
      // Store mock messages locally for future use
      if (mockMessages.length > 0) {
        await storeMessagesLocally(meetupId, mockMessages);
      }
      return mockMessages.slice(offset, offset + limit);
    }
    
    // Return local messages if API fails
    return localMessages.slice(offset, offset + limit);
  }
};
