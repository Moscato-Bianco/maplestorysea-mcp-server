/**
 * NEXON MapleStory Open API constants and endpoints
 * Official API documentation: https://openapi.nexon.com/
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
    OCID: '/maplestory/v1/id',
    BASIC: '/maplestory/v1/character/basic',
    POPULARITY: '/maplestory/v1/character/popularity',
    STAT: '/maplestory/v1/character/stat',
    HYPER_STAT: '/maplestory/v1/character/hyper-stat',
    PROPENSITY: '/maplestory/v1/character/propensity',
    ABILITY: '/maplestory/v1/character/ability',
    ITEM_EQUIPMENT: '/maplestory/v1/character/item-equipment',
    CASHITEM_EQUIPMENT: '/maplestory/v1/character/cashitem-equipment',
    SYMBOL_EQUIPMENT: '/maplestory/v1/character/symbol-equipment',
    SET_EFFECT: '/maplestory/v1/character/set-effect',
    BEAUTY_EQUIPMENT: '/maplestory/v1/character/beauty-equipment',
    ANDROID_EQUIPMENT: '/maplestory/v1/character/android-equipment',
    PET_EQUIPMENT: '/maplestory/v1/character/pet-equipment',
    SKILL: '/maplestory/v1/character/skill',
    LINK_SKILL: '/maplestory/v1/character/link-skill',
    VMATRIX: '/maplestory/v1/character/vmatrix',
    HEXAMATRIX: '/maplestory/v1/character/hexamatrix',
    HEXAMATRIX_STAT: '/maplestory/v1/character/hexamatrix-stat',
    DOJANG: '/maplestory/v1/character/dojang',
  },

  // Union endpoints
  UNION: {
    BASIC: '/maplestory/v1/user/union',
    RAIDER: '/maplestory/v1/user/union-raider',
    ARTIFACT: '/maplestory/v1/user/union-artifact',
  },

  // Guild endpoints
  GUILD: {
    ID: '/maplestory/v1/guild/id',
    BASIC: '/maplestory/v1/guild/basic',
  },

  // Ranking endpoints
  RANKING: {
    OVERALL: '/maplestory/v1/ranking/overall',
    UNION: '/maplestory/v1/ranking/union',
    GUILD: '/maplestory/v1/ranking/guild',
    DOJANG: '/maplestory/v1/ranking/dojang',
    THESEED: '/maplestory/v1/ranking/theseed',
    ACHIEVEMENT: '/maplestory/v1/ranking/achievement',
  },

  // Cube and Starforce probability endpoints
  PROBABILITY: {
    CUBE: '/maplestory/v1/cube-use-results',
    POTENTIAL: '/maplestory/v1/potential/history',
    STARFORCE: '/maplestory/v1/starforce/history',
  },

  // Notice endpoints
  NOTICE: {
    LIST: '/maplestory/v1/notice',
    DETAIL: '/maplestory/v1/notice/detail',
    UPDATE: '/maplestory/v1/notice-update',
    EVENT: '/maplestory/v1/notice-event',
    CASHSHOP: '/maplestory/v1/notice-cashshop',
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

// Error messages
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key provided',
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded',
  CHARACTER_NOT_FOUND: 'Character not found',
  GUILD_NOT_FOUND: 'Guild not found',
  INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timeout',
  UNKNOWN_ERROR: 'Unknown error occurred',
} as const;

// MapleStory worlds
export const WORLDS = [
  '스카니아',
  '베라',
  '루나',
  '제니스',
  '크로아',
  '유니온',
  '엘리시움',
  '이노시스',
  '레드',
  '오로라',
  '아케인',
  '노바',
  '리부트',
  '리부트2',
] as const;

// MapleStory job classes
export const JOB_CLASSES = [
  '초보자',
  '전사',
  '마법사',
  '궁수',
  '도적',
  '해적',
  '메이플스토리M',
  '데몬',
  '배틀메이지',
  '와일드헌터',
  '메카닉',
  '데몬어벤져',
  '제논',
  '미하일',
  '카이저',
  '카데나',
  '엔젤릭버스터',
  '초월자',
  '은월',
  '아델',
  '일리움',
  '아크',
  '라라',
  '호영',
  '카인',
  '칼리',
] as const;

// Rate limiting configuration
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 500,
  REQUESTS_PER_SECOND: 10,
  BURST_LIMIT: 20,
} as const;

// Date format patterns
export const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'YYYY년 MM월 DD일',
  ISO_DATE: 'YYYY-MM-DDTHH:mm:ss.sssZ',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_COUNT: 10,
  MAX_COUNT: 200,
  DEFAULT_PAGE: 1,
} as const;
