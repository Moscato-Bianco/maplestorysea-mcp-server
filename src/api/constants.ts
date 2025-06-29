/**
 * NEXON MapleStory SEA Open API constants and endpoints
 * Official API documentation: https://openapi.nexon.com/en/game/maplestorysea/
 */

// Base API configuration
export const API_CONFIG = {
  BASE_URL: 'https://open.api.nexon.com',
  VERSION: 'v1',
  TIMEOUT: 15000, // Increased from 10000 to handle slower API responses
  RANKING_TIMEOUT: 30000, // Special timeout for ranking endpoints which are slower
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
  // Authentication & Authorization Errors
  INVALID_API_KEY: 'Invalid NEXON API key provided for MapleStory SEA',
  API_KEY_MISSING: 'NEXON API key is required to access MapleStory SEA data',
  API_KEY_EXPIRED: 'Your NEXON API key has expired. Please renew your API key',
  INSUFFICIENT_PERMISSIONS: 'Your API key does not have sufficient permissions for this operation',
  ACCESS_DENIED: 'Access denied. Please verify your API key has the correct permissions',

  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED: 'MapleStory SEA API rate limit exceeded. Please try again later',
  DAILY_QUOTA_EXCEEDED: 'Your daily API request quota has been exceeded',
  CONCURRENT_REQUESTS_LIMIT: 'Too many concurrent requests. Please reduce request frequency',

  // Data Not Found Errors
  CHARACTER_NOT_FOUND: 'Character not found in MapleStory SEA servers',
  CHARACTER_DATA_UNAVAILABLE: 'Character data is temporarily unavailable. Please try again later',
  GUILD_NOT_FOUND: 'Guild not found in MapleStory SEA servers',
  GUILD_DATA_UNAVAILABLE: 'Guild data is temporarily unavailable. Please try again later',
  RANKING_DATA_NOT_FOUND: 'No ranking data available for the specified criteria',
  UNION_DATA_NOT_FOUND: 'Union data not found for this character',

  // Validation Errors
  INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-01-15)',
  DATE_TOO_OLD: 'Date is too old. Data is only available from the last 30 days',
  DATE_IN_FUTURE: "Date cannot be in the future. Please use today's date or earlier",
  INVALID_PAGE_NUMBER: 'Invalid page number. Must be between 1 and 200',
  INVALID_CHARACTER_NAME_LENGTH: 'Character name must be between 2 and 13 characters',
  INVALID_GUILD_NAME_LENGTH: 'Guild name must be between 2 and 12 characters',

  // Network & Connection Errors
  NETWORK_ERROR: 'Network error occurred while connecting to MapleStory SEA API',
  CONNECTION_TIMEOUT: 'Connection timeout while accessing MapleStory SEA API',
  TIMEOUT_ERROR: 'Request timeout while connecting to MapleStory SEA API',
  SERVER_UNAVAILABLE: 'MapleStory SEA API server is temporarily unavailable',
  SERVICE_MAINTENANCE: 'MapleStory SEA API is currently under maintenance',

  // SEA-Specific Errors
  SEA_FEATURE_UNSUPPORTED: 'This feature is not supported by MapleStory SEA API',
  SEA_WORLD_INVALID:
    'Invalid world name. MapleStory SEA supports: Aquila, Bootes, Cassiopeia, Delphinus',
  SEA_CHARACTER_NAME_INVALID:
    'Invalid character name format for MapleStory SEA. Only English letters and numbers are allowed',
  SEA_GUILD_NAME_INVALID:
    'Invalid guild name format for MapleStory SEA. Only English letters, numbers, and spaces are allowed',
  SEA_REGION_RESTRICTION: 'This operation is restricted to MapleStory SEA region only',

  // Server & System Errors
  INTERNAL_SERVER_ERROR: 'Internal server error occurred. Please try again later',
  BAD_GATEWAY: 'Bad gateway error from MapleStory SEA API. Please try again',
  SERVICE_UNAVAILABLE: 'MapleStory SEA API service is temporarily unavailable',
  GATEWAY_TIMEOUT: 'Gateway timeout while processing your request',

  // Cache & Performance Errors
  CACHE_ERROR: 'Cache operation failed. Data will be fetched directly',
  CACHE_TIMEOUT: 'Cache timeout occurred. Please try again',

  // Data Quality Errors
  INCOMPLETE_DATA: 'The requested data is incomplete. Some information may be missing',
  DATA_CORRUPTION: 'Data corruption detected. Please try again with a different date',
  STALE_DATA: 'The requested data may be outdated. Consider using a more recent date',

  // Generic Fallback
  UNKNOWN_ERROR: 'An unknown error occurred with MapleStory SEA API. Please try again',
} as const;

// MapleStory SEA worlds
export const WORLDS = ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'] as const;

