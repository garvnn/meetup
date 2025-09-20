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
}

export interface BubbleCluster {
  center: {
    latitude: number;
    longitude: number;
  };
  bubbles: Bubble[];
  count: number;
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
          processed.add(otherBubble.id);
        }
      });

      processed.add(bubble.id);
      clusters.push(cluster);
    });

    return clusters;
  }

  static getBubbleColor(meetupId?: string): string {
    if (!meetupId) return '#007AFF';
    
    // Generate a consistent color based on meetup ID
    const colors = [
      '#007AFF', '#34C759', '#FF9500', '#FF3B30',
      '#AF52DE', '#FF2D92', '#5AC8FA', '#FFCC00'
    ];
    
    const hash = meetupId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }
}
