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
 * Notice types
 */
export enum NoticeType {
  ANNOUNCEMENT = 'announcement',
  MAINTENANCE = 'maintenance',
  EVENT = 'event',
  UPDATE = 'update',
  CASHSHOP = 'cashshop',
  GENERAL = 'general',
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
 * Parse notice type from title or content
 */
export function parseNoticeType(title: string, content?: string): NoticeType {
  const text = `${title} ${content || ''}`.toLowerCase();

  if (text.includes('점검') || text.includes('maintenance')) {
    return NoticeType.MAINTENANCE;
  }

  if (text.includes('이벤트') || text.includes('event')) {
    return NoticeType.EVENT;
  }

  if (text.includes('업데이트') || text.includes('update') || text.includes('패치')) {
    return NoticeType.UPDATE;
  }

  if (text.includes('캐시샵') || text.includes('cash') || text.includes('아이템')) {
    return NoticeType.CASHSHOP;
  }

  if (text.includes('공지') || text.includes('announcement')) {
    return NoticeType.ANNOUNCEMENT;
  }

  return NoticeType.GENERAL;
}

/**
 * Extract maintenance time from notice content
 */
export function extractMaintenanceTime(content: string): {
  startTime?: Date;
  endTime?: Date;
  duration?: string;
} | null {
  if (!content) return null;

  // Common maintenance time patterns
  const patterns = [
    // 2024년 12월 28일 오전 10:00 ~ 오후 2:00
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)\s*(\d{1,2}):(\d{2})\s*~\s*(오전|오후)\s*(\d{1,2}):(\d{2})/,
    // 12/28 10:00 ~ 14:00
    /(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/,
    // 점검 시간: 4시간
    /점검\s*시간[:\s]*(\d+)\s*시간/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      try {
        // Parse and return maintenance time info
        // This is a simplified implementation
        return {
          duration: match[0],
        };
      } catch (error) {
        continue;
      }
    }
  }

  return null;
}

/**
 * Check if server is likely in maintenance based on time patterns
 */
export function isMaintenanceTime(): boolean {
  const now = convertToSEATime(new Date());
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Common maintenance windows for Korean MMOs
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
  // Check for active maintenance notices
  if (maintenanceNotices.length > 0) {
    for (const notice of maintenanceNotices) {
      const maintenanceInfo = extractMaintenanceTime(notice.notice_contents || '');
      if (maintenanceInfo) {
        return ServerStatus.MAINTENANCE;
      }
    }
  }

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
 * Format notice content for display
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

  notices: (noticeType?: string): string => `notices:${noticeType || 'all'}`,

  events: (): string => 'current_events',

  maintenance: (): string => 'maintenance_schedule',
};