// MapleStory SEA job classes - comprehensive mapping
export const JOB_CLASSES = [
  // Base Classes
  'Beginner',
  'Warrior',
  'Magician',
  'Archer',
  'Thief',
  'Pirate',

  // Explorer Warriors (1st Job -> 4th Job)
  'Fighter',
  'Crusader',
  'Hero',
  'Page',
  'White Knight',
  'Paladin',
  'Spearman',
  'Dragon Knight',
  'Dark Knight',

  // Explorer Magicians
  'Magician',
  'Wizard (Fire, Poison)',
  'Mage (Fire, Poison)',
  'Arch Mage (Fire, Poison)',
  'Wizard (Ice, Lightning)',
  'Mage (Ice, Lightning)',
  'Arch Mage (Ice, Lightning)',
  'Cleric',
  'Priest',
  'Bishop',

  // Explorer Archers
  'Archer',
  'Hunter',
  'Ranger',
  'Bowmaster',
  'Crossbow Man',
  'Sniper',
  'Marksman',
  'Pathfinder',

  // Explorer Thieves
  'Thief',
  'Assassin',
  'Hermit',
  'Night Lord',
  'Bandit',
  'Chief Bandit',
  'Shadower',
  'Dual Blade',

  // Explorer Pirates
  'Pirate',
  'Brawler',
  'Marauder',
  'Buccaneer',
  'Gunslinger',
  'Outlaw',
  'Corsair',
  'Cannoneer',

  // Cygnus Knights
  'Dawn Warrior',
  'Blaze Wizard',
  'Wind Archer',
  'Night Walker',
  'Thunder Breaker',
  'Mihile',

  // Heroes
  'Aran',
  'Evan',
  'Mercedes',
  'Phantom',
  'Luminous',
  'Shade',

  // Resistance
  'Battle Mage',
  'Wild Hunter',
  'Mechanic',
  'Blaster',
  'Demon Slayer',
  'Demon Avenger',
  'Xenon',

  // Nova
  'Kaiser',
  'Angelic Buster',
  'Cadena',
  'Kain',

  // Sengoku
  'Kanna',
  'Hayato',

  // Flora
  'Adele',
  'Ark',
  'Illium',
  'Khali',

  // Anima
  'Hoyoung',
  'Lara',

  // Jianghu
  'Lynn',
  'Mo Xuan',

  // Other
  'Zero',
  'Kinesis',

  // Special/Legacy
  'Striker', // Legacy class
] as const;

// Job class categorization for SEA region
export const JOB_CATEGORIES = {
  EXPLORER: {
    name: 'Explorer',
    description: 'The most iconic and versatile group in MapleStory',
    jobs: {
      WARRIOR: ['Hero', 'Paladin', 'Dark Knight'],
      MAGICIAN: ['Arch Mage (Fire, Poison)', 'Arch Mage (Ice, Lightning)', 'Bishop'],
      ARCHER: ['Bowmaster', 'Marksman', 'Pathfinder'],
      THIEF: ['Night Lord', 'Shadower', 'Dual Blade'],
      PIRATE: ['Buccaneer', 'Corsair', 'Cannoneer'],
    },
  },
  CYGNUS_KNIGHTS: {
    name: 'Cygnus Knights',
    description: 'Created by Empress Cygnus, specializing in elemental abilities',
    jobs: [
      'Dawn Warrior',
      'Blaze Wizard',
      'Wind Archer',
      'Night Walker',
      'Thunder Breaker',
      'Mihile',
    ],
  },
  HEROES: {
    name: 'Heroes',
    description: 'Legendary characters awakened to fight the Black Mage',
    jobs: ['Aran', 'Evan', 'Mercedes', 'Phantom', 'Luminous', 'Shade'],
  },
  RESISTANCE: {
    name: 'Resistance',
    description: 'A rebellion group fighting against oppression',
    jobs: [
      'Battle Mage',
      'Wild Hunter',
      'Mechanic',
      'Blaster',
      'Demon Slayer',
      'Demon Avenger',
      'Xenon',
    ],
  },
  NOVA: {
    name: 'Nova',
    description: 'Interdimensional beings from the planet Nova',
    jobs: ['Kaiser', 'Angelic Buster', 'Cadena', 'Kain'],
  },
  SENGOKU: {
    name: 'Sengoku',
    description: 'Classes from the Sengoku period of Japan',
    jobs: ['Kanna', 'Hayato'],
  },
  FLORA: {
    name: 'Flora',
    description: 'Classes connected to the Flora world',
    jobs: ['Adele', 'Ark', 'Illium', 'Khali'],
  },
  ANIMA: {
    name: 'Anima',
    description: 'Classes with spiritual and mystical abilities',
    jobs: ['Hoyoung', 'Lara'],
  },
  JIANGHU: {
    name: 'Jianghu',
    description: 'Classes from the martial arts world',
    jobs: ['Lynn', 'Mo Xuan'],
  },
  OTHER: {
    name: 'Other',
    description: "Unique classes that don't fit into other categories",
    jobs: ['Zero', 'Kinesis'],
  },
} as const;

