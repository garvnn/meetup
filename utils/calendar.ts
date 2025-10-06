/**
 * Calendar utilities for generating Google Calendar URLs
 */

import { Meetup } from '../lib/data';
import { Linking } from 'react-native';

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
  console.log('Calendar: Formatting dates - startTime:', meetup.startTime, 'endTime:', meetup.endTime);
  const startTime = formatDateForGoogleCalendar(meetup.startTime);
  const endTime = formatDateForGoogleCalendar(meetup.endTime);
  console.log('Calendar: Formatted dates - startTime:', startTime, 'endTime:', endTime);
  
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
  
  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('Calendar: Final URL:', finalUrl);
  return finalUrl;
};

/**
 * Opens the Google Calendar URL using the device's default browser/calendar app
 */
export const openGoogleCalendar = async (meetup: Meetup): Promise<void> => {
  try {
    console.log('Calendar: Generating URL for meetup:', meetup.title);
    console.log('Calendar: Meetup data:', {
      title: meetup.title,
      startTime: meetup.startTime,
      endTime: meetup.endTime,
      description: meetup.description,
      hostName: meetup.hostName,
      attendeeCount: meetup.attendeeCount,
      latitude: meetup.latitude,
      longitude: meetup.longitude
    });
    
    const url = generateGoogleCalendarUrl(meetup);
    console.log('Calendar: Generated URL:', url);
    
    // Try multiple approaches for better Expo compatibility
    let success = false;
    
    // Approach 1: Try the direct calendar URL
    try {
      const supported = await Linking.canOpenURL(url);
      console.log('Calendar: Can open URL?', supported);
      if (supported) {
        console.log('Calendar: Attempting to open URL...');
        await Linking.openURL(url);
        console.log('Calendar: Successfully opened URL');
        success = true;
      }
    } catch (error) {
      console.log('Calendar: Direct URL failed:', error);
    }
    
    // Approach 2: Try a simplified browser URL if direct approach failed
    if (!success) {
      try {
        console.log('Calendar: Trying browser fallback...');
        const browserUrl = url.replace('calendar.google.com/calendar/render', 'calendar.google.com/calendar/u/0/r/event');
        const browserSupported = await Linking.canOpenURL(browserUrl);
        console.log('Calendar: Browser URL supported?', browserSupported);
        if (browserSupported) {
          await Linking.openURL(browserUrl);
          console.log('Calendar: Opened browser URL');
          success = true;
        }
      } catch (error) {
        console.log('Calendar: Browser URL failed:', error);
      }
    }
    
    // Approach 3: Try opening in Safari/Chrome directly
    if (!success) {
      try {
        console.log('Calendar: Trying direct browser open...');
        const directUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetup.title)}&dates=${formatDateForGoogleCalendar(meetup.startTime)}/${formatDateForGoogleCalendar(meetup.endTime)}`;
        const directSupported = await Linking.canOpenURL(directUrl);
        console.log('Calendar: Direct URL supported?', directSupported);
        if (directSupported) {
          await Linking.openURL(directUrl);
          console.log('Calendar: Opened direct URL');
          success = true;
        }
      } catch (error) {
        console.log('Calendar: Direct URL failed:', error);
      }
    }
    
    if (!success) {
      throw new Error('Cannot open calendar URL - all approaches failed. The device may not support opening calendar URLs in Expo Go.');
    }
    
  } catch (error) {
    console.error('Calendar: Failed to open Google Calendar:', error);
    console.error('Calendar: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
