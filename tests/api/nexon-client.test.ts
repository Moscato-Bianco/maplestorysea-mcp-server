/**
 * Test suite for NexonApiClient
 * Tests API client functionality with mocked responses
 */

import axios from 'axios';
import { NexonApiClient } from '../../src/api/nexon-client';
import { ENDPOINTS, HTTP_STATUS } from '../../src/api/constants';

// Mock axios and winston
jest.mock('axios');
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NexonApiClient', () => {
  let client: NexonApiClient;
  const mockApiKey = 'test-api-key';
  const mockAxiosInstance = {
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    
    client = new NexonApiClient({
      apiKey: mockApiKey,
    });
  });

  describe('Constructor', () => {
    test('should create client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://open.api.nexon.com',
        timeout: 10000,
        headers: {
          'x-nxopen-api-key': mockApiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'mcp-maple/1.0.0',
        },
      });
    });

    test('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Character API Methods', () => {
    const mockOcid = 'test-ocid-123';
    const mockCharacterName = 'TestCharacter';
    const mockDate = '2024-01-01';

    test('should get character OCID', async () => {
      const mockResponse = { data: { ocid: mockOcid } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getCharacterOcid(mockCharacterName);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.CHARACTER.OCID, {
        params: { character_name: mockCharacterName },
      });
      expect(result).toEqual({ ocid: mockOcid });
    });

    test('should get character basic info', async () => {
      const mockBasicInfo = {
        date: mockDate,
        character_name: mockCharacterName,
        character_level: 250,
        character_class: '아델',
        world_name: '스카니아',
      };
      const mockResponse = { data: mockBasicInfo };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getCharacterBasic(mockOcid, mockDate);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.CHARACTER.BASIC, {
        params: { ocid: mockOcid, date: mockDate },
      });
      expect(result).toEqual(mockBasicInfo);
    });

    test('should get character stat info', async () => {
      const mockStatInfo = {
        date: mockDate,
        character_class: '아델',
        final_stat: [
          { stat_name: 'STR', stat_value: '1000' },
          { stat_name: 'DEX', stat_value: '500' },
        ],
        remain_ap: 0,
      };
      const mockResponse = { data: mockStatInfo };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getCharacterStat(mockOcid, mockDate);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.CHARACTER.STAT, {
        params: { ocid: mockOcid, date: mockDate },
      });
      expect(result).toEqual(mockStatInfo);
    });

    test('should get character full info', async () => {
      const mockOcidResponse = { data: { ocid: mockOcid } };
      const mockBasicInfo = { character_name: mockCharacterName };
      const mockStatInfo = { final_stat: [] };
      const mockHyperStat = { hyper_stat_preset_1: [] };
      const mockPropensity = { charisma_level: 100 };
      const mockAbility = { ability_grade: 'LEGENDARY' };
      const mockEquipment = { item_equipment: [] };

      mockAxiosInstance.get
        .mockResolvedValueOnce(mockOcidResponse)
        .mockResolvedValueOnce({ data: mockBasicInfo })
        .mockResolvedValueOnce({ data: mockStatInfo })
        .mockResolvedValueOnce({ data: mockHyperStat })
        .mockResolvedValueOnce({ data: mockPropensity })
        .mockResolvedValueOnce({ data: mockAbility })
        .mockResolvedValueOnce({ data: mockEquipment });

      const result = await client.getCharacterFullInfo(mockCharacterName, mockDate);

      expect(result).toEqual({
        ocid: mockOcid,
        basic: mockBasicInfo,
        stat: mockStatInfo,
        hyperStat: mockHyperStat,
        propensity: mockPropensity,
        ability: mockAbility,
        equipment: mockEquipment,
      });
    });
  });

  describe('Union API Methods', () => {
    const mockOcid = 'test-ocid-123';
    const mockDate = '2024-01-01';

    test('should get union info', async () => {
      const mockUnionInfo = {
        date: mockDate,
        union_level: 8000,
        union_grade: 'GRANDMASTER',
      };
      const mockResponse = { data: mockUnionInfo };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getUnionInfo(mockOcid, mockDate);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.UNION.BASIC, {
        params: { ocid: mockOcid, date: mockDate },
      });
      expect(result).toEqual(mockUnionInfo);
    });

    test('should get union raider info', async () => {
      const mockRaiderInfo = {
        date: mockDate,
        union_raider_stat: ['STR', 'DEX'],
        union_block: [],
      };
      const mockResponse = { data: mockRaiderInfo };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getUnionRaider(mockOcid, mockDate);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.UNION.RAIDER, {
        params: { ocid: mockOcid, date: mockDate },
      });
      expect(result).toEqual(mockRaiderInfo);
    });
  });

  describe('Guild API Methods', () => {
    const mockGuildName = 'TestGuild';
    const mockWorldName = '스카니아';
    const mockGuildId = 'test-guild-id-123';
    const mockDate = '2024-01-01';

    test('should get guild ID', async () => {
      const mockResponse = { data: { oguild_id: mockGuildId } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getGuildId(mockGuildName, mockWorldName);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.GUILD.ID, {
        params: { guild_name: mockGuildName, world_name: mockWorldName },
      });
      expect(result).toEqual({ oguild_id: mockGuildId });
    });

    test('should get guild basic info', async () => {
      const mockGuildInfo = {
        date: mockDate,
        guild_name: mockGuildName,
        guild_level: 30,
        guild_master_name: 'GuildMaster',
        guild_member_count: 50,
      };
      const mockResponse = { data: mockGuildInfo };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getGuildBasic(mockGuildId, mockDate);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.GUILD.BASIC, {
        params: { oguild_id: mockGuildId, date: mockDate },
      });
      expect(result).toEqual(mockGuildInfo);
    });

    test('should get guild full info', async () => {
      const mockGuildIdResponse = { data: { oguild_id: mockGuildId } };
      const mockGuildInfo = { guild_name: mockGuildName };

      mockAxiosInstance.get
        .mockResolvedValueOnce(mockGuildIdResponse)
        .mockResolvedValueOnce({ data: mockGuildInfo });

      const result = await client.getGuildFullInfo(mockGuildName, mockWorldName, mockDate);

      expect(result).toEqual({
        oguild_id: mockGuildId,
        basic: mockGuildInfo,
      });
    });
  });

  describe('Ranking API Methods', () => {
    test('should get overall ranking', async () => {
      const mockRanking = {
        count: 10,
        ranking: [
          {
            ranking: 1,
            character_name: 'TopPlayer',
            character_level: 300,
            world_name: '스카니아',
          },
        ],
      };
      const mockResponse = { data: mockRanking };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getOverallRanking('스카니아', undefined, '아델', undefined, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.RANKING.OVERALL, {
        params: {
          world_name: '스카니아',
          world_type: undefined,
          class: '아델',
          ocid: undefined,
          page: 1,
          date: undefined,
        },
      });
      expect(result).toEqual(mockRanking);
    });

    test('should get union ranking', async () => {
      const mockRanking = {
        count: 10,
        ranking: [
          {
            ranking: 1,
            character_name: 'TopUnion',
            union_level: 8500,
            world_name: '스카니아',
          },
        ],
      };
      const mockResponse = { data: mockRanking };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.getUnionRanking('스카니아', undefined, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(ENDPOINTS.RANKING.UNION, {
        params: {
          world_name: '스카니아',
          ocid: undefined,
          page: 1,
          date: undefined,
        },
      });
      expect(result).toEqual(mockRanking);
    });
  });

  describe('Health Check', () => {
    test('should return healthy status when API is accessible', async () => {
      const mockResponse = { data: { ranking: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await client.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    test('should return unhealthy status when API is not accessible', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      const result = await client.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors', async () => {
      const mockError = {
        response: {
          status: HTTP_STATUS.NOT_FOUND,
          data: { message: 'Character not found' },
        },
        config: { url: ENDPOINTS.CHARACTER.BASIC },
      };
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(client.getCharacterBasic('invalid-ocid')).rejects.toBeDefined();
    });

    test('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(client.getCharacterBasic('test-ocid')).rejects.toBeDefined();
    });
  });
});