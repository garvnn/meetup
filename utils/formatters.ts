export class Formatters {
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  static formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return dateObj.toLocaleDateString();
  }

  static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  }

  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  }

  static formatTimeOnly(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = dateObj.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    
    const minutes = Math.floor(absDiff / 60000);
    const hours = Math.floor(absDiff / 3600000);
    const days = Math.floor(absDiff / 86400000);

    const isFuture = diff > 0;
    const prefix = isFuture ? 'in ' : '';
    const suffix = isFuture ? '' : ' ago';

    if (minutes < 60) {
      return `${prefix}${minutes}m${suffix}`;
    }
    if (hours < 24) {
      return `${prefix}${hours}h${suffix}`;
    }
    if (days < 7) {
      return `${prefix}${days}d${suffix}`;
    }
    
    return dateObj.toLocaleDateString();
  }

  static formatDuration(startDate: Date | string, endDate: Date | string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diff = end.getTime() - start.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  static formatToken(token: string): string {
    // Format token for display (show first 8 and last 4 characters)
    if (token.length <= 12) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  }

  static formatLocation(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  static formatMeetupTitle(title: string, maxLength: number = 30): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  }

  static generateShareUrl(token: string, baseUrl: string = 'https://yourapp.com'): string {
    return `${baseUrl}/join/${token}`;
  }

  static parseShareUrl(url: string): string | null {
    const match = url.match(/\/join\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Date/time validation helpers
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isFutureDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() > Date.now();
  }

  static isPastDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() < Date.now();
  }

  static isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  }

  static isThisWeek(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return dateObj >= weekAgo && dateObj <= now;
  }

  // Meetup-specific formatters
  static formatMeetupStatus(startDate: Date | string, endDate: Date | string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();

    if (now < start) {
      return `Starts ${this.formatRelativeTime(start)}`;
    }
    if (now > end) {
      return 'Ended';
    }
    return 'In progress';
  }

  static formatAttendeeCount(count: number): string {
    if (count === 0) return 'No attendees';
    if (count === 1) return '1 attendee';
    return `${count} attendees`;
  }

  static formatFileCount(count: number): string {
    if (count === 0) return 'No files';
    if (count === 1) return '1 file';
    return `${count} files`;
  }

  // Message formatters
  static formatMessageTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return dateObj.toLocaleDateString();
  }

  // Report formatters
  static formatReportReason(reason?: string): string {
    if (!reason) return 'No reason provided';
    return reason.length > 100 ? reason.substring(0, 100) + '...' : reason;
  }

  // Soft-ban formatters
  static formatSoftBanDuration(hours: number): string {
    if (hours < 1) return 'Less than 1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  // Quota formatters
  static formatQuotaUsage(used: number, total: number, type: 'files' | 'bytes'): string {
    const percentage = Math.round((used / total) * 100);
    
    if (type === 'files') {
      return `${used}/${total} files (${percentage}%)`;
    } else {
      const usedFormatted = this.formatFileSize(used);
      const totalFormatted = this.formatFileSize(total);
      return `${usedFormatted}/${totalFormatted} (${percentage}%)`;
    }
  }

  // URL formatters
  static formatDeepLink(token: string): string {
    return `pennapps://join/${token}`;
  }

  static formatWebLink(token: string): string {
    return `https://yourapp.com/join/${token}`;
  }

  // Text truncation
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Phone number formatting
  static formatPhoneNumber(phone: string): string {
    // Simple US phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  // Email formatting
  static formatEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Handle formatting
  static formatHandle(handle: string): string {
    return handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
}
