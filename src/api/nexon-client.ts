/**
 * NEXON MapleStory Open API Client
 * Provides methods to interact with NEXON's official MapleStory API
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createLogger, Logger } from 'winston';
import {
  ApiClientConfig,
  CharacterBasic,
  CharacterStat,
  CharacterHyperStat,
  CharacterPropensity,
  CharacterAbility,
  ItemEquipment,
  UnionInfo,
  UnionRaider,
  GuildBasic,
  OverallRanking,
  UnionRanking,
  GuildRanking,
  ApiError,
} from './types';
import {
  API_CONFIG,
  ENDPOINTS,
  HEADERS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  RATE_LIMIT,
  WORLDS,
} from './constants';
import { MemoryCache, defaultCache } from '../utils/cache';
import {
  validateCharacterName,
  validateWorldName,
  validateOcid,
  validateDate,
  sanitizeCharacterName,
  sanitizeWorldName,
} from '../utils/validation';
import {
  analyzeSetEffects,
  analyzeEquipmentPiece,
  calculateCombatPower,
  calculateEnhancementScore,
} from '../utils/equipment-analyzer';
import {
  validateGuildName,
  validateGuildId,
  sanitizeGuildName,
  calculateFuzzyScore,
  generateGuildNameVariations,
  calculateGuildScore,
  GuildCacheKeys,
} from '../utils/guild-utils';
import {
  ServerStatus,
  NoticeType,
  convertToSEATime,
  formatSEADate,
  parseNoticeType,
  extractMaintenanceTime,
  determineServerStatus,
  estimateWorldPopulation,
  formatNoticeContent,
  ServerCacheKeys,
} from '../utils/server-utils';
import {
  GuildRankingType,
  validatePage,
  validateGuildRankingType,
  findCharacterPosition,
  findGuildPosition,
  parseRankingResponse,
  calculateRankingStats,
  RankingCacheKeys,
} from '../utils/ranking-utils';

export class NexonApiClient {
  private client: AxiosInstance;
  private logger: Logger;
  private apiKey: string;
  private requestQueue: Array<{ resolve: () => void; timestamp: number }> = [];
  private isProcessingQueue = false;
  private cache: MemoryCache;

  constructor(config: ApiClientConfig) {
    this.apiKey = config.apiKey;
    this.cache = config.cache || defaultCache;

    // Check if in MCP mode (no port specified)
    const isMcpMode = !process.env.MCP_PORT && !process.argv.includes('--port');

    this.logger = createLogger({
      level: 'info',
      format: require('winston').format.combine(
        require('winston').format.timestamp(),
        require('winston').format.json()
      ),
      silent: isMcpMode,
      transports: isMcpMode ? [] : [new (require('winston').transports.Console)()],
    });

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: config.baseURL || API_CONFIG.BASE_URL,
      timeout: config.timeout || API_CONFIG.TIMEOUT,
      headers: {
        [HEADERS.AUTHORIZATION]: this.apiKey,
        'Content-Type': HEADERS.CONTENT_TYPE,
        'User-Agent': HEADERS.USER_AGENT,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.info('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        this.logger.error('Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.info('API Response', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length,
        });
        return response;
      },
      (error) => {
        this.logger.error('Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });

        // Transform error to our standard format
        const apiError: ApiError = {
          error: {
            name: this.getErrorName(error.response?.status),
            message: this.getErrorMessage(error.response?.status, error.response?.data),
          },
        };

        return Promise.reject(apiError);
      }
    );
  }

  private getErrorName(status?: number): string {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HTTP_STATUS.FORBIDDEN:
        return 'FORBIDDEN';
      case HTTP_STATUS.NOT_FOUND:
        return 'NOT_FOUND';
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_ERROR';
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private getErrorMessage(status?: number, data?: any): string {
    if (data?.message) {
      return data.message;
    }

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.INVALID_API_KEY;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.CHARACTER_NOT_FOUND;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  private async waitForRateLimit(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      this.requestQueue.push({ resolve, timestamp: now });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const recentRequests = this.requestQueue.filter((req) => now - req.timestamp < 1000);

      if (recentRequests.length >= RATE_LIMIT.REQUESTS_PER_SECOND) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const request = this.requestQueue.shift();
      if (request) {
        request.resolve();
      }
    }

    this.isProcessingQueue = false;
  }

  private async retryRequest<T>(
    operation: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit();
        return await operation();
      } catch (error: unknown) {
        lastError = error;

        const apiError = error as ApiError;
        if (
          apiError?.error?.name === 'RATE_LIMITED' ||
          apiError?.error?.name === 'SERVICE_UNAVAILABLE'
        ) {
          if (attempt < maxRetries) {
            const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
            this.logger.info(
              `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
          this.logger.info(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private isRetryableError(error: unknown): boolean {
    const apiError = error as ApiError;
    const retryableErrors = ['RATE_LIMITED', 'SERVICE_UNAVAILABLE', 'TIMEOUT_ERROR'];
    return retryableErrors.includes(apiError?.error?.name || '');
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.get<T>(endpoint, { params });
      return response.data;
    });
  }

  // Character API methods
  async getCharacterOcid(characterName: string): Promise<{ ocid: string }> {
    // Validate and sanitize input
    const sanitizedName = sanitizeCharacterName(characterName);
    validateCharacterName(sanitizedName);

    // Check cache first
    const cacheKey = MemoryCache.generateOcidCacheKey(sanitizedName);
    const cachedResult = this.cache.get<{ ocid: string }>(cacheKey);

    if (cachedResult) {
      this.logger.info('OCID lookup cache hit', { characterName: sanitizedName });
      return cachedResult;
    }

    try {
      const result = await this.request<{ ocid: string }>(ENDPOINTS.CHARACTER.OCID, {
        character_name: sanitizedName,
      });

      // Validate OCID before caching
      validateOcid(result.ocid);

      // Cache for 1 hour (OCID rarely changes)
      this.cache.set(cacheKey, result, 3600000);

      this.logger.info('OCID lookup successful', {
        characterName: sanitizedName,
        ocid: result.ocid,
      });

      return result;
    } catch (error) {
      this.logger.error('OCID lookup failed', {
        characterName: sanitizedName,
        error,
      });
      throw error;
    }
  }

  async getCharacterBasic(ocid: string, date?: string): Promise<CharacterBasic> {
    // Validate inputs
    validateOcid(ocid);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = MemoryCache.generateCharacterBasicCacheKey(ocid, date);
    const cachedResult = this.cache.get<CharacterBasic>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character basic info cache hit', { ocid, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { ocid };
      if (date) {
        params.date = date;
      }

      const result = await this.request<CharacterBasic>(ENDPOINTS.CHARACTER.BASIC, params);

      // Validate world name in response
      if (result.world_name) {
        validateWorldName(result.world_name);
      }

      // Cache for 30 minutes (character info changes less frequently)
      this.cache.set(cacheKey, result, 1800000);

      this.logger.info('Character basic info lookup successful', {
        ocid,
        date,
        characterName: result.character_name,
        world: result.world_name,
      });

      return result;
    } catch (error) {
      this.logger.error('Character basic info lookup failed', {
        ocid,
        date,
        error,
      });
      throw error;
    }
  }

  async getCharacterStat(ocid: string, date?: string): Promise<CharacterStat> {
    // Validate inputs
    validateOcid(ocid);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.STAT, {
      ocid,
      date: date || 'latest',
    });
    const cachedResult = this.cache.get<CharacterStat>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character stat cache hit', { ocid, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { ocid };
      if (date) {
        params.date = date;
      }

      const result = await this.request<CharacterStat>(ENDPOINTS.CHARACTER.STAT, params);

      // Cache for 15 minutes (stats can change more frequently)
      this.cache.set(cacheKey, result, 900000);

      this.logger.info('Character stat lookup successful', {
        ocid,
        date,
        characterClass: result.character_class,
      });

      return result;
    } catch (error) {
      this.logger.error('Character stat lookup failed', {
        ocid,
        date,
        error,
      });
      throw error;
    }
  }

  async getCharacterHyperStat(ocid: string, date?: string): Promise<CharacterHyperStat> {
    return this.request(ENDPOINTS.CHARACTER.HYPER_STAT, { ocid, date });
  }

  async getCharacterPropensity(ocid: string, date?: string): Promise<CharacterPropensity> {
    return this.request(ENDPOINTS.CHARACTER.PROPENSITY, { ocid, date });
  }

  async getCharacterAbility(ocid: string, date?: string): Promise<CharacterAbility> {
    return this.request(ENDPOINTS.CHARACTER.ABILITY, { ocid, date });
  }

  async getCharacterItemEquipment(ocid: string, date?: string): Promise<ItemEquipment> {
    // Validate inputs
    validateOcid(ocid);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.ITEM_EQUIPMENT, {
      ocid,
      date: date || 'latest',
    });
    const cachedResult = this.cache.get<ItemEquipment>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character equipment cache hit', { ocid, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { ocid };
      if (date) {
        params.date = date;
      }

      const result = await this.request<ItemEquipment>(ENDPOINTS.CHARACTER.ITEM_EQUIPMENT, params);

      // Cache for 20 minutes (equipment changes less frequently)
      this.cache.set(cacheKey, result, 1200000);

      this.logger.info('Character equipment lookup successful', {
        ocid,
        date,
        equipmentCount: result.item_equipment?.length || 0,
      });

      return result;
    } catch (error) {
      this.logger.error('Character equipment lookup failed', {
        ocid,
        date,
        error,
      });
      throw error;
    }
  }

  async getCharacterCashItemEquipment(ocid: string, date?: string): Promise<any> {
    // Validate inputs
    validateOcid(ocid);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.CASHITEM_EQUIPMENT, {
      ocid,
      date: date || 'latest',
    });
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character cash item cache hit', { ocid, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { ocid };
      if (date) {
        params.date = date;
      }

      const result = await this.request<any>(ENDPOINTS.CHARACTER.CASHITEM_EQUIPMENT, params);

      // Cache for 30 minutes (cash items change less frequently)
      this.cache.set(cacheKey, result, 1800000);

      this.logger.info('Character cash item lookup successful', {
        ocid,
        date,
      });

      return result;
    } catch (error) {
      this.logger.error('Character cash item lookup failed', {
        ocid,
        date,
        error,
      });
      throw error;
    }
  }

  async getCharacterBeautyEquipment(ocid: string, date?: string): Promise<any> {
    // Validate inputs
    validateOcid(ocid);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.BEAUTY_EQUIPMENT, {
      ocid,
      date: date || 'latest',
    });
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character beauty equipment cache hit', { ocid, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { ocid };
      if (date) {
        params.date = date;
      }

      const result = await this.request<any>(ENDPOINTS.CHARACTER.BEAUTY_EQUIPMENT, params);

      // Cache for 1 hour (beauty equipment rarely changes)
      this.cache.set(cacheKey, result, 3600000);

      this.logger.info('Character beauty equipment lookup successful', {
        ocid,
        date,
      });

      return result;
    } catch (error) {
      this.logger.error('Character beauty equipment lookup failed', {
        ocid,
        date,
        error,
      });
      throw error;
    }
  }

  // Union API methods
  async getUnionInfo(ocid: string, date?: string): Promise<UnionInfo> {
    return this.request(ENDPOINTS.UNION.BASIC, { ocid, date });
  }

  async getUnionRaider(ocid: string, date?: string): Promise<UnionRaider> {
    return this.request(ENDPOINTS.UNION.RAIDER, { ocid, date });
  }

  // Guild API methods
  async getGuildId(guildName: string, worldName: string): Promise<{ oguild_id: string }> {
    // Validate and sanitize inputs
    const sanitizedGuildName = sanitizeGuildName(guildName);
    const sanitizedWorldName = sanitizeWorldName(worldName);

    validateGuildName(sanitizedGuildName);
    validateWorldName(sanitizedWorldName);

    // Check cache first
    const cacheKey = GuildCacheKeys.guildId(sanitizedGuildName, sanitizedWorldName);
    const cachedResult = this.cache.get<{ oguild_id: string }>(cacheKey);

    if (cachedResult) {
      this.logger.info('Guild ID lookup cache hit', {
        guildName: sanitizedGuildName,
        worldName: sanitizedWorldName,
      });
      return cachedResult;
    }

    try {
      const result = await this.request<{ oguild_id: string }>(ENDPOINTS.GUILD.ID, {
        guild_name: sanitizedGuildName,
        world_name: sanitizedWorldName,
      });

      // Validate guild ID before caching
      validateGuildId(result.oguild_id);

      // Cache for 2 hours (guild IDs rarely change)
      this.cache.set(cacheKey, result, 7200000);

      this.logger.info('Guild ID lookup successful', {
        guildName: sanitizedGuildName,
        worldName: sanitizedWorldName,
        guildId: result.oguild_id,
      });

      return result;
    } catch (error) {
      this.logger.error('Guild ID lookup failed', {
        guildName: sanitizedGuildName,
        worldName: sanitizedWorldName,
        error,
      });
      throw error;
    }
  }

  async getGuildBasic(oguildId: string, date?: string): Promise<GuildBasic> {
    // Validate inputs
    validateGuildId(oguildId);
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = GuildCacheKeys.guildBasic(oguildId, date);
    const cachedResult = this.cache.get<GuildBasic>(cacheKey);

    if (cachedResult) {
      this.logger.info('Guild basic info cache hit', { oguildId, date });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = { oguild_id: oguildId };
      if (date) {
        params.date = date;
      }

      const result = await this.request<GuildBasic>(ENDPOINTS.GUILD.BASIC, params);

      // Cache for 1 hour (guild info changes moderately)
      this.cache.set(cacheKey, result, 3600000);

      this.logger.info('Guild basic info lookup successful', {
        oguildId,
        date,
        guildName: result.guild_name,
        guildLevel: result.guild_level,
        memberCount: result.guild_member_count,
      });

      return result;
    } catch (error) {
      this.logger.error('Guild basic info lookup failed', {
        oguildId,
        date,
        error,
      });
      throw error;
    }
  }

  /**
   * Search for guilds with fuzzy matching
   */
  async searchGuilds(
    searchTerm: string,
    worldName: string,
    limit: number = 10
  ): Promise<
    Array<{
      guildName: string;
      guildId: string;
      matchScore: number;
      guildInfo?: GuildBasic;
    }>
  > {
    const sanitizedSearchTerm = sanitizeGuildName(searchTerm);
    const sanitizedWorldName = sanitizeWorldName(worldName);

    validateGuildName(sanitizedSearchTerm);
    validateWorldName(sanitizedWorldName);

    // Check cache first
    const cacheKey = GuildCacheKeys.guildSearch(sanitizedSearchTerm, sanitizedWorldName);
    const cachedResult = this.cache.get<any[]>(cacheKey);

    if (cachedResult) {
      this.logger.info('Guild search cache hit', {
        searchTerm: sanitizedSearchTerm,
        worldName: sanitizedWorldName,
      });
      return cachedResult.slice(0, limit);
    }

    try {
      // Generate name variations for better search results
      const nameVariations = generateGuildNameVariations(sanitizedSearchTerm);
      const searchResults: Array<{
        guildName: string;
        guildId: string;
        matchScore: number;
        guildInfo?: GuildBasic;
      }> = [];

      // Try each variation
      for (const variation of nameVariations) {
        try {
          const result = await this.getGuildId(variation, sanitizedWorldName);
          const guildInfo = await this.getGuildBasic(result.oguild_id);

          const matchScore = calculateFuzzyScore(
            sanitizedSearchTerm,
            guildInfo.guild_name || variation
          );

          searchResults.push({
            guildName: guildInfo.guild_name || variation,
            guildId: result.oguild_id,
            matchScore,
            guildInfo,
          });
        } catch (error) {
          // Guild not found with this variation, continue
          this.logger.debug('Guild not found with variation', { variation, error });
        }
      }

      // Sort by match score and remove duplicates
      const uniqueResults = searchResults
        .filter(
          (result, index, array) => array.findIndex((r) => r.guildId === result.guildId) === index
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // Cache for 30 minutes
      this.cache.set(cacheKey, uniqueResults, 1800000);

      this.logger.info('Guild search completed', {
        searchTerm: sanitizedSearchTerm,
        worldName: sanitizedWorldName,
        resultsCount: uniqueResults.length,
      });

      return uniqueResults;
    } catch (error) {
      this.logger.error('Guild search failed', {
        searchTerm: sanitizedSearchTerm,
        worldName: sanitizedWorldName,
        error,
      });
      return [];
    }
  }

  /**
   * Get comprehensive guild analysis
   */
  async getGuildAnalysis(guildName: string, worldName: string, date?: string) {
    try {
      const { oguild_id } = await this.getGuildId(guildName, worldName);
      const guildBasic = await this.getGuildBasic(oguild_id, date);

      // Calculate guild metrics
      const guildScore = calculateGuildScore(guildBasic);

      // Get guild ranking position (if available)
      let rankingPosition: number | null = null;
      try {
        const ranking = await this.getGuildRanking(worldName, 0, guildName, 1, date);
        if (ranking.ranking && ranking.ranking.length > 0) {
          rankingPosition = ranking.ranking[0]?.ranking || null;
        }
      } catch (error) {
        this.logger.debug('Guild ranking lookup failed', { guildName, worldName, error });
      }

      const analysis = {
        basic: guildBasic,
        metrics: {
          guildScore,
          level: guildBasic.guild_level,
          memberCount: guildBasic.guild_member_count,
          rankingPosition,
        },
        recommendations: this.generateGuildRecommendations(guildBasic, rankingPosition),
      };

      this.logger.info('Guild analysis completed', {
        guildName,
        worldName,
        guildScore,
        rankingPosition,
      });

      return {
        guildId: oguild_id,
        ...analysis,
      };
    } catch (error) {
      this.logger.error('Guild analysis failed', {
        guildName,
        worldName,
        error,
      });
      throw error;
    }
  }

  /**
   * Generate guild improvement recommendations
   */
  private generateGuildRecommendations(guildBasic: any, rankingPosition: number | null): string[] {
    const recommendations: string[] = [];

    const level = guildBasic.guild_level || 0;
    const memberCount = guildBasic.guild_member_count || 0;

    // Level recommendations
    if (level < 10) {
      recommendations.push('길드 레벨을 올려 더 많은 혜택을 받을 수 있습니다.');
    }

    // Member count recommendations
    if (memberCount < 50) {
      recommendations.push('더 많은 멤버를 모집하여 길드 활동을 활성화할 수 있습니다.');
    }

    // Ranking recommendations
    if (rankingPosition && rankingPosition > 100) {
      recommendations.push('길드 랭킹 향상을 위해 멤버들의 활동을 늘려보세요.');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('훌륭한 길드입니다! 현재 상태를 유지하세요.');
    }

    return recommendations;
  }

  // Ranking API methods
  async getOverallRanking(
    worldName?: string,
    worldType?: string,
    className?: string,
    ocid?: string,
    page?: number,
    date?: string
  ): Promise<OverallRanking> {
    // Validate inputs
    if (worldName) {
      validateWorldName(worldName);
    }
    if (page) {
      validatePage(page);
    }
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = RankingCacheKeys.overall(worldName, worldType, className, page, date);
    const cachedResult = this.cache.get<OverallRanking>(cacheKey);

    if (cachedResult) {
      this.logger.info('Overall ranking cache hit', { worldName, page, className });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = {};
      if (worldName) params.world_name = worldName;
      if (worldType) params.world_type = worldType;
      if (className) params.class = className;
      if (ocid) params.ocid = ocid;
      if (page) params.page = page;
      if (date) params.date = date;

      const result = await this.request<OverallRanking>(ENDPOINTS.RANKING.OVERALL, params);

      // Cache for 30 minutes (rankings update periodically)
      this.cache.set(cacheKey, result, 1800000);

      this.logger.info('Overall ranking retrieved successfully', {
        worldName,
        page,
        className,
        rankingCount: result.ranking?.length || 0,
      });

      return result;
    } catch (error) {
      this.logger.error('Overall ranking retrieval failed', {
        worldName,
        page,
        className,
        error,
      });
      throw error;
    }
  }

  async getUnionRanking(
    worldName?: string,
    ocid?: string,
    page?: number,
    date?: string
  ): Promise<UnionRanking> {
    return this.request(ENDPOINTS.RANKING.UNION, {
      world_name: worldName,
      ocid,
      page,
      date,
    });
  }

  async getGuildRanking(
    worldName: string,
    rankingType: number,
    guildName?: string,
    page?: number,
    date?: string
  ): Promise<GuildRanking> {
    // Validate inputs
    validateWorldName(worldName);
    validateGuildRankingType(rankingType);
    if (page) {
      validatePage(page);
    }
    if (date) {
      validateDate(date);
    }

    // Check cache first
    const cacheKey = RankingCacheKeys.guild(worldName, rankingType, page, date);
    const cachedResult = this.cache.get<GuildRanking>(cacheKey);

    if (cachedResult) {
      this.logger.info('Guild ranking cache hit', { worldName, rankingType, page });
      return cachedResult;
    }

    try {
      const params: Record<string, any> = {
        world_name: worldName,
        ranking_type: rankingType,
      };
      if (guildName) params.guild_name = guildName;
      if (page) params.page = page;
      if (date) params.date = date;

      const result = await this.request<GuildRanking>(ENDPOINTS.RANKING.GUILD, params);

      // Cache for 30 minutes
      this.cache.set(cacheKey, result, 1800000);

      this.logger.info('Guild ranking retrieved successfully', {
        worldName,
        rankingType,
        page,
        rankingCount: result.ranking?.length || 0,
      });

      return result;
    } catch (error) {
      this.logger.error('Guild ranking retrieval failed', {
        worldName,
        rankingType,
        page,
        error,
      });
      throw error;
    }
  }

  // Convenience methods
  async getCharacterFullInfo(characterName: string, date?: string) {
    try {
      // First get OCID
      const { ocid } = await this.getCharacterOcid(characterName);

      // Then fetch all character information in parallel
      const [basic, stat, hyperStat, propensity, ability, equipment, cashItems, beautyEquipment] =
        await Promise.all([
          this.getCharacterBasic(ocid, date),
          this.getCharacterStat(ocid, date),
          this.getCharacterHyperStat(ocid, date),
          this.getCharacterPropensity(ocid, date),
          this.getCharacterAbility(ocid, date),
          this.getCharacterItemEquipment(ocid, date),
          this.getCharacterCashItemEquipment(ocid, date).catch(() => null), // Optional
          this.getCharacterBeautyEquipment(ocid, date).catch(() => null), // Optional
        ]);

      return {
        ocid,
        basic,
        stat,
        hyperStat,
        propensity,
        ability,
        equipment,
        cashItems,
        beautyEquipment,
      };
    } catch (error) {
      this.logger.error('Error fetching character full info', {
        characterName,
        error,
      });
      throw error;
    }
  }

  /**
   * Get comprehensive character analysis including equipment stats and set effects
   */
  async getCharacterAnalysis(characterName: string, date?: string) {
    try {
      const fullInfo = await this.getCharacterFullInfo(characterName, date);

      // Analyze equipment
      const equipmentAnalysis = {
        setEffects: analyzeSetEffects(fullInfo.equipment?.item_equipment || []),
        enhancementScores: (fullInfo.equipment?.item_equipment || []).map((item) => ({
          itemName: item.item_name,
          slot: item.item_equipment_part,
          enhancement: analyzeEquipmentPiece(item),
          score: calculateEnhancementScore(analyzeEquipmentPiece(item)),
        })),
        totalCombatPower: this.calculateTotalCombatPower(fullInfo.stat),
      };

      // Calculate overall character score
      const characterScore = this.calculateCharacterScore(fullInfo, equipmentAnalysis);

      return {
        ...fullInfo,
        analysis: {
          equipment: equipmentAnalysis,
          characterScore,
          recommendations: this.generateRecommendations(fullInfo, equipmentAnalysis),
        },
      };
    } catch (error) {
      this.logger.error('Error performing character analysis', {
        characterName,
        error,
      });
      throw error;
    }
  }

  /**
   * Calculate total combat power from character stats
   */
  private calculateTotalCombatPower(statData: any): number {
    if (!statData?.final_stat) return 0;

    const stats: Record<string, number> = {};
    statData.final_stat.forEach((stat: any) => {
      if (stat.stat_name && stat.stat_value) {
        const value = parseInt(stat.stat_value.replace(/,/g, ''), 10);
        stats[stat.stat_name.toLowerCase().replace(/\s+/g, '_')] = isNaN(value) ? 0 : value;
      }
    });

    return calculateCombatPower(stats);
  }

  /**
   * Calculate overall character score
   */
  private calculateCharacterScore(fullInfo: any, equipmentAnalysis: any): number {
    let score = 0;

    // Level contribution (0-300 points)
    const level = fullInfo.basic?.character_level || 1;
    score += Math.min(level, 300);

    // Equipment enhancement contribution (0-500 points)
    const enhancementScore = equipmentAnalysis.enhancementScores.reduce(
      (total: number, item: any) => total + item.score,
      0
    );
    score += Math.min(enhancementScore / 10, 500);

    // Set effects contribution (0-200 points)
    const setEffectBonus = equipmentAnalysis.setEffects.length * 50;
    score += Math.min(setEffectBonus, 200);

    // Combat power contribution (scaled)
    const combatPowerBonus = Math.min(equipmentAnalysis.totalCombatPower / 1000, 1000);
    score += combatPowerBonus;

    return Math.round(score);
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(fullInfo: any, equipmentAnalysis: any): string[] {
    const recommendations: string[] = [];

    const level = fullInfo.basic?.character_level || 1;

    // Level recommendations
    if (level < 200) {
      recommendations.push('레벨업을 통해 더 강한 장비를 착용할 수 있습니다.');
    }

    // Equipment enhancement recommendations
    const lowEnhancementItems = equipmentAnalysis.enhancementScores.filter(
      (item: any) => item.score < 50
    );
    if (lowEnhancementItems.length > 0) {
      recommendations.push(
        `${lowEnhancementItems.length}개의 장비 강화가 부족합니다. 스타포스와 잠재능력 개선을 고려해보세요.`
      );
    }

    // Set effect recommendations
    if (equipmentAnalysis.setEffects.length === 0) {
      recommendations.push('세트 장비를 착용하여 추가 능력치를 얻을 수 있습니다.');
    }

    // Combat power recommendations
    if (equipmentAnalysis.totalCombatPower < 100000) {
      recommendations.push('전투력 향상을 위해 장비 업그레이드를 고려해보세요.');
    }

    return recommendations;
  }

  async getGuildFullInfo(guildName: string, worldName: string, date?: string) {
    try {
      // First get guild ID
      const { oguild_id } = await this.getGuildId(guildName, worldName);

      // Then fetch guild information
      const basic = await this.getGuildBasic(oguild_id, date);

      return {
        oguild_id,
        basic,
      };
    } catch (error) {
      this.logger.error('Error fetching guild full info', {
        guildName,
        worldName,
        error,
      });
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Try to get ranking data as a health check
      await this.getOverallRanking(undefined, undefined, undefined, undefined, 1);
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Server status and game information methods

  /**
   * Get comprehensive server status for all worlds
   */
  async getServerStatus(worldName?: string): Promise<{
    status: ServerStatus;
    worlds: Array<{
      worldName: string;
      status: ServerStatus;
      population: 'high' | 'medium' | 'low' | 'unknown';
      lastUpdate: string;
    }>;
    maintenance?: any;
    timestamp: string;
  }> {
    const cacheKey = ServerCacheKeys.serverStatus(worldName);
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Server status cache hit', { worldName });
      return cachedResult;
    }

    try {
      const worlds = worldName ? [worldName] : WORLDS.slice();
      const worldStatuses = [];
      let overallStatus = ServerStatus.ONLINE;
      let errorCount = 0;

      // Check maintenance notices
      const maintenanceNotices = await this.getNotices(NoticeType.MAINTENANCE).catch(() => []);

      for (const world of worlds) {
        try {
          // Test API availability by getting ranking data
          const ranking = await this.getOverallRanking(world, undefined, undefined, undefined, 1);
          const population = estimateWorldPopulation(ranking);

          const worldStatus = determineServerStatus(true, maintenanceNotices, 0);

          worldStatuses.push({
            worldName: world,
            status: worldStatus,
            population,
            lastUpdate: formatSEADate(new Date()),
          });

          if (worldStatus !== ServerStatus.ONLINE) {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          const worldStatus = determineServerStatus(false, maintenanceNotices, 1);

          worldStatuses.push({
            worldName: world,
            status: worldStatus,
            population: 'unknown' as const,
            lastUpdate: formatSEADate(new Date()),
          });
        }
      }

      // Determine overall status
      const errorRate = errorCount / worlds.length;
      overallStatus = determineServerStatus(errorRate < 1, maintenanceNotices, errorRate);

      const result = {
        status: overallStatus,
        worlds: worldStatuses,
        maintenance: maintenanceNotices.length > 0 ? maintenanceNotices[0] : undefined,
        timestamp: formatSEADate(new Date()),
      };

      // Cache for 5 minutes
      this.cache.set(cacheKey, result, 300000);

      this.logger.info('Server status check completed', {
        worldName,
        overallStatus,
        worldCount: worldStatuses.length,
        errorRate,
      });

      return result;
    } catch (error) {
      this.logger.error('Server status check failed', { worldName, error });

      return {
        status: ServerStatus.UNKNOWN,
        worlds: [],
        timestamp: formatSEADate(new Date()),
      };
    }
  }

  /**
   * Get game notices by type
   */
  async getNotices(noticeType?: NoticeType | string, limit: number = 10): Promise<any[]> {
    const cacheKey = ServerCacheKeys.notices(noticeType);
    const cachedResult = this.cache.get<any[]>(cacheKey);

    if (cachedResult) {
      this.logger.info('Notices cache hit', { noticeType });
      return cachedResult.slice(0, limit);
    }

    try {
      // Get notices from different endpoints based on type
      let notices: any[] = [];

      if (!noticeType || noticeType === NoticeType.GENERAL) {
        const generalNotices = await this.request<any>(ENDPOINTS.NOTICE.LIST);
        if (generalNotices.notice) {
          notices = notices.concat(generalNotices.notice);
        }
      }

      if (!noticeType || noticeType === NoticeType.EVENT) {
        try {
          const eventNotices = await this.request<any>(ENDPOINTS.NOTICE.EVENT);
          if (eventNotices.notice) {
            notices = notices.concat(eventNotices.notice);
          }
        } catch (error) {
          this.logger.debug('Event notices not available', { error });
        }
      }

      if (!noticeType || noticeType === NoticeType.CASHSHOP) {
        try {
          const cashNotices = await this.request<any>(ENDPOINTS.NOTICE.CASHSHOP);
          if (cashNotices.notice) {
            notices = notices.concat(cashNotices.notice);
          }
        } catch (error) {
          this.logger.debug('Cash shop notices not available', { error });
        }
      }

      // Process and enrich notices
      const processedNotices = notices.map((notice) => ({
        ...notice,
        noticeType: parseNoticeType(notice.title || '', notice.contents),
        formattedDate: formatSEADate(notice.date || new Date()),
        formattedContent: formatNoticeContent(notice.contents || ''),
        maintenanceInfo: notice.contents ? extractMaintenanceTime(notice.contents) : null,
      }));

      // Filter by type if specified
      let filteredNotices = processedNotices;
      if (noticeType && noticeType !== NoticeType.GENERAL) {
        filteredNotices = processedNotices.filter((notice) => notice.noticeType === noticeType);
      }

      // Sort by date (newest first)
      filteredNotices.sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );

      const result = filteredNotices.slice(0, limit);

      // Cache for 10 minutes
      this.cache.set(cacheKey, result, 600000);

      this.logger.info('Notices retrieved successfully', {
        noticeType,
        totalCount: notices.length,
        filteredCount: result.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get notices', { noticeType, error });
      return [];
    }
  }

  /**
   * Get current events and promotions
   */
  async getCurrentEvents(): Promise<any[]> {
    const cacheKey = ServerCacheKeys.events();
    const cachedResult = this.cache.get<any[]>(cacheKey);

    if (cachedResult) {
      this.logger.info('Current events cache hit');
      return cachedResult;
    }

    try {
      const eventNotices = await this.getNotices(NoticeType.EVENT, 20);

      // Filter for active events (simplified logic)
      const currentDate = convertToSEATime(new Date());
      const activeEvents = eventNotices.filter((notice) => {
        if (!notice.date) return true;

        const noticeDate = new Date(notice.date);
        const daysDiff = (currentDate.getTime() - noticeDate.getTime()) / (1000 * 60 * 60 * 24);

        // Consider events from last 30 days as potentially active
        return daysDiff <= 30;
      });

      // Cache for 30 minutes
      this.cache.set(cacheKey, activeEvents, 1800000);

      this.logger.info('Current events retrieved', { count: activeEvents.length });

      return activeEvents;
    } catch (error) {
      this.logger.error('Failed to get current events', { error });
      return [];
    }
  }

  /**
   * Get maintenance schedule
   */
  async getMaintenanceSchedule(): Promise<{
    scheduled: any[];
    ongoing: any[];
    upcoming: any[];
  }> {
    const cacheKey = ServerCacheKeys.maintenance();
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Maintenance schedule cache hit');
      return cachedResult;
    }

    try {
      const maintenanceNotices = await this.getNotices(NoticeType.MAINTENANCE, 20);

      const now = convertToSEATime(new Date());
      const scheduled: any[] = [];
      const ongoing: any[] = [];
      const upcoming: any[] = [];

      maintenanceNotices.forEach((notice) => {
        const maintenanceInfo = extractMaintenanceTime(notice.contents || '');

        if (maintenanceInfo) {
          // Simplified categorization based on notice date
          const noticeDate = new Date(notice.date || now);
          const hoursDiff = (now.getTime() - noticeDate.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 2) {
            ongoing.push({
              ...notice,
              maintenanceInfo,
            });
          } else if (hoursDiff < 0) {
            upcoming.push({
              ...notice,
              maintenanceInfo,
            });
          } else {
            scheduled.push({
              ...notice,
              maintenanceInfo,
            });
          }
        }
      });

      const result = { scheduled, ongoing, upcoming };

      // Cache for 15 minutes
      this.cache.set(cacheKey, result, 900000);

      this.logger.info('Maintenance schedule retrieved', {
        scheduled: scheduled.length,
        ongoing: ongoing.length,
        upcoming: upcoming.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get maintenance schedule', { error });
      return { scheduled: [], ongoing: [], upcoming: [] };
    }
  }

  // Enhanced ranking methods

  /**
   * Find character's position in overall ranking
   */
  async findCharacterRankingPosition(
    characterName: string,
    worldName?: string,
    className?: string,
    maxPages: number = 10
  ): Promise<{
    found: boolean;
    position?: number;
    entry?: any;
    searchedPages: number;
  }> {
    const sanitizedName = sanitizeCharacterName(characterName);
    validateCharacterName(sanitizedName);

    if (worldName) {
      validateWorldName(worldName);
    }

    // Check cache first
    const cacheKey = RankingCacheKeys.characterPosition(sanitizedName, worldName, className);
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Character position cache hit', { characterName: sanitizedName });
      return cachedResult;
    }

    try {
      // Search through multiple pages to find character
      for (let page = 1; page <= maxPages; page++) {
        const ranking = await this.getOverallRanking(
          worldName,
          undefined,
          className,
          undefined,
          page
        );

        if (!ranking.ranking || ranking.ranking.length === 0) {
          break; // No more data
        }

        const result = findCharacterPosition(ranking.ranking, sanitizedName, page);

        if (result.found) {
          const finalResult = {
            ...result,
            searchedPages: page,
          };

          // Cache for 1 hour
          this.cache.set(cacheKey, finalResult, 3600000);

          this.logger.info('Character position found', {
            characterName: sanitizedName,
            position: result.position,
            searchedPages: page,
          });

          return finalResult;
        }
      }

      const notFoundResult = {
        found: false,
        searchedPages: maxPages,
      };

      // Cache negative result for 30 minutes
      this.cache.set(cacheKey, notFoundResult, 1800000);

      this.logger.info('Character position not found', {
        characterName: sanitizedName,
        searchedPages: maxPages,
      });

      return notFoundResult;
    } catch (error) {
      this.logger.error('Character position search failed', {
        characterName: sanitizedName,
        error,
      });

      return {
        found: false,
        searchedPages: 0,
      };
    }
  }

  /**
   * Find guild's position in guild ranking
   */
  async findGuildRankingPosition(
    guildName: string,
    worldName: string,
    rankingType: number = GuildRankingType.GUILD_POWER,
    maxPages: number = 5
  ): Promise<{
    found: boolean;
    position?: number;
    entry?: any;
    searchedPages: number;
  }> {
    const sanitizedName = sanitizeGuildName(guildName);
    validateGuildName(sanitizedName);
    validateWorldName(worldName);
    validateGuildRankingType(rankingType);

    // Check cache first
    const cacheKey = RankingCacheKeys.guildPosition(sanitizedName, worldName, rankingType);
    const cachedResult = this.cache.get<any>(cacheKey);

    if (cachedResult) {
      this.logger.info('Guild position cache hit', { guildName: sanitizedName });
      return cachedResult;
    }

    try {
      // Search through multiple pages to find guild
      for (let page = 1; page <= maxPages; page++) {
        const ranking = await this.getGuildRanking(worldName, rankingType, undefined, page);

        if (!ranking.ranking || ranking.ranking.length === 0) {
          break; // No more data
        }

        const result = findGuildPosition(ranking.ranking, sanitizedName, page);

        if (result.found) {
          const finalResult = {
            ...result,
            searchedPages: page,
          };

          // Cache for 1 hour
          this.cache.set(cacheKey, finalResult, 3600000);

          this.logger.info('Guild position found', {
            guildName: sanitizedName,
            position: result.position,
            searchedPages: page,
          });

          return finalResult;
        }
      }

      const notFoundResult = {
        found: false,
        searchedPages: maxPages,
      };

      // Cache negative result for 30 minutes
      this.cache.set(cacheKey, notFoundResult, 1800000);

      this.logger.info('Guild position not found', {
        guildName: sanitizedName,
        searchedPages: maxPages,
      });

      return notFoundResult;
    } catch (error) {
      this.logger.error('Guild position search failed', {
        guildName: sanitizedName,
        error,
      });

      return {
        found: false,
        searchedPages: 0,
      };
    }
  }

  /**
   * Get comprehensive ranking analysis
   */
  async getRankingAnalysis(
    worldName?: string,
    className?: string,
    pages: number = 3
  ): Promise<{
    overall: any;
    union?: any;
    guild?: any;
    statistics: any;
    topCharacters: any[];
    topGuilds: any[];
  }> {
    try {
      // Get multiple ranking types
      const [overallRanking, unionRanking, guildRanking] = await Promise.all([
        this.getOverallRanking(worldName, undefined, className, undefined, 1),
        this.getUnionRanking(worldName, undefined, 1).catch(() => null),
        worldName
          ? this.getGuildRanking(worldName, GuildRankingType.GUILD_POWER, undefined, 1).catch(
              () => null
            )
          : null,
      ]);

      // Collect data from multiple pages for better analysis
      const allCharacters = [];
      for (let page = 1; page <= pages; page++) {
        try {
          const pageData = await this.getOverallRanking(
            worldName,
            undefined,
            className,
            undefined,
            page
          );
          if (pageData.ranking) {
            allCharacters.push(...pageData.ranking);
          }
        } catch (error) {
          break;
        }
      }

      const statistics = calculateRankingStats(allCharacters);

      const result = {
        overall: parseRankingResponse(overallRanking, 1),
        union: unionRanking ? parseRankingResponse(unionRanking, 1) : undefined,
        guild: guildRanking ? parseRankingResponse(guildRanking, 1) : undefined,
        statistics,
        topCharacters: allCharacters.slice(0, 10),
        topGuilds: statistics.topGuilds || [],
      };

      this.logger.info('Ranking analysis completed', {
        worldName,
        className,
        totalCharacters: allCharacters.length,
        pages,
      });

      return result;
    } catch (error) {
      this.logger.error('Ranking analysis failed', {
        worldName,
        className,
        error,
      });
      throw error;
    }
  }
}
