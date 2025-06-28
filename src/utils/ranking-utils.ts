/**
 * Ranking system utilities
 */

/**
 * Ranking types supported by the API
 */
export enum RankingType {
  OVERALL = 'overall',
  UNION = 'union',
  GUILD = 'guild',
  DOJANG = 'dojang',
  THESEED = 'theseed',
  ACHIEVEMENT = 'achievement'
}

/**
 * Guild ranking types
 */
export enum GuildRankingType {
  FLAG_RACE = 0,
  GUILD_POWER = 1
}

/**
 * Validate page number for ranking queries
 */
export function validatePage(page: number): void {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page number must be a positive integer starting from 1');
  }
  
  if (page > 200) {
    throw new Error('Page number cannot exceed 200');
  }
}

/**
 * Validate ranking type
 */
export function validateRankingType(type: string): void {
  const validTypes = Object.values(RankingType);
  if (!validTypes.includes(type as RankingType)) {
    throw new Error(`Invalid ranking type. Valid types: ${validTypes.join(', ')}`);
  }
}

/**
 * Validate guild ranking type
 */
export function validateGuildRankingType(type: number): void {
  const validTypes = Object.values(GuildRankingType).filter(v => typeof v === 'number');
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid guild ranking type. Valid types: ${validTypes.join(', ')}`);
  }
}

/**
 * Calculate ranking position from page and index
 */
export function calculateRankingPosition(page: number, index: number, pageSize: number = 200): number {
  return (page - 1) * pageSize + index + 1;
}

/**
 * Calculate page from ranking position
 */
export function calculatePageFromPosition(position: number, pageSize: number = 200): number {
  return Math.ceil(position / pageSize);
}

/**
 * Format ranking data for display
 */
export function formatRankingEntry(entry: any, position?: number): any {
  if (!entry) return entry;
  
  return {
    ...entry,
    displayRanking: position || entry.ranking || entry.guild_ranking || 0,
    formattedLevel: entry.character_level ? `Lv.${entry.character_level}` : undefined,
    formattedExp: entry.character_exp ? formatNumber(entry.character_exp) : undefined,
    formattedGuildLevel: entry.guild_level ? `Lv.${entry.guild_level}` : undefined,
    formattedMemberCount: entry.guild_member_count ? `${entry.guild_member_count}명` : undefined
  };
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(number)) return '0';
  
  return number.toLocaleString('ko-KR');
}

/**
 * Find character position in ranking data
 */
export function findCharacterPosition(
  rankings: any[], 
  characterName: string, 
  currentPage: number = 1,
  pageSize: number = 200
): { found: boolean; position?: number; entry?: any } {
  if (!rankings || !Array.isArray(rankings)) {
    return { found: false };
  }
  
  const normalizedName = characterName.toLowerCase().trim();
  
  for (let i = 0; i < rankings.length; i++) {
    const entry = rankings[i];
    const entryName = (entry.character_name || '').toLowerCase().trim();
    
    if (entryName === normalizedName) {
      const position = calculateRankingPosition(currentPage, i, pageSize);
      return {
        found: true,
        position,
        entry: formatRankingEntry(entry, position)
      };
    }
  }
  
  return { found: false };
}

/**
 * Find guild position in ranking data
 */
export function findGuildPosition(
  rankings: any[], 
  guildName: string, 
  currentPage: number = 1,
  pageSize: number = 200
): { found: boolean; position?: number; entry?: any } {
  if (!rankings || !Array.isArray(rankings)) {
    return { found: false };
  }
  
  const normalizedName = guildName.toLowerCase().trim();
  
  for (let i = 0; i < rankings.length; i++) {
    const entry = rankings[i];
    const entryName = (entry.guild_name || '').toLowerCase().trim();
    
    if (entryName === normalizedName) {
      const position = calculateRankingPosition(currentPage, i, pageSize);
      return {
        found: true,
        position,
        entry: formatRankingEntry(entry, position)
      };
    }
  }
  
  return { found: false };
}

/**
 * Generate ranking cache keys
 */
export const RankingCacheKeys = {
  overall: (worldName?: string, worldType?: string, className?: string, page?: number, date?: string): string => {
    const parts = ['ranking_overall'];
    if (worldName) parts.push(`world:${worldName}`);
    if (worldType) parts.push(`type:${worldType}`);
    if (className) parts.push(`class:${className}`);
    if (page) parts.push(`page:${page}`);
    if (date) parts.push(`date:${date}`);
    return parts.join(':');
  },
  
  union: (worldName?: string, page?: number, date?: string): string => {
    const parts = ['ranking_union'];
    if (worldName) parts.push(`world:${worldName}`);
    if (page) parts.push(`page:${page}`);
    if (date) parts.push(`date:${date}`);
    return parts.join(':');
  },
  
  guild: (worldName: string, rankingType: number, page?: number, date?: string): string => {
    const parts = ['ranking_guild', `world:${worldName}`, `type:${rankingType}`];
    if (page) parts.push(`page:${page}`);
    if (date) parts.push(`date:${date}`);
    return parts.join(':');
  },
  
  characterPosition: (characterName: string, worldName?: string, className?: string): string => {
    const parts = ['character_position', `name:${characterName.toLowerCase()}`];
    if (worldName) parts.push(`world:${worldName}`);
    if (className) parts.push(`class:${className}`);
    return parts.join(':');
  },
  
  guildPosition: (guildName: string, worldName: string, rankingType: number): string => {
    return `guild_position:${worldName}:${rankingType}:${guildName.toLowerCase()}`;
  }
};

/**
 * Parse ranking response and add metadata
 */
export function parseRankingResponse(response: any, page: number = 1): {
  rankings: any[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalEntries?: number;
  };
  metadata: {
    lastUpdate: string;
    rankingType: string;
    worldName?: string;
  };
} {
  const rankings = response.ranking || [];
  const currentPage = page;
  
  return {
    rankings: rankings.map((entry: any, index: number) => 
      formatRankingEntry(entry, calculateRankingPosition(currentPage, index))
    ),
    pagination: {
      currentPage,
      hasNextPage: rankings.length >= 200, // Assume full page means more data
      hasPreviousPage: currentPage > 1,
      totalEntries: rankings.length
    },
    metadata: {
      lastUpdate: new Date().toISOString(),
      rankingType: response.ranking_type || 'unknown',
      worldName: response.world_name
    }
  };
}

/**
 * Merge ranking data from multiple pages for position search
 */
export function mergeRankingPages(pages: any[]): any[] {
  const merged: any[] = [];
  
  pages.forEach((page, pageIndex) => {
    if (page.ranking && Array.isArray(page.ranking)) {
      page.ranking.forEach((entry: any, entryIndex: number) => {
        const position = calculateRankingPosition(pageIndex + 1, entryIndex);
        merged.push(formatRankingEntry(entry, position));
      });
    }
  });
  
  return merged;
}

/**
 * Calculate ranking statistics
 */
export function calculateRankingStats(rankings: any[]): {
  totalEntries: number;
  levelRange: { min: number; max: number };
  averageLevel: number;
  topGuilds?: string[];
} {
  if (!rankings || rankings.length === 0) {
    return {
      totalEntries: 0,
      levelRange: { min: 0, max: 0 },
      averageLevel: 0
    };
  }
  
  const levels = rankings
    .map(entry => entry.character_level || 0)
    .filter(level => level > 0);
    
  const guildNames = rankings
    .map(entry => entry.character_guild_name || entry.guild_name)
    .filter(name => name && name.trim())
    .reduce((acc: Record<string, number>, name: string) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  
  const topGuilds = Object.entries(guildNames)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name]) => name);
  
  const result: {
    totalEntries: number;
    levelRange: { min: number; max: number };
    averageLevel: number;
    topGuilds?: string[];
  } = {
    totalEntries: rankings.length,
    levelRange: {
      min: levels.length > 0 ? Math.min(...levels) : 0,
      max: levels.length > 0 ? Math.max(...levels) : 0
    },
    averageLevel: levels.length > 0 ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0
  };
  
  if (topGuilds.length > 0) {
    result.topGuilds = topGuilds;
  }
  
  return result;
}