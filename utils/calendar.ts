/**
 * Calendar utilities for generating Google Calendar URLs
 */

import { Meetup } from '../lib/data';

/**
 * Formats a date to Google Calendar's expected format (YYYYMMDDTHHMMSSZ)
 */
const formatDateForGoogleCalendar = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates a Google Calendar URL for adding an event
 * This will open the user's default calendar app with pre-filled event details
 */
export const generateGoogleCalendarUrl = (meetup: Meetup): string => {
  const startTime = formatDateForGoogleCalendar(meetup.startTime);
  const endTime = formatDateForGoogleCalendar(meetup.endTime);
  
  // Create the event title
  const title = encodeURIComponent(meetup.title);
  
  // Create the event description
  const description = encodeURIComponent(
    `${meetup.description || ''}\n\n` +
    `Hosted by: ${meetup.hostName}\n` +
    `Attendees: ${meetup.attendeeCount}\n\n` +
    `Join this meetup to connect with other attendees!`
  );
  
  // Create the location (using coordinates for now, could be enhanced with address lookup)
  const location = encodeURIComponent(
    `Location: ${meetup.latitude.toFixed(6)}, ${meetup.longitude.toFixed(6)}`
  );
  
  // Build the Google Calendar URL
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startTime}/${endTime}`,
    details: description,
    location: location,
    trp: 'false', // Don't show as busy
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Opens the Google Calendar URL using the device's default browser/calendar app
 */
export const openGoogleCalendar = async (meetup: Meetup): Promise<void> => {
  try {
    const url = generateGoogleCalendarUrl(meetup);
    
    // Import Linking dynamically to avoid issues with React Native Web
    const { Linking } = await import('react-native');
    
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      throw new Error('Cannot open calendar URL');
    }
  } catch (error) {
    console.error('Failed to open Google Calendar:', error);
    throw error;
  }
};
