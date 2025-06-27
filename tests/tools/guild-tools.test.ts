/**
 * Test suite for Guild Tools
 * Tests guild information retrieval tools
 */

import {
  GetGuildInfoTool,
  GetGuildRankingTool,
} from '../../src/tools/guild-tools';
import { ToolContext } from '../../src/tools/base-tool';

// Mock winston
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

describe('Guild Tools', () => {
  let mockContext: ToolContext;
  let mockGuildInfo: any;
  let mockGuildRanking: any;

  beforeEach(() => {
    mockGuildInfo = {
      date: '2024-01-15',
      world_name: '스카니아',
      guild_name: '테스트길드',
      guild_level: 30,
      guild_fame: 12345,
      guild_point: 98765,
      guild_master_name: '길드마스터',
      guild_member_count: 150,
      guild_member: ['길드마스터', '부길마', '멤버1', '멤버2'],
      guild_skill: [
        {
          skill_name: '급습의 대가',
          skill_description: '공격력과 마력이 증가합니다',
          skill_level: 15,
          skill_effect: '공격력 +30, 마력 +30',
          skill_icon: 'skill_icon_url',
        },
        {
          skill_name: '매직 쉴드',
          skill_description: '마법 방어력이 증가합니다',
          skill_level: 10,
          skill_effect: '마법방어력 +200',
          skill_icon: 'skill_icon_url2',
        },
      ],
      guild_noblesse_skill: [
        {
          skill_name: '노블레스 스킬',
          skill_description: '노블레스 전용 스킬입니다',
          skill_level: 5,
          skill_effect: '모든 능력치 +10',
          skill_icon: 'noblesse_skill_icon',
        },
      ],
    };

    mockGuildRanking = {
      ranking: [
        {
          date: '2024-01-15',
          ranking: 1,
          guild_name: '최강길드',
          world_name: '스카니아',
          guild_level: 35,
          guild_master_name: '최강길마',
          guild_mark: 'mark_url_1',
          guild_point: 150000,
        },
        {
          date: '2024-01-15',
          ranking: 2,
          guild_name: '강력길드',
          world_name: '베라',
          guild_level: 34,
          guild_master_name: '강력길마',
          guild_mark: 'mark_url_2',
          guild_point: 145000,
        },
      ],
    };

    mockContext = {
      nexonClient: {
        getGuildId: jest.fn().mockResolvedValue({ oguild_id: 'test-guild-id-123' }),
        getGuildBasic: jest.fn(),
        getGuildRanking: jest.fn(),
      } as any,
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      } as any,
    };
  });

  describe('GetGuildInfoTool', () => {
    let tool: GetGuildInfoTool;

    beforeEach(() => {
      tool = new GetGuildInfoTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_guild_info');
        expect(tool.description).toContain('guild');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.metadata.category).toBe('guild');
        expect(tool.metadata.tags).toContain('guild');
        expect(tool.metadata.tags).toContain('members');
      });

      test('should require both guild name and world name', () => {
        expect(tool.inputSchema.required).toContain('guildName');
        expect(tool.inputSchema.required).toContain('worldName');
      });

      test('should have world name enum in schema', () => {
        const worldNameProperty = tool.inputSchema.properties!.worldName as any;
        expect(worldNameProperty.enum).toContain('스카니아');
        expect(worldNameProperty.enum).toContain('리부트');
      });
    });

    describe('Validation', () => {
      test('should require both guild name and world name', () => {
        expect(tool.validate({})).toBe(false);
        expect(tool.validate({ guildName: '테스트길드' })).toBe(false);
        expect(tool.validate({ worldName: '스카니아' })).toBe(false);
        expect(tool.validate({ guildName: '테스트길드', worldName: '스카니아' })).toBe(true);
      });

      test('should validate world name against enum', () => {
        expect(tool.validate({ guildName: '테스트길드', worldName: '스카니아' })).toBe(true);
        expect(tool.validate({ guildName: '테스트길드', worldName: 'InvalidWorld' })).toBe(false);
      });

      test('should validate optional date format', () => {
        expect(tool.validate({ 
          guildName: '테스트길드', 
          worldName: '스카니아',
          date: '2024-01-15' 
        })).toBe(true);
        expect(tool.validate({ 
          guildName: '테스트길드', 
          worldName: '스카니아',
          date: 'invalid-date' 
        })).toBe(false);
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getGuildBasic as jest.Mock).mockResolvedValue(mockGuildInfo);
      });

      test('should execute successfully and format guild info', async () => {
        const result = await tool.execute({ 
          guildName: '테스트길드', 
          worldName: '스카니아' 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          guildName: '테스트길드',
          worldName: '스카니아',
          level: 30,
          fame: 12345,
          point: 98765,
          masterName: '길드마스터',
          memberCount: 150,
        });

        expect(result.data.members).toEqual(['길드마스터', '부길마', '멤버1', '멤버2']);

        expect(result.data.skills.regular).toHaveLength(2);
        expect(result.data.skills.regular[0]).toMatchObject({
          name: '급습의 대가',
          level: 15,
          effect: '공격력 +30, 마력 +30',
        });

        expect(result.data.skills.noblesse).toHaveLength(1);
        expect(result.data.skills.totalSkills).toBe(3);

        expect(result.metadata).toMatchObject({
          executionTime: expect.any(Number),
          apiCalls: 2,
        });

        expect(mockContext.nexonClient.getGuildId).toHaveBeenCalledWith('테스트길드', '스카니아');
        expect(mockContext.nexonClient.getGuildBasic).toHaveBeenCalledWith('test-guild-id-123', undefined);
      });

      test('should execute with date parameter', async () => {
        const result = await tool.execute({ 
          guildName: '테스트길드', 
          worldName: '스카니아',
          date: '2024-01-10'
        }, mockContext);

        expect(result.success).toBe(true);
        expect(mockContext.nexonClient.getGuildBasic).toHaveBeenCalledWith('test-guild-id-123', '2024-01-10');
      });

      test('should handle guild ID lookup failure', async () => {
        (mockContext.nexonClient.getGuildId as jest.Mock).mockRejectedValue(
          new Error('Guild not found')
        );

        const result = await tool.execute({ 
          guildName: '존재하지않는길드', 
          worldName: '스카니아' 
        }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Guild not found');
      });

      test('should handle empty guild skills', async () => {
        const guildWithoutSkills = { 
          ...mockGuildInfo, 
          guild_skill: [],
          guild_noblesse_skill: []
        };
        (mockContext.nexonClient.getGuildBasic as jest.Mock).mockResolvedValue(guildWithoutSkills);

        const result = await tool.execute({ 
          guildName: '테스트길드', 
          worldName: '스카니아' 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.skills.regular).toEqual([]);
        expect(result.data.skills.noblesse).toEqual([]);
        expect(result.data.skills.totalSkills).toBe(0);
      });
    });
  });

  describe('GetGuildRankingTool', () => {
    let tool: GetGuildRankingTool;

    beforeEach(() => {
      tool = new GetGuildRankingTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_guild_ranking');
        expect(tool.description).toContain('guild rankings');
        expect(tool.metadata.category).toBe('guild');
        expect(tool.metadata.tags).toContain('ranking');
        expect(tool.metadata.tags).toContain('leaderboard');
      });

      test('should have optional parameters in schema', () => {
        expect(tool.inputSchema.required).toBeUndefined();
        expect(tool.inputSchema.properties).toHaveProperty('worldName');
        expect(tool.inputSchema.properties).toHaveProperty('guildName');
        expect(tool.inputSchema.properties).toHaveProperty('page');
      });
    });

    describe('Validation', () => {
      test('should accept no parameters', () => {
        expect(tool.validate({})).toBe(true);
      });

      test('should validate optional world name', () => {
        expect(tool.validate({ worldName: '스카니아' })).toBe(true);
        expect(tool.validate({ worldName: 'InvalidWorld' })).toBe(false);
      });

      test('should validate page number range', () => {
        expect(tool.validate({ page: 1 })).toBe(true);
        expect(tool.validate({ page: 100 })).toBe(true);
        expect(tool.validate({ page: 0 })).toBe(false);
        expect(tool.validate({ page: 201 })).toBe(false);
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getGuildRanking as jest.Mock).mockResolvedValue(mockGuildRanking);
      });

      test('should execute successfully without filters', async () => {
        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          page: 1,
          pageSize: 2,
          worldName: 'all',
          searchGuild: null,
          date: 'latest',
        });

        expect(result.data.rankings).toHaveLength(2);
        expect(result.data.rankings[0]).toMatchObject({
          rank: 1,
          guildName: '최강길드',
          world: '스카니아',
          level: 35,
          masterName: '최강길마',
          guildPoint: 150000,
        });

        expect(result.data.summary).toMatchObject({
          totalResults: 2,
          topLevel: 35,
          averageLevel: 35, // (35 + 34) / 2 = 34.5 -> 35
          topGuildPoint: 150000,
        });

        expect(mockContext.nexonClient.getGuildRanking).toHaveBeenCalledWith('전체', 0, undefined, 1, undefined);
      });

      test('should execute with world filter', async () => {
        const result = await tool.execute({ 
          worldName: '스카니아', 
          page: 2 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.worldName).toBe('스카니아');
        expect(result.data.page).toBe(2);

        expect(mockContext.nexonClient.getGuildRanking).toHaveBeenCalledWith('스카니아', 0, undefined, 2, undefined);
      });

      test('should execute with guild name search', async () => {
        const result = await tool.execute({ 
          guildName: '테스트길드' 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.searchGuild).toBe('테스트길드');

        expect(mockContext.nexonClient.getGuildRanking).toHaveBeenCalledWith('전체', 0, '테스트길드', 1, undefined);
      });

      test('should calculate statistics correctly', async () => {
        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.summary.worldDistribution).toEqual({
          '스카니아': 1,
          '베라': 1,
        });
        expect(result.data.summary.averageLevel).toBe(35); // Math.round((35 + 34) / 2)
      });

      test('should handle empty ranking results', async () => {
        (mockContext.nexonClient.getGuildRanking as jest.Mock).mockResolvedValue({ ranking: [] });

        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.rankings).toHaveLength(0);
        expect(result.data.summary.topLevel).toBe(0);
        expect(result.data.summary.averageLevel).toBe(0);
        expect(result.data.summary.topGuildPoint).toBe(0);
      });

      test('should handle API errors gracefully', async () => {
        (mockContext.nexonClient.getGuildRanking as jest.Mock).mockRejectedValue(
          new Error('Ranking API error')
        );

        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Ranking API error');
      });
    });
  });

  describe('Input Validation', () => {
    test('GetGuildInfoTool should require both guild name and world name', () => {
      const tool = new GetGuildInfoTool();
      
      expect(tool.validate({})).toBe(false);
      expect(tool.validate({ guildName: 'test' })).toBe(false);
      expect(tool.validate({ worldName: '스카니아' })).toBe(false);
      expect(tool.validate({ guildName: 'test', worldName: '스카니아' })).toBe(true);
    });

    test('GetGuildRankingTool should accept empty parameters', () => {
      const tool = new GetGuildRankingTool();
      
      expect(tool.validate({})).toBe(true);
      expect(tool.validate({ worldName: '스카니아' })).toBe(true);
      expect(tool.validate({ guildName: 'test' })).toBe(true);
      expect(tool.validate({ page: 1 })).toBe(true);
    });
  });
});