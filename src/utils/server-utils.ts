/**
 * Server status and game information utilities
 */

/**
 * Server status types
 */
export enum ServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  UNSTABLE = 'unstable',
  UNKNOWN = 'unknown',
}


/**
 * SEA timezone offset (UTC+8)
 */
export const SEA_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

/**
 * Convert UTC date to SEA timezone
 */
export function convertToSEATime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return new Date(utcDate.getTime() + SEA_TIMEZONE_OFFSET);
}

/**
 * Format date for SEA region display
 */
export function formatSEADate(date: Date | string): string {
  const seaDate = convertToSEATime(date);
  return seaDate.toLocaleString('ko-KR', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}


/**
 * Extract maintenance time from content (SEA API does not support notices)
 * This function is kept for backward compatibility but always returns null
 */
export function extractMaintenanceTime(content: string): {
  startTime?: Date;
  endTime?: Date;
  duration?: string;
} | null {
  // SEA API does not support maintenance notices
  // Always return null for SEA compatibility
  return null;
}

/**
 * Check if server is likely in maintenance based on time patterns
 */
export function isMaintenanceTime(): boolean {
  const now = convertToSEATime(new Date());
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Common maintenance windows for SEA region MMOs
  // Wednesday early morning (01:00-06:00)
  if (dayOfWeek === 3 && hour >= 1 && hour <= 6) {
    return true;
  }

  // Late night maintenance (23:00-05:00)
  if (hour >= 23 || hour <= 5) {
    return true;
  }

  return false;
}

/**
 * Determine server status based on various factors
 */
export function determineServerStatus(
  apiAvailable: boolean,
  maintenanceNotices: any[],
  errorRate: number = 0
): ServerStatus {
  // SEA API does not support maintenance notices
  // Skip notice checking for SEA compatibility

  // Check if it's typical maintenance time
  if (isMaintenanceTime()) {
    return ServerStatus.MAINTENANCE;
  }

  // Check API availability and error rates
  if (!apiAvailable) {
    return ServerStatus.OFFLINE;
  }

  if (errorRate > 0.5) {
    return ServerStatus.UNSTABLE;
  }

  if (errorRate > 0.1) {
    return ServerStatus.UNSTABLE;
  }

  return ServerStatus.ONLINE;
}

/**
 * Parse world population level from ranking data
 */
export function estimateWorldPopulation(rankingData: any): 'high' | 'medium' | 'low' | 'unknown' {
  if (!rankingData?.ranking?.length) {
    return 'unknown';
  }

  const totalPlayers = rankingData.ranking.length;

  if (totalPlayers > 1000) {
    return 'high';
  } else if (totalPlayers > 500) {
    return 'medium';
  } else if (totalPlayers > 100) {
    return 'low';
  }

  return 'unknown';
}

/**
 * Format content for display (SEA API does not support notices)
 * This function is kept for backward compatibility
 */
export function formatNoticeContent(content: string, maxLength: number = 200): string {
  if (!content) return '';

  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  const normalized = cleanContent.replace(/\s+/g, ' ').trim();

  // Truncate if too long
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.substring(0, maxLength - 3) + '...';
}

/**
 * Generate cache keys for server-related data
 */
export const ServerCacheKeys = {
  serverStatus: (worldName?: string): string => `server_status:${worldName || 'all'}`,

  // notices: (noticeType?: string): string => `notices:${noticeType || 'all'}`, // Disabled for SEA API

  events: (): string => 'current_events',

  maintenance: (): string => 'maintenance_schedule',
};
