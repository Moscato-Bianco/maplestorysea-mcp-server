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
import { API_CONFIG, ENDPOINTS, HEADERS, HTTP_STATUS, ERROR_MESSAGES, RATE_LIMIT } from './constants';
import { MemoryCache, defaultCache } from '../utils/cache';
import { 
  validateCharacterName, 
  validateWorldName, 
  validateOcid, 
  validateDate,
  sanitizeCharacterName,
  sanitizeWorldName,
  ValidationError 
} from '../utils/validation';
import { 
  analyzeSetEffects, 
  analyzeEquipmentPiece, 
  calculateCombatPower,
  calculateEnhancementScore 
} from '../utils/equipment-analyzer';

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
      const recentRequests = this.requestQueue.filter(req => now - req.timestamp < 1000);
      
      if (recentRequests.length >= RATE_LIMIT.REQUESTS_PER_SECOND) {
        await new Promise(resolve => setTimeout(resolve, 100));
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
            this.logger.info(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
          this.logger.info(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
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
        character_name: sanitizedName 
      });

      // Validate OCID before caching
      validateOcid(result.ocid);

      // Cache for 1 hour (OCID rarely changes)
      this.cache.set(cacheKey, result, 3600000);
      
      this.logger.info('OCID lookup successful', { 
        characterName: sanitizedName, 
        ocid: result.ocid 
      });

      return result;
    } catch (error) {
      this.logger.error('OCID lookup failed', { 
        characterName: sanitizedName, 
        error 
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
        world: result.world_name 
      });

      return result;
    } catch (error) {
      this.logger.error('Character basic info lookup failed', { 
        ocid, 
        date,
        error 
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
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.STAT, { ocid, date: date || 'latest' });
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
        characterClass: result.character_class
      });

      return result;
    } catch (error) {
      this.logger.error('Character stat lookup failed', { 
        ocid, 
        date,
        error 
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
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.ITEM_EQUIPMENT, { ocid, date: date || 'latest' });
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
        equipmentCount: result.item_equipment?.length || 0
      });

      return result;
    } catch (error) {
      this.logger.error('Character equipment lookup failed', { 
        ocid, 
        date,
        error 
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
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.CASHITEM_EQUIPMENT, { ocid, date: date || 'latest' });
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
        date
      });

      return result;
    } catch (error) {
      this.logger.error('Character cash item lookup failed', { 
        ocid, 
        date,
        error 
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
    const cacheKey = MemoryCache.generateApiCacheKey(ENDPOINTS.CHARACTER.BEAUTY_EQUIPMENT, { ocid, date: date || 'latest' });
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
        date
      });

      return result;
    } catch (error) {
      this.logger.error('Character beauty equipment lookup failed', { 
        ocid, 
        date,
        error 
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
    return this.request(ENDPOINTS.GUILD.ID, {
      guild_name: guildName,
      world_name: worldName,
    });
  }

  async getGuildBasic(oguildId: string, date?: string): Promise<GuildBasic> {
    return this.request(ENDPOINTS.GUILD.BASIC, { oguild_id: oguildId, date });
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
    return this.request(ENDPOINTS.RANKING.OVERALL, {
      world_name: worldName,
      world_type: worldType,
      class: className,
      ocid,
      page,
      date,
    });
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
    return this.request(ENDPOINTS.RANKING.GUILD, {
      world_name: worldName,
      ranking_type: rankingType,
      guild_name: guildName,
      page,
      date,
    });
  }

  // Convenience methods
  async getCharacterFullInfo(characterName: string, date?: string) {
    try {
      // First get OCID
      const { ocid } = await this.getCharacterOcid(characterName);

      // Then fetch all character information in parallel
      const [basic, stat, hyperStat, propensity, ability, equipment, cashItems, beautyEquipment] = await Promise.all([
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
        enhancementScores: (fullInfo.equipment?.item_equipment || []).map(item => ({
          itemName: item.item_name,
          slot: item.item_equipment_part,
          enhancement: analyzeEquipmentPiece(item),
          score: calculateEnhancementScore(analyzeEquipmentPiece(item))
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
          recommendations: this.generateRecommendations(fullInfo, equipmentAnalysis)
        }
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
    const enhancementScore = equipmentAnalysis.enhancementScores.reduce((total: number, item: any) => total + item.score, 0);
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
    const lowEnhancementItems = equipmentAnalysis.enhancementScores.filter((item: any) => item.score < 50);
    if (lowEnhancementItems.length > 0) {
      recommendations.push(`${lowEnhancementItems.length}개의 장비 강화가 부족합니다. 스타포스와 잠재능력 개선을 고려해보세요.`);
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
}