// Job advancement requirements for SEA region
export const JOB_ADVANCEMENT_LEVELS = {
  FIRST_JOB: 10,
  SECOND_JOB: 30,
  THIRD_JOB: 60,
  FOURTH_JOB: 100,
  FIFTH_JOB: 200,
  SIXTH_JOB: 260,
} as const;

// Primary stats for each job category
export const JOB_PRIMARY_STATS = {
  WARRIOR: 'STR',
  MAGICIAN: 'INT',
  ARCHER: 'DEX',
  THIEF: 'LUK',
  PIRATE_STR: 'STR', // Brawler line
  PIRATE_DEX: 'DEX', // Gunslinger line
  HYBRID: ['STR', 'DEX'], // Classes like Xenon
} as const;

// Rate limiting configuration (optimized for SEA API stability)
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 500, // Conservative daily limit
  REQUESTS_PER_SECOND: 10, // Increased from 8 for better general performance
  BURST_LIMIT: 15, // Slightly increased burst limit
  RETRY_DELAY_BASE: 1500, // Slightly higher base delay for SEA API
  MAX_RETRY_DELAY: 45000, // Higher max delay for better error recovery
  QUEUE_TIMEOUT: 30000, // Maximum time to wait in queue
  CIRCUIT_BREAKER_THRESHOLD: 10, // Number of failures before circuit break
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute circuit breaker timeout
  // Specific limits for different endpoint types
  RANKING: {
    REQUESTS_PER_SECOND: 5, // More conservative for heavy ranking queries
    REQUESTS_PER_MINUTE: 200, // Lower minute limit for rankings
    RETRY_DELAY_BASE: 2000, // Higher base delay for ranking retries
  },
} as const;

// Enhanced timeout configuration for SEA API characteristics
export const TIMEOUT_CONFIG = {
  // Base timeouts for different operation types
  CHARACTER_BASIC: 10000, // 10 seconds for basic character data
  CHARACTER_DETAILED: 15000, // 15 seconds for detailed character data (equipment, stats)
  CHARACTER_COMPLEX: 20000, // 20 seconds for complex operations (skill, matrix data)
  UNION_DATA: 12000, // 12 seconds for union data
  GUILD_DATA: 10000, // 10 seconds for guild data
  RANKING_BASIC: 25000, // 25 seconds for basic ranking queries
  RANKING_COMPLEX: 35000, // 35 seconds for complex ranking queries with filters
  SEARCH_OPERATIONS: 20000, // 20 seconds for search operations

  // Connection-specific timeouts
  CONNECT_TIMEOUT: 5000, // 5 seconds to establish connection
  DNS_LOOKUP_TIMEOUT: 3000, // 3 seconds for DNS resolution

  // Progressive timeout strategy
  RETRY_TIMEOUT_MULTIPLIER: 1.5, // Increase timeout by 50% on each retry
  MAX_TIMEOUT: 60000, // Maximum timeout (1 minute)
  MIN_TIMEOUT: 5000, // Minimum timeout (5 seconds)
} as const;

// Connection retry configuration for SEA API
export const RETRY_CONFIG = {
  MAX_RETRIES: 3, // Maximum number of retry attempts
  INITIAL_DELAY: 1000, // Initial delay before first retry (1 second)
  MAX_DELAY: 30000, // Maximum delay between retries (30 seconds)
  BACKOFF_FACTOR: 2, // Exponential backoff factor
  JITTER_FACTOR: 0.1, // Add random jitter to prevent thundering herd

  // Retry conditions
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  RETRYABLE_ERROR_TYPES: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],

  // Special handling for different error types
  RATE_LIMIT_RETRY_DELAY: 5000, // 5 seconds for rate limit errors
  SERVER_ERROR_RETRY_DELAY: 2000, // 2 seconds for server errors
  NETWORK_ERROR_RETRY_DELAY: 1500, // 1.5 seconds for network errors
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
  RANKINGS: 900000, // 15 minutes - rankings update more frequently than other data
  RANKING_SEARCH: 300000, // 5 minutes - specific ranking searches can be more dynamic
  RANKING_OVERALL: 900000, // 15 minutes - overall rankings cache
  RANKING_SPECIFIC: 1800000, // 30 minutes - specific character rankings (more stable)
  API_HEALTH: 300000, // 5 minutes - API health can change quickly
  ERROR_CACHE: 60000, // 1 minute - cache errors briefly to avoid spam
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_COUNT: 10,
  MAX_COUNT: 200,
  DEFAULT_PAGE: 1,
} as const;
