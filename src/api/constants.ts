/**
 * NEXON MapleStory SEA Open API constants and endpoints
 * Official API documentation: https://openapi.nexon.com/en/game/maplestorysea/
 */

// Base API configuration
export const API_CONFIG = {
  BASE_URL: 'https://open.api.nexon.com',
  VERSION: 'v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// API endpoints
export const ENDPOINTS = {
  // Character endpoints
  CHARACTER: {
    OCID: '/maplestorysea/v1/id',
    BASIC: '/maplestorysea/v1/character/basic',
    POPULARITY: '/maplestorysea/v1/character/popularity',
    STAT: '/maplestorysea/v1/character/stat',
    HYPER_STAT: '/maplestorysea/v1/character/hyper-stat',
    PROPENSITY: '/maplestorysea/v1/character/propensity',
    ABILITY: '/maplestorysea/v1/character/ability',
    ITEM_EQUIPMENT: '/maplestorysea/v1/character/item-equipment',
    CASHITEM_EQUIPMENT: '/maplestorysea/v1/character/cashitem-equipment',
    SYMBOL_EQUIPMENT: '/maplestorysea/v1/character/symbol-equipment',
    SET_EFFECT: '/maplestorysea/v1/character/set-effect',
    BEAUTY_EQUIPMENT: '/maplestorysea/v1/character/beauty-equipment',
    ANDROID_EQUIPMENT: '/maplestorysea/v1/character/android-equipment',
    PET_EQUIPMENT: '/maplestorysea/v1/character/pet-equipment',
    SKILL: '/maplestorysea/v1/character/skill',
    LINK_SKILL: '/maplestorysea/v1/character/link-skill',
    VMATRIX: '/maplestorysea/v1/character/vmatrix',
    HEXAMATRIX: '/maplestorysea/v1/character/hexamatrix',
    HEXAMATRIX_STAT: '/maplestorysea/v1/character/hexamatrix-stat',
    DOJANG: '/maplestorysea/v1/character/dojang',
  },

  // Union endpoints
  UNION: {
    BASIC: '/maplestorysea/v1/user/union',
    RAIDER: '/maplestorysea/v1/user/union-raider',
    ARTIFACT: '/maplestorysea/v1/user/union-artifact',
  },

  // Guild endpoints
  GUILD: {
    ID: '/maplestorysea/v1/guild/id',
    BASIC: '/maplestorysea/v1/guild/basic',
  },

  // Ranking endpoints
  RANKING: {
    OVERALL: '/maplestorysea/v1/ranking/overall',
    UNION: '/maplestorysea/v1/ranking/union',
    GUILD: '/maplestorysea/v1/ranking/guild',
    DOJANG: '/maplestorysea/v1/ranking/dojang',
    THESEED: '/maplestorysea/v1/ranking/theseed',
    ACHIEVEMENT: '/maplestorysea/v1/ranking/achievement',
  },
} as const;

// HTTP headers
export const HEADERS = {
  AUTHORIZATION: 'x-nxopen-api-key',
  CONTENT_TYPE: 'application/json',
  USER_AGENT: 'mcp-maple/1.0.0',
} as const;

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error messages for SEA API
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid NEXON API key provided for MapleStory SEA',
  RATE_LIMIT_EXCEEDED: 'MapleStory SEA API rate limit exceeded. Please try again later',
  CHARACTER_NOT_FOUND: 'Character not found in MapleStory SEA servers',
  GUILD_NOT_FOUND: 'Guild not found in MapleStory SEA servers',
  INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD',
  NETWORK_ERROR: 'Network error occurred while connecting to MapleStory SEA API',
  TIMEOUT_ERROR: 'Request timeout while connecting to MapleStory SEA API',
  UNKNOWN_ERROR: 'Unknown error occurred with MapleStory SEA API',
  SEA_FEATURE_UNSUPPORTED: 'This feature is not supported by MapleStory SEA API',
  SEA_WORLD_INVALID: 'Invalid world name. MapleStory SEA supports: Aquila, Bootes, Cassiopeia, Delphinus',
  SEA_CHARACTER_NAME_INVALID: 'Invalid character name format for MapleStory SEA. Only English letters and numbers are allowed',
} as const;

// MapleStory SEA worlds
export const WORLDS = ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'] as const;

// MapleStory SEA job classes
export const JOB_CLASSES = [
  'Beginner',
  'Warrior',
  'Magician',
  'Archer',
  'Thief',
  'Pirate',
  'Hero',
  'Paladin',
  'Dark Knight',
  'Arch Mage (Fire, Poison)',
  'Arch Mage (Ice, Lightning)',
  'Bishop',
  'Bowmaster',
  'Marksman',
  'Pathfinder',
  'Night Lord',
  'Shadower',
  'Dual Blade',
  'Buccaneer',
  'Cannoneer',
  'Striker',
  'Aran',
  'Evan',
  'Luminous',
  'Mercedes',
  'Phantom',
  'Shade',
  'Kaiser',
  'Angelic Buster',
  'Zero',
  'Kinesis',
  'Illium',
  'Ark',
  'Cadena',
  'Kain',
  'Adele',
  'Lara',
  'Hoyoung',
  'Khali',
] as const;

// Rate limiting configuration (optimized for SEA API stability)
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 500, // Conservative daily limit
  REQUESTS_PER_SECOND: 8, // Conservative for SEA API stability
  BURST_LIMIT: 12, // Lower burst limit to prevent API stress
  RETRY_DELAY_BASE: 1500, // Slightly higher base delay for SEA API
  MAX_RETRY_DELAY: 45000, // Higher max delay for better error recovery
  QUEUE_TIMEOUT: 30000, // Maximum time to wait in queue
  CIRCUIT_BREAKER_THRESHOLD: 10, // Number of failures before circuit break
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute circuit breaker timeout
} as const;

// Date format patterns (updated for SEA region)
export const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'DD/MM/YYYY', // SEA standard format
  ISO_DATE: 'YYYY-MM-DDTHH:mm:ss.sssZ',
} as const;

// Cache TTL configurations (optimized for SEA API performance)
export const CACHE_TTL = {
  CHARACTER_OCID: 7200000, // 2 hours - OCIDs very rarely change
  CHARACTER_BASIC: 1800000, // 30 minutes - basic info updates moderately
  CHARACTER_STATS: 900000, // 15 minutes - stats can change with equipment
  CHARACTER_EQUIPMENT: 600000, // 10 minutes - equipment changes often during gameplay
  CHARACTER_HYPER_STAT: 1800000, // 30 minutes - hyper stats change less frequently
  CHARACTER_ABILITY: 1800000, // 30 minutes - abilities don't change often
  UNION_INFO: 1800000, // 30 minutes - union info updates moderately
  UNION_RAIDER: 1800000, // 30 minutes - raider board setup is semi-permanent
  UNION_ARTIFACT: 3600000, // 1 hour - artifact levels change slowly
  GUILD_INFO: 3600000, // 1 hour - guild info is relatively stable
  GUILD_BASIC: 3600000, // 1 hour - guild basic info rarely changes
  RANKINGS: 1800000, // 30 minutes - rankings update regularly but not rapidly
  RANKING_SEARCH: 900000, // 15 minutes - specific ranking searches can be more dynamic
  API_HEALTH: 300000, // 5 minutes - API health can change quickly
  ERROR_CACHE: 60000, // 1 minute - cache errors briefly to avoid spam
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_COUNT: 10,
  MAX_COUNT: 200,
  DEFAULT_PAGE: 1,
} as const;
