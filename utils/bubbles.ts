import { CONFIG, getBubbleColor, getBubbleSize, getBubbleRadiusMeters } from '../lib/config';

export interface Bubble {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  color: string;
  meetupId?: string;
  isActive: boolean;
  attendeeCount: number;
}

export interface BubbleCluster {
  center: {
    latitude: number;
    longitude: number;
  };
  bubbles: Bubble[];
  count: number;
  totalAttendees: number;
}

export class BubbleUtils {
  static generateBubbleId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Convert attendee count to white-to-green color gradient
  static whiteToGreen(attendeeCount: number): string {
    return getBubbleColor(attendeeCount);
  }

  // Get bubble radius in meters based on attendee count
  static bubbleRadiusMeters(attendeeCount: number): number {
    return getBubbleRadiusMeters(attendeeCount);
  }

  // Get bubble size for UI rendering
  static getBubbleSize(attendeeCount: number): number {
    return getBubbleSize(attendeeCount);
  }

  // Create a bubble from meetup data
  static createBubbleFromMeetup(meetup: any): Bubble {
    const attendeeCount = meetup.attendee_count || 0;
    
    return {
      id: meetup.id,
      title: meetup.title,
      description: meetup.desc || '',
      latitude: meetup.lat || CONFIG.MAP.DEFAULT_LATITUDE,
      longitude: meetup.lng || CONFIG.MAP.DEFAULT_LONGITUDE,
      radius: this.bubbleRadiusMeters(attendeeCount),
      color: this.whiteToGreen(attendeeCount),
      meetupId: meetup.id,
      isActive: !meetup.ended_at,
      attendeeCount,
    };
  }

  // Cluster bubbles based on proximity and attendee count
  static clusterBubbles(bubbles: Bubble[], maxDistance: number = 0.1): BubbleCluster[] {
    const clusters: BubbleCluster[] = [];
    const processed = new Set<string>();

    bubbles.forEach((bubble) => {
      if (processed.has(bubble.id)) return;

      const cluster: BubbleCluster = {
        center: {
          latitude: bubble.latitude,
          longitude: bubble.longitude,
        },
        bubbles: [bubble],
        count: 1,
        totalAttendees: bubble.attendeeCount,
      };

      // Find nearby bubbles
      bubbles.forEach((otherBubble) => {
        if (
          otherBubble.id !== bubble.id &&
          !processed.has(otherBubble.id) &&
          this.calculateDistance(
            bubble.latitude,
            bubble.longitude,
            otherBubble.latitude,
            otherBubble.longitude
          ) <= maxDistance
        ) {
          cluster.bubbles.push(otherBubble);
          cluster.count++;
          cluster.totalAttendees += otherBubble.attendeeCount;
          processed.add(otherBubble.id);
        }
      });

      processed.add(bubble.id);
      clusters.push(cluster);
    });

    return clusters;
  }

  // Get cluster color based on total attendees
  static getClusterColor(cluster: BubbleCluster): string {
    return this.whiteToGreen(cluster.totalAttendees);
  }

  // Get cluster size based on total attendees
  static getClusterSize(cluster: BubbleCluster): number {
    return this.getBubbleSize(cluster.totalAttendees);
  }

  // Get cluster radius based on total attendees
  static getClusterRadius(cluster: BubbleCluster): number {
    return this.bubbleRadiusMeters(cluster.totalAttendees);
  }

  // Animate bubble growth when attendee count changes
  static getBubbleAnimationConfig(fromCount: number, toCount: number) {
    const fromSize = this.getBubbleSize(fromCount);
    const toSize = this.getBubbleSize(toCount);
    const fromColor = this.whiteToGreen(fromCount);
    const toColor = this.whiteToGreen(toCount);
    const fromRadius = this.bubbleRadiusMeters(fromCount);
    const toRadius = this.bubbleRadiusMeters(toCount);

    return {
      size: {
        from: fromSize,
        to: toSize,
        duration: 500,
      },
      color: {
        from: fromColor,
        to: toColor,
        duration: 500,
      },
      radius: {
        from: fromRadius,
        to: toRadius,
        duration: 500,
      },
    };
  }

  // Get bubble opacity based on activity status
  static getBubbleOpacity(bubble: Bubble): number {
    if (!bubble.isActive) return 0.5;
    if (bubble.attendeeCount === 0) return 0.3;
    return 1.0;
  }

  // Get bubble z-index based on attendee count (higher count = higher z-index)
  static getBubbleZIndex(attendeeCount: number): number {
    return Math.min(attendeeCount * 10, 1000);
  }

  // Check if bubble should be visible based on zoom level
  static shouldShowBubble(attendeeCount: number, zoomLevel: number): boolean {
    if (attendeeCount > 0) return true; // Always show bubbles with attendees
    
    // For empty bubbles, only show at higher zoom levels
    return zoomLevel > 15;
  }

  // Get bubble label text
  static getBubbleLabel(attendeeCount: number): string {
    if (attendeeCount === 0) return '';
    if (attendeeCount === 1) return '1';
    if (attendeeCount < 1000) return attendeeCount.toString();
    return `${Math.floor(attendeeCount / 1000)}k+`;
  }

  // Get bubble description based on attendee count
  static getBubbleDescription(attendeeCount: number): string {
    if (attendeeCount === 0) return 'No attendees yet';
    if (attendeeCount === 1) return '1 attendee';
    return `${attendeeCount} attendees`;
  }

  // Sort bubbles by attendee count (descending)
  static sortBubblesByAttendees(bubbles: Bubble[]): Bubble[] {
    return [...bubbles].sort((a, b) => b.attendeeCount - a.attendeeCount);
  }

  // Filter bubbles by activity status
  static filterActiveBubbles(bubbles: Bubble[]): Bubble[] {
    return bubbles.filter(bubble => bubble.isActive);
  }

  // Get bubbles within a certain distance of a point
  static getBubblesInRadius(
    bubbles: Bubble[],
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): Bubble[] {
    return bubbles.filter(bubble => 
      this.calculateDistance(centerLat, centerLng, bubble.latitude, bubble.longitude) <= radiusKm
    );
  }
}
