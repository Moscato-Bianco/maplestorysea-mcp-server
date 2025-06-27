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
import { API_CONFIG, ENDPOINTS, HEADERS, HTTP_STATUS, ERROR_MESSAGES } from './constants';

export class NexonApiClient {
  private client: AxiosInstance;
  private logger: Logger;
  private apiKey: string;

  constructor(config: ApiClientConfig) {
    this.apiKey = config.apiKey;
    this.logger = createLogger({
      level: 'info',
      format: require('winston').format.combine(
        require('winston').format.timestamp(),
        require('winston').format.json()
      ),
      transports: [new (require('winston').transports.Console)()],
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

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  // Character API methods
  async getCharacterOcid(characterName: string): Promise<{ ocid: string }> {
    return this.request(ENDPOINTS.CHARACTER.OCID, { character_name: characterName });
  }

  async getCharacterBasic(ocid: string, date?: string): Promise<CharacterBasic> {
    return this.request(ENDPOINTS.CHARACTER.BASIC, { ocid, date });
  }

  async getCharacterStat(ocid: string, date?: string): Promise<CharacterStat> {
    return this.request(ENDPOINTS.CHARACTER.STAT, { ocid, date });
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
    return this.request(ENDPOINTS.CHARACTER.ITEM_EQUIPMENT, { ocid, date });
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
      const [basic, stat, hyperStat, propensity, ability, equipment] = await Promise.all([
        this.getCharacterBasic(ocid, date),
        this.getCharacterStat(ocid, date),
        this.getCharacterHyperStat(ocid, date),
        this.getCharacterPropensity(ocid, date),
        this.getCharacterAbility(ocid, date),
        this.getCharacterItemEquipment(ocid, date),
      ]);

      return {
        ocid,
        basic,
        stat,
        hyperStat,
        propensity,
        ability,
        equipment,
      };
    } catch (error) {
      this.logger.error('Error fetching character full info', {
        characterName,
        error,
      });
      throw error;
    }
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
