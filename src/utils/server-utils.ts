/**
 * Server status and game information utilities
 * Optimized for MapleStory SEA region with proper timezone and date formatting
 */

import { DATE_FORMATS } from '../api/constants';

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
 * SEA timezone identifier
 */
export const SEA_TIMEZONE = 'Asia/Singapore';

/**
 * Convert UTC date to SEA timezone using proper timezone handling
 */
export function convertToSEATime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date;

  // Use Intl.DateTimeFormat for proper timezone conversion
  const seaTime = new Intl.DateTimeFormat('en-SG', {
    timeZone: SEA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(inputDate);

  const year = parseInt(seaTime.find((p) => p.type === 'year')?.value ?? '2024');
  const month = parseInt(seaTime.find((p) => p.type === 'month')?.value ?? '1') - 1;
  const day = parseInt(seaTime.find((p) => p.type === 'day')?.value ?? '1');
  const hour = parseInt(seaTime.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = parseInt(seaTime.find((p) => p.type === 'minute')?.value ?? '0');
  const second = parseInt(seaTime.find((p) => p.type === 'second')?.value ?? '0');

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Get current time in SEA timezone
 */
export function getCurrentSEATime(): Date {
  return convertToSEATime(new Date());
}

/**
 * Format date for SEA region display in DD/MM/YYYY format
 */
export function formatSEADate(date: Date | string, includeTime: boolean = false): string {
  const seaDate = convertToSEATime(date);

  if (includeTime) {
    return seaDate.toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format for SEA
    });
  }

  // Date only in DD/MM/YYYY format
  return seaDate.toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format time for SEA region display in 24-hour format
 */
export function formatSEATime(date: Date | string): string {
  const seaDate = convertToSEATime(date);
  return seaDate.toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Get current SEA date in DD/MM/YYYY format
 */
export function getCurrentSEADate(): string {
  return formatSEADate(new Date());
}

/**
 * Get current SEA time string in HH:MM:SS format
 */
export function getCurrentSEATimeString(): string {
  return formatSEATime(new Date());
}

/**
 * Convert date to API format (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date | string): string {
  const seaDate = convertToSEATime(date);
  return seaDate.toISOString().split('T')[0] ?? '';
}

/**
 * Parse SEA date string (DD/MM/YYYY) to Date object
 */
export function parseSEADate(dateString: string): Date {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year ?? '2024'), parseInt(month ?? '1') - 1, parseInt(day ?? '1'));
}

/**
 * Check if date is today in SEA timezone
 */
export function isTodayInSEA(date: Date | string): boolean {
  const inputDate = formatSEADate(date);
  const today = getCurrentSEADate();
  return inputDate === today;
}

/**
 * Get yesterday's date in SEA timezone
 */
export function getYesterdaySEA(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return formatSEADate(yesterday);
}

/**
 * Get tomorrow's date in SEA timezone
 */
export function getTomorrowSEA(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return formatSEADate(tomorrow);
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
 * Updated for SEA server maintenance schedules
 */
export function isMaintenanceTime(): boolean {
  const now = convertToSEATime(new Date());
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // MapleStory SEA maintenance schedules:
  // 1. Weekly maintenance: Wednesday 08:00-12:00 SGT
  if (dayOfWeek === 3 && hour >= 8 && hour <= 12) {
    return true;
  }

  // 2. Emergency maintenance: Usually early morning 01:00-06:00 SGT
  if (hour >= 1 && hour <= 6) {
    return true;
  }

  // 3. Patch maintenance: Usually Tuesday night 23:00-03:00 SGT
  if ((dayOfWeek === 2 && hour >= 23) || (dayOfWeek === 3 && hour <= 3)) {
    return true;
  }

  return false;
}

/**
 * Get next daily reset time in SEA timezone (00:00 SGT)
 */
export function getNextDailyReset(): Date {
  const now = convertToSEATime(new Date());
  const nextReset = new Date(now);
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(0, 0, 0, 0);
  return nextReset;
}

/**
 * Get time until next daily reset in SEA timezone
 */
export function getTimeUntilDailyReset(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = convertToSEATime(new Date());
  const nextReset = getNextDailyReset();
  const diffMs = nextReset.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
  };
}

/**
 * Get next weekly reset time (Wednesday 00:00 SGT)
 */
export function getNextWeeklyReset(): Date {
  const now = convertToSEATime(new Date());
  const nextWednesday = new Date(now);
  const dayOfWeek = now.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;

  if (daysUntilWednesday === 0 && now.getHours() >= 0) {
    // It's Wednesday, next reset is next week
    nextWednesday.setDate(nextWednesday.getDate() + 7);
  } else {
    nextWednesday.setDate(nextWednesday.getDate() + daysUntilWednesday);
  }

  nextWednesday.setHours(0, 0, 0, 0);
  return nextWednesday;
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
/**
 * Check if it's currently during data update time (08:00-09:30 SGT)
 */
export function isDuringDataUpdate(): boolean {
  const now = getCurrentSEATime();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Data updates happen between 08:00 and 09:30 SGT
  return hour === 8 || (hour === 9 && minute <= 30);
}

/**
 * Get next data update time
 */
export function getNextDataUpdate(): Date {
  const now = getCurrentSEATime();
  const nextUpdate = new Date(now);

  // If it's before 08:00 today, next update is today at 08:00
  if (now.getHours() < 8) {
    nextUpdate.setHours(8, 0, 0, 0);
  } else {
    // Otherwise, next update is tomorrow at 08:00
    nextUpdate.setDate(nextUpdate.getDate() + 1);
    nextUpdate.setHours(8, 0, 0, 0);
  }

  return nextUpdate;
}

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
/**
 * Format number for SEA region display (using English locale)
 */
export function formatSEANumber(num: number): string {
  return num.toLocaleString('en-SG');
}

/**
 * Format currency for SEA region (Mesos)
 */
export function formatSEAMesos(amount: number): string {
  return `${formatSEANumber(amount)} mesos`;
}

/**
 * Format percentage for SEA region
 */
export function formatSEAPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

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
 * SEA-specific event and reset schedules
 */
export const SEA_SCHEDULES = {
  // Daily resets at 00:00 SGT
  DAILY_RESET: { hour: 0, minute: 0 },

  // Weekly resets on Wednesday 00:00 SGT
  WEEKLY_RESET: { day: 3, hour: 0, minute: 0 },

  // Maintenance windows
  MAINTENANCE_WINDOWS: {
    WEEKLY: { day: 3, startHour: 8, endHour: 12 }, // Wednesday 08:00-12:00
    EMERGENCY: { startHour: 1, endHour: 6 }, // 01:00-06:00 any day
    PATCH: { day: 2, startHour: 23, endHour: 3 }, // Tuesday 23:00 - Wednesday 03:00
  },

  // Data update times
  DATA_UPDATES: {
    CHARACTER: { hour: 8, minute: 0 }, // 08:00 SGT
    RANKINGS: { hour: 8, minute: 30 }, // 08:30 SGT
    UNION: { hour: 9, minute: 0 }, // 09:00 SGT
  },
} as const;

/**
 * Generate cache keys for server-related data
 */
export const ServerCacheKeys = {
  serverStatus: (worldName?: string): string => `server_status:${worldName || 'all'}`,

  // notices: (noticeType?: string): string => `notices:${noticeType || 'all'}`, // Disabled for SEA API

  events: (): string => 'current_events',

  maintenance: (): string => 'maintenance_schedule',

  dailyReset: (): string => 'daily_reset_time',

  weeklyReset: (): string => 'weekly_reset_time',
};
