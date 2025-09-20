// Configuration constants and toggles for the private meetups app

export const CONFIG = {
  // Verification strategy
  AUTH: {
    REQUIRE_EMAIL_OTP: true,
    REQUIRE_PHONE_OTP: true,
    PROVIDER: 'clerk' as const,
  },

  // Bubble appearance thresholds
  BUBBLES: {
    THRESHOLDS: [
      { min: 0, max: 3, color: '#ffffff', size: 20 },      // White, small
      { min: 4, max: 10, color: '#e8f5e8', size: 30 },     // Light green, medium
      { min: 11, max: 50, color: '#4caf50', size: 40 },    // Green, large
      { min: 51, max: Infinity, color: '#2e7d32', size: 50 }, // Dark green, extra large
    ],
    DEFAULT_RADIUS_METERS: 100,
  },

  // Soft-ban configuration
  SOFT_BAN: {
    REPORTS_THRESHOLD: 3,
    TIME_WINDOW_MINUTES: 10,
    DURATION_HOURS: 24, // How long soft-ban lasts
  },

  // File quotas and limits
  FILES: {
    MAX_FILES_PER_MEETUP: 25,
    MAX_BYTES_PER_MEETUP: 100 * 1024 * 1024, // 100 MB
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    ALLOWED_TYPES: {
      images: ['jpg', 'jpeg', 'png', 'heic', 'webp'],
      pdf: ['pdf'],
      notes: ['txt', 'md'],
    },
  },

  // Deep linking
  DEEP_LINKS: {
    BASE_URL: process.env.EXPO_PUBLIC_APP_URL || 'https://yourapp.com',
    JOIN_PATH: '/join',
    SHARE_PATH: '/share',
  },

  // Location requirements
  LOCATION: {
    REQUIRE_LOCATION: true, // Hard gate - no fallback coordinates
    TIMEOUT_MS: 10000, // 10 seconds timeout for location fetch
  },

  // API endpoints
  API: {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
    NGROK_URL: process.env.EXPO_PUBLIC_NGROK_URL || 'https://8b5ef7372e1f.ngrok-free.app',
    ENDPOINTS: {
      HEALTH: '/health',
      ACCEPT_INVITE: '/accept_invite',
      SOFT_BAN: '/soft_ban',
      CREATE_MEETUP: '/create_meetup',
      SEND_MESSAGE: '/send_message',
      GET_MESSAGES: '/get_messages',
    },
  },

  // UI constants
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    POLLING_INTERVAL: 5000, // 5 seconds for fallback polling
  },
} as const;

// Helper functions for bubble styling
export const getBubbleColor = (attendeeCount: number): string => {
  const threshold = CONFIG.BUBBLES.THRESHOLDS.find(
    t => attendeeCount >= t.min && attendeeCount <= t.max
  );
  return threshold?.color || CONFIG.BUBBLES.THRESHOLDS[0].color;
};

export const getBubbleSize = (attendeeCount: number): number => {
  const threshold = CONFIG.BUBBLES.THRESHOLDS.find(
    t => attendeeCount >= t.min && attendeeCount <= t.max
  );
  return threshold?.size || CONFIG.BUBBLES.THRESHOLDS[0].size;
};

export const getBubbleRadiusMeters = (attendeeCount: number): number => {
  // Scale radius based on attendee count, with a minimum and maximum
  const baseRadius = CONFIG.BUBBLES.DEFAULT_RADIUS_METERS;
  const scaleFactor = Math.min(Math.max(attendeeCount / 10, 0.5), 2);
  return Math.round(baseRadius * scaleFactor);
};

// File type validation
export const isAllowedFileType = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  
  return Object.values(CONFIG.FILES.ALLOWED_TYPES)
    .flat()
    .includes(extension);
};

export const getFileType = (filename: string): 'image' | 'pdf' | 'note' | null => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  
  if (CONFIG.FILES.ALLOWED_TYPES.images.includes(extension)) return 'image';
  if (CONFIG.FILES.ALLOWED_TYPES.pdf.includes(extension)) return 'pdf';
  if (CONFIG.FILES.ALLOWED_TYPES.notes.includes(extension)) return 'note';
  
  return null;
};

// API URL helper - prioritizes ngrok URL if available
export const getApiUrl = (): string => {
  return CONFIG.API.NGROK_URL || CONFIG.API.BASE_URL;
};

// Check if we're using ngrok
export const isUsingNgrok = (): boolean => {
  return !!CONFIG.API.NGROK_URL;
};
