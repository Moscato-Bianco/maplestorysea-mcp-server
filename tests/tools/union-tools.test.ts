/**
 * Test suite for Union Tools
 * Tests union information retrieval tools
 */

import {
  GetUnionInfoTool,
  GetUnionRaiderTool,
  GetUnionRankingTool,
} from '../../src/tools/union-tools';
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

describe('Union Tools', () => {
  let mockContext: ToolContext;
  let mockUnionInfo: any;
  let mockUnionRaider: any;
  let mockUnionRanking: any;

  beforeEach(() => {
    mockUnionInfo = {
      date: '2024-01-15',
      union_level: 8000,
      union_grade: 'Grand Master',
      union_artifact_level: 40,
      union_artifact_exp: 1234567890,
      union_artifact_point: 50000,
    };

    mockUnionRaider = {
      date: '2024-01-15',
      union_raider_stat: ['STR +40', 'DEX +40', 'INT +40', 'LUK +40'],
      union_occupied_stat: ['공격력 +5', '마력 +5'],
      union_inner_stat: [
        {
          stat_field_id: 'inner_1',
          stat_field_effect: '크리티컬 확률 증가',
        },
        {
          stat_field_id: 'inner_2',
          stat_field_effect: '보스 데미지 증가',
        },
      ],
      union_block: [
        {
          block_type: 'character',
          block_class: '아크메이지(불,독)',
          block_level: '250',
          block_control_point: { x: 5, y: 5 },
          block_position: [
            { x: 5, y: 5 },
            { x: 6, y: 5 },
          ],
        },
        {
          block_type: 'character',
          block_class: '나이트로드',
          block_level: '200',
          block_control_point: { x: 3, y: 3 },
          block_position: [
            { x: 3, y: 3 },
            { x: 4, y: 3 },
          ],
        },
      ],
      use_preset_no: 1,
    };

    mockUnionRanking = {
      ranking: [
        {
          date: '2024-01-15',
          ranking: 1,
          character_name: '유니온킹',
          world_name: '스카니아',
          class_name: '아크메이지(불,독)',
          sub_class_name: '아크메이지',
          union_level: 8500,
          union_power: 95000,
        },
        {
          date: '2024-01-15',
          ranking: 2,
          character_name: '유니온퀸',
          world_name: '베라',
          class_name: '나이트로드',
          sub_class_name: '나이트로드',
          union_level: 8400,
          union_power: 94000,
        },
      ],
    };

    mockContext = {
      nexonClient: {
        getCharacterOcid: jest.fn().mockResolvedValue({ ocid: 'test-ocid-123' }),
        getUnionInfo: jest.fn(),
        getUnionRaider: jest.fn(),
        getUnionRanking: jest.fn(),
      } as any,
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      } as any,
    };
  });

  describe('GetUnionInfoTool', () => {
    let tool: GetUnionInfoTool;

    beforeEach(() => {
      tool = new GetUnionInfoTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_union_info');
        expect(tool.description).toContain('union information');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.metadata.category).toBe('union');
        expect(tool.metadata.tags).toContain('union');
        expect(tool.metadata.tags).toContain('level');
      });

      test('should have valid input schema', () => {
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toHaveProperty('characterName');
        expect(tool.inputSchema.properties).toHaveProperty('date');
        expect(tool.inputSchema.required).toContain('characterName');
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getUnionInfo as jest.Mock).mockResolvedValue(mockUnionInfo);
      });

      test('should execute successfully and format union info', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          date: '2024-01-15',
          unionLevel: 8000,
          unionGrade: 'Grand Master',
          unionArtifact: {
            level: 40,
            exp: 1234567890,
            point: 50000,
          },
        });

        expect(result.metadata).toMatchObject({
          executionTime: expect.any(Number),
          apiCalls: 2,
        });

        expect(mockContext.nexonClient.getCharacterOcid).toHaveBeenCalledWith('테스트캐릭터');
        expect(mockContext.nexonClient.getUnionInfo).toHaveBeenCalledWith('test-ocid-123', undefined);
      });

      test('should handle API errors gracefully', async () => {
        (mockContext.nexonClient.getUnionInfo as jest.Mock).mockRejectedValue(
          new Error('Union info not found')
        );

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Union info not found');
      });
    });
  });

  describe('GetUnionRaiderTool', () => {
    let tool: GetUnionRaiderTool;

    beforeEach(() => {
      tool = new GetUnionRaiderTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_union_raider');
        expect(tool.description).toContain('union raider board');
        expect(tool.metadata.category).toBe('union');
        expect(tool.metadata.tags).toContain('raider');
        expect(tool.metadata.tags).toContain('blocks');
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getUnionRaider as jest.Mock).mockResolvedValue(mockUnionRaider);
      });

      test('should execute successfully and organize block data', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          date: '2024-01-15',
          presetNo: 1,
          raiderStats: ['STR +40', 'DEX +40', 'INT +40', 'LUK +40'],
          occupiedStats: ['공격력 +5', '마력 +5'],
        });

        expect(result.data.innerStats).toHaveLength(2);
        expect(result.data.innerStats[0]).toMatchObject({
          fieldId: 'inner_1',
          effect: '크리티컬 확률 증가',
        });

        expect(result.data.blocks.total).toBe(2);
        expect(result.data.blocks.byClass).toHaveProperty('아크메이지(불,독)');
        expect(result.data.blocks.byClass).toHaveProperty('나이트로드');
        expect(result.data.blocks.byClass['아크메이지(불,독)']).toHaveLength(1);
      });

      test('should handle empty union blocks', async () => {
        const emptyRaider = { ...mockUnionRaider, union_block: [] };
        (mockContext.nexonClient.getUnionRaider as jest.Mock).mockResolvedValue(emptyRaider);

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.blocks.total).toBe(0);
        expect(result.data.blocks.byClass).toEqual({});
      });
    });
  });

  describe('GetUnionRankingTool', () => {
    let tool: GetUnionRankingTool;

    beforeEach(() => {
      tool = new GetUnionRankingTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_union_ranking');
        expect(tool.description).toContain('union power rankings');
        expect(tool.metadata.category).toBe('union');
        expect(tool.metadata.tags).toContain('ranking');
        expect(tool.metadata.tags).toContain('power');
      });

      test('should have world name enum in schema', () => {
        const worldNameProperty = tool.inputSchema.properties!.worldName as any;
        expect(worldNameProperty.enum).toContain('스카니아');
        expect(worldNameProperty.enum).toContain('리부트');
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getUnionRanking as jest.Mock).mockResolvedValue(mockUnionRanking);
      });

      test('should execute successfully without character search', async () => {
        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          page: 1,
          pageSize: 2,
          worldName: 'all',
          searchCharacter: null,
          date: 'latest',
        });

        expect(result.data.rankings).toHaveLength(2);
        expect(result.data.rankings[0]).toMatchObject({
          rank: 1,
          characterName: '유니온킹',
          world: '스카니아',
          class: '아크메이지(불,독)',
          unionLevel: 8500,
          unionPower: 95000,
        });

        expect(result.data.summary).toMatchObject({
          totalResults: 2,
          topUnionLevel: 8500,
          topUnionPower: 95000,
        });

        expect(mockContext.nexonClient.getCharacterOcid).not.toHaveBeenCalled();
        expect(mockContext.nexonClient.getUnionRanking).toHaveBeenCalledWith(undefined, undefined, 1, undefined);
      });

      test('should execute with character search', async () => {
        const result = await tool.execute({ characterName: '유니온킹' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.searchCharacter).toBe('유니온킹');
        expect(result.metadata?.apiCalls).toBe(2); // OCID lookup + ranking

        expect(mockContext.nexonClient.getCharacterOcid).toHaveBeenCalledWith('유니온킹');
        expect(mockContext.nexonClient.getUnionRanking).toHaveBeenCalledWith(undefined, 'test-ocid-123', 1, undefined);
      });

      test('should execute with world filter', async () => {
        const result = await tool.execute({ worldName: '스카니아', page: 2 }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.worldName).toBe('스카니아');
        expect(result.data.page).toBe(2);

        expect(mockContext.nexonClient.getUnionRanking).toHaveBeenCalledWith('스카니아', undefined, 2, undefined);
      });

      test('should calculate world distribution correctly', async () => {
        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.summary.worldDistribution).toEqual({
          '스카니아': 1,
          '베라': 1,
        });
      });

      test('should handle empty ranking results', async () => {
        (mockContext.nexonClient.getUnionRanking as jest.Mock).mockResolvedValue({ ranking: [] });

        const result = await tool.execute({}, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.rankings).toHaveLength(0);
        expect(result.data.summary.topUnionLevel).toBe(0);
        expect(result.data.summary.topUnionPower).toBe(0);
      });
    });
  });

  describe('Input Validation', () => {
    const tools = [
      new GetUnionInfoTool(),
      new GetUnionRaiderTool(),
    ];

    test.each(tools)('$name should require character name', (tool) => {
      expect(tool.validate({})).toBe(false);
      expect(tool.validate({ characterName: '' })).toBe(false);
      expect(tool.validate({ characterName: '테스트캐릭터' })).toBe(true);
    });

    test.each(tools)('$name should validate character name pattern', (tool) => {
      expect(tool.validate({ characterName: '한글캐릭터123' })).toBe(true);
      expect(tool.validate({ characterName: 'TestChar' })).toBe(true);
      expect(tool.validate({ characterName: 'char_invalid' })).toBe(false);
      expect(tool.validate({ characterName: 'char@invalid' })).toBe(false);
    });

    test('GetUnionRankingTool should validate optional parameters', () => {
      const tool = new GetUnionRankingTool();
      
      expect(tool.validate({})).toBe(true);
      expect(tool.validate({ worldName: '스카니아' })).toBe(true);
      expect(tool.validate({ worldName: 'InvalidWorld' })).toBe(false);
      expect(tool.validate({ page: 1 })).toBe(true);
      expect(tool.validate({ page: 0 })).toBe(false);
      expect(tool.validate({ page: 201 })).toBe(false);
    });
  });
});