/**
 * Integration tests for MCP tools
 * Tests the actual tool functionality with mock API responses
 */

import { jest } from '@jest/globals';
import { createAllTools } from '../../src/tools/index';
import { MockNexonApiClient } from '../helpers/mock-api-client';
import { McpLogger } from '../../src/utils/logger';
import { defaultCache } from '../../src/utils/cache';

// Mock logger to avoid console output during tests
const mockLogger: McpLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logApiRequest: jest.fn(),
  logApiResponse: jest.fn(),
  logApiError: jest.fn(),
  logCacheOperation: jest.fn(),
  logCharacterOperation: jest.fn(),
  logGuildOperation: jest.fn(),
  logUnionOperation: jest.fn(),
  logRankingOperation: jest.fn(),
  logRateLimit: jest.fn(),
  logHealthCheck: jest.fn(),
  logSecurityEvent: jest.fn(),
  logRecoveryAttempt: jest.fn(),
} as McpLogger;

describe('MCP Tools Integration Tests', () => {
  let tools: ReturnType<typeof createAllTools>;
  let mockApiClient: MockNexonApiClient;

  beforeEach(() => {
    mockApiClient = new MockNexonApiClient();
    tools = createAllTools();
  });

  afterEach(() => {
    jest.clearAllMocks();
    defaultCache.clear();
  });

  describe('Character Tools', () => {
    test('get_character_basic_info should return character information', async () => {
      const basicInfoTool = tools.find(tool => tool.name === 'get_character_basic_info');
      expect(basicInfoTool).toBeDefined();

      const result = await basicInfoTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('characterName', 'TestChar');
      expect(result.data).toHaveProperty('level');
      expect(result.data).toHaveProperty('world');
      expect(mockApiClient.getCharacterOcid).toHaveBeenCalledWith('TestChar');
      expect(mockApiClient.getCharacterBasic).toHaveBeenCalled();
    });

    test('get_character_stats should return character statistics', async () => {
      const statsTool = tools.find(tool => tool.name === 'get_character_stats');
      expect(statsTool).toBeDefined();

      const result = await statsTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('basicStats');
      expect(result.data).toHaveProperty('combatStats');
      expect(result.data).toHaveProperty('allStats');
      expect(mockApiClient.getCharacterStat).toHaveBeenCalled();
    });

    test('get_character_equipment should return equipment information', async () => {
      const equipmentTool = tools.find(tool => tool.name === 'get_character_equipment');
      expect(equipmentTool).toBeDefined();

      const result = await equipmentTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('equipment');
      expect(mockApiClient.getCharacterItemEquipment).toHaveBeenCalled();
    });

    test('get_character_full_info should return comprehensive character data', async () => {
      const fullInfoTool = tools.find(tool => tool.name === 'get_character_full_info');
      expect(fullInfoTool).toBeDefined();

      const result = await fullInfoTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('basicInfo');
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('equipment');
    });

    test('find_character_ranking should return ranking position', async () => {
      const rankingTool = tools.find(tool => tool.name === 'find_character_ranking');
      expect(rankingTool).toBeDefined();

      const result = await rankingTool!.execute(
        { characterName: 'TestChar', worldName: 'Aquila' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('ranking');
      expect(mockApiClient.getOverallRanking).toHaveBeenCalled();
    });
  });

  describe('Union Tools', () => {
    test('get_union_info should return union information', async () => {
      const unionTool = tools.find(tool => tool.name === 'get_union_info');
      expect(unionTool).toBeDefined();

      const result = await unionTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('unionLevel');
      expect(mockApiClient.getUnionInfo).toHaveBeenCalled();
    });

    test('get_union_raider should return raider board information', async () => {
      const raiderTool = tools.find(tool => tool.name === 'get_union_raider');
      expect(raiderTool).toBeDefined();

      const result = await raiderTool!.execute(
        { characterName: 'TestChar' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('raiderStats');
      expect(mockApiClient.getUnionRaider).toHaveBeenCalled();
    });

    test('get_union_ranking should return union rankings', async () => {
      const unionRankingTool = tools.find(tool => tool.name === 'get_union_ranking');
      expect(unionRankingTool).toBeDefined();

      const result = await unionRankingTool!.execute(
        { worldName: 'Aquila' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('rankings');
      expect(mockApiClient.getUnionRanking).toHaveBeenCalled();
    });
  });

  describe('Guild Tools', () => {
    test('get_guild_info should return guild information', async () => {
      const guildTool = tools.find(tool => tool.name === 'get_guild_info');
      expect(guildTool).toBeDefined();

      const result = await guildTool!.execute(
        { guildName: 'TestGuild', worldName: 'Aquila' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('guildName');
      expect(result.data).toHaveProperty('level');
      expect(mockApiClient.getGuildInfo).toHaveBeenCalled();
    });

    test('search_guilds should return guild search results', async () => {
      const searchTool = tools.find(tool => tool.name === 'search_guilds');
      expect(searchTool).toBeDefined();

      const result = await searchTool!.execute(
        { searchTerm: 'Test', worldName: 'Aquila' },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('results');
      expect(result.data.results).toBeInstanceOf(Array);
    });

    test('get_guild_ranking should return guild rankings', async () => {
      const guildRankingTool = tools.find(tool => tool.name === 'get_guild_ranking');
      expect(guildRankingTool).toBeDefined();

      const result = await guildRankingTool!.execute(
        { worldName: 'Aquila', rankingType: 0 },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('rankings');
      expect(mockApiClient.getGuildRanking).toHaveBeenCalled();
    });
  });

  describe('Ranking Tools', () => {
    test('get_overall_ranking should return overall rankings', async () => {
      const overallRankingTool = tools.find(tool => tool.name === 'get_overall_ranking');
      expect(overallRankingTool).toBeDefined();

      const result = await overallRankingTool!.execute(
        { worldName: 'Aquila', page: 1 },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('rankings');
      expect(result.data.rankings).toBeInstanceOf(Array);
      expect(mockApiClient.getOverallRanking).toHaveBeenCalled();
    });
  });

  describe('Health Check Tool', () => {
    test('health_check should return system health status', async () => {
      const healthTool = tools.find(tool => tool.name === 'health_check');
      expect(healthTool).toBeDefined();

      const result = await healthTool!.execute(
        { detailed: false },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('uptime');
    });

    test('health_check with detailed option should return component details', async () => {
      const healthTool = tools.find(tool => tool.name === 'health_check');
      expect(healthTool).toBeDefined();

      const result = await healthTool!.execute(
        { detailed: true },
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('details');
      expect(result.data.details).toBeInstanceOf(Object);
    });
  });

  describe('Error Handling', () => {
    test('tools should handle invalid character names gracefully', async () => {
      const basicInfoTool = tools.find(tool => tool.name === 'get_character_basic_info');
      expect(basicInfoTool).toBeDefined();

      const result = await basicInfoTool!.execute(
        { characterName: '한국이름' }, // Korean characters not allowed in SEA
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid character name');
    });

    test('tools should handle invalid world names gracefully', async () => {
      const guildTool = tools.find(tool => tool.name === 'get_guild_info');
      expect(guildTool).toBeDefined();

      const result = await guildTool!.execute(
        { guildName: 'TestGuild', worldName: 'Scania' }, // Invalid SEA world
        {
          nexonClient: mockApiClient as any,
          logger: mockLogger,
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid world name');
    });
  });

  describe('SEA API Compliance', () => {
    test('all tools should only support SEA worlds', () => {
      const validWorlds = ['Aquila', 'Bootes', 'Cassiopeia', 'Draco'];
      
      tools.forEach(tool => {
        if (tool.inputSchema.properties?.worldName) {
          const worldEnum = (tool.inputSchema.properties.worldName as any).enum;
          if (worldEnum) {
            expect(worldEnum).toEqual(validWorlds);
          }
        }
      });
    });

    test('character name patterns should only allow English characters', () => {
      tools.forEach(tool => {
        if (tool.inputSchema.properties?.characterName) {
          const charNameSchema = tool.inputSchema.properties.characterName as any;
          if (charNameSchema.pattern) {
            expect(charNameSchema.pattern).not.toMatch(/가-힣/);
            expect(charNameSchema.pattern).toMatch(/a-zA-Z0-9/);
          }
        }
      });
    });
  });
});