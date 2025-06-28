/**
 * Guild-related utility functions
 */

/**
 * Validate guild name format
 */
export function validateGuildName(guildName: string): void {
  if (!guildName || typeof guildName !== 'string') {
    throw new Error('Guild name is required and must be a string');
  }

  const trimmedName = guildName.trim();

  if (trimmedName.length === 0) {
    throw new Error('Guild name cannot be empty');
  }

  if (trimmedName.length > 20) {
    throw new Error('Guild name cannot exceed 20 characters');
  }

  if (trimmedName.length < 2) {
    throw new Error('Guild name must be at least 2 characters');
  }

  // Check for valid characters (English letters, numbers, some special chars for SEA)
  const validCharPattern = /^[a-zA-Z0-9\s\-_.]+$/;
  if (!validCharPattern.test(trimmedName)) {
    throw new Error('Guild name contains invalid characters');
  }
}

/**
 * Sanitize guild name
 */
export function sanitizeGuildName(guildName: string): string {
  if (!guildName || typeof guildName !== 'string') {
    return '';
  }

  return guildName.trim().normalize('NFC');
}

/**
 * Calculate fuzzy match score between two strings
 */
export function calculateFuzzyScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Calculate Levenshtein distance based similarity
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  if (maxLength === 0) return 1;

  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0]![i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j]![0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j]![i] = Math.min(
        (matrix[j]![i - 1] || 0) + 1, // deletion
        (matrix[j - 1]![i] || 0) + 1, // insertion
        (matrix[j - 1]![i - 1] || 0) + indicator // substitution
      );
    }
  }

  return matrix[str2.length]![str1.length] || 0;
}

/**
 * Generate potential guild name variations for fuzzy search
 */
export function generateGuildNameVariations(guildName: string): string[] {
  const variations = new Set<string>();
  const name = sanitizeGuildName(guildName);

  // Original name
  variations.add(name);

  // Remove spaces
  variations.add(name.replace(/\s+/g, ''));

  // Replace common variations
  const commonReplacements = [
    { from: /\s+/g, to: '' },
    { from: /[0-9]/g, to: '' },
    { from: /[_\-.]/g, to: '' },
    { from: /Guild/gi, to: '' },
    { from: /길드/g, to: '' },
  ];

  commonReplacements.forEach(({ from, to }) => {
    const variant = name.replace(from, to).trim();
    if (variant && variant.length >= 2) {
      variations.add(variant);
    }
  });

  return Array.from(variations).filter((v) => v.length >= 2);
}

/**
 * Parse guild level from guild basic info
 */
export function parseGuildLevel(guildBasic: any): number {
  if (!guildBasic) return 0;

  const level = guildBasic.guild_level;
  if (typeof level === 'number') return level;
  if (typeof level === 'string') {
    const parsed = parseInt(level, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

/**
 * Parse guild member count
 */
export function parseGuildMemberCount(guildBasic: any): number {
  if (!guildBasic) return 0;

  const memberCount = guildBasic.guild_member_count;
  if (typeof memberCount === 'number') return memberCount;
  if (typeof memberCount === 'string') {
    const parsed = parseInt(memberCount, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

/**
 * Calculate guild score based on level and member count
 */
export function calculateGuildScore(guildBasic: any): number {
  const level = parseGuildLevel(guildBasic);
  const memberCount = parseGuildMemberCount(guildBasic);

  // Simple scoring: level contributes 70%, member count 30%
  const levelScore = Math.min(level * 2, 200); // Max 200 from level
  const memberScore = Math.min(memberCount * 3, 300); // Max 300 from members

  return levelScore + memberScore;
}

/**
 * Validate guild ID format
 */
export function validateGuildId(guildId: string): void {
  if (!guildId || typeof guildId !== 'string') {
    throw new Error('Guild ID is required and must be a string');
  }

  const trimmedId = guildId.trim();

  if (trimmedId.length === 0) {
    throw new Error('Guild ID cannot be empty');
  }

  // Guild ID should be a valid format
  if (trimmedId.length < 5) {
    throw new Error('Guild ID format appears to be invalid');
  }
}

/**
 * Generate guild cache keys
 */
export const GuildCacheKeys = {
  guildId: (guildName: string, worldName: string): string =>
    `sea_guild_id:${worldName}:${guildName.trim().toLowerCase().replace(/\s+/g, '')}`,

  guildBasic: (guildId: string, date?: string): string =>
    `sea_guild_basic:${guildId}:${date || 'latest'}`,

  guildSearch: (searchTerm: string, worldName: string): string =>
    `sea_guild_search:${worldName}:${searchTerm.trim().toLowerCase().replace(/\s+/g, '')}`,
};
