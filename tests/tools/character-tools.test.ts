/**
 * Test suite for Character Tools
 * Tests character information retrieval tools
 */

import {
  GetCharacterBasicInfoTool,
  GetCharacterStatsTool,
  GetCharacterEquipmentTool,
  GetCharacterFullInfoTool,
} from '../../src/tools/character-tools';
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

describe('Character Tools', () => {
  let mockContext: ToolContext;
  let mockCharacterBasic: any;
  let mockCharacterStats: any;
  let mockCharacterEquipment: any;

  beforeEach(() => {
    mockCharacterBasic = {
      character_name: '테스트캐릭터',
      character_level: 250,
      character_class: '아크메이지(불,독)',
      character_class_level: '4',
      character_exp: 12345678901234,
      character_exp_rate: '67.45',
      character_guild_name: '테스트길드',
      world_name: '스카니아',
      character_gender: '남',
      date: '2024-01-15',
    };

    mockCharacterStats = {
      date: '2024-01-15',
      remain_ap: 0,
      final_stat: [
        { stat_name: 'STR', stat_value: '4' },
        { stat_name: 'DEX', stat_value: '4' },
        { stat_name: 'INT', stat_value: '55234' },
        { stat_name: 'LUK', stat_value: '4' },
        { stat_name: 'HP', stat_value: '123456' },
        { stat_name: 'MP', stat_value: '78910' },
        { stat_name: '공격력', stat_value: '12345' },
        { stat_name: '마력', stat_value: '98765' },
        { stat_name: '크리티컬 확률', stat_value: '100.00%' },
        { stat_name: '크리티컬 데미지', stat_value: '245.00%' },
        { stat_name: '보스 몬스터 데미지', stat_value: '287.00%' },
        { stat_name: '방어율 무시', stat_value: '93.50%' },
        { stat_name: '데미지', stat_value: '567.00%' },
        { stat_name: '물리방어력', stat_value: '4567' },
        { stat_name: '마법방어력', stat_value: '4567' },
      ],
    };

    mockCharacterEquipment = {
      date: '2024-01-15',
      preset_no: 1,
      title: {
        title_name: '테스트 타이틀',
        title_icon: 'title_icon_url',
        title_description: '테스트용 타이틀입니다',
        date_expire: null,
        date_option_expire: null,
      },
      item_equipment: [
        {
          item_equipment_slot: '무기',
          item_name: '테스트 무기',
          item_icon: 'weapon_icon_url',
          item_description: '강력한 테스트 무기',
          item_shape_icon: 'weapon_shape_icon_url',
          item_shape_name: '테스트 무기 형태',
          item_gender: null,
          starforce: 22,
          starforce_scroll_flag: 0,
          potential_option_grade: '레전드리',
          potential_option_1: 'INT : +12%',
          potential_option_2: '마력 : +9%',
          potential_option_3: '몬스터 방어율 무시 : +30%',
          additional_potential_option_grade: '레전드리',
          additional_potential_option_1: 'INT : +6%',
          additional_potential_option_2: '마력 : +6%',
          additional_potential_option_3: '크리티컬 데미지 : +6%',
          scroll_upgrade: 8,
          scroll_upgradeable_count: 0,
          scroll_resilience_count: 0,
          scroll_upgrade_count: 8,
          cuttable_count: 255,
          golden_hammer_flag: 1,
          item_total_option: {
            str: '0',
            dex: '0',
            int: '567',
            luk: '0',
            max_hp: '0',
            max_mp: '0',
            attack_power: '456',
            magic_power: '456',
            armor: '0',
            speed: '0',
            jump: '0',
            boss_damage: '0',
            ignore_monster_armor: '0',
            all_stat: '0',
            damage: '0',
            equipment_level_decrease: 0,
            max_hp_rate: '0',
            max_mp_rate: '0',
          },
          item_base_option: {
            str: '0',
            dex: '0',
            int: '345',
            luk: '0',
            max_hp: '0',
            max_mp: '0',
            attack_power: '234',
            magic_power: '234',
            armor: '0',
            speed: '0',
            jump: '0',
            boss_damage: '0',
            ignore_monster_armor: '0',
            all_stat: '0',
            damage: '0',
            equipment_level_decrease: 0,
            max_hp_rate: '0',
            max_mp_rate: '0',
          },
          item_exceptional_option: null,
          item_add_option: null,
          item_starforce_option: {
            str: '0',
            dex: '0',
            int: '222',
            luk: '0',
            max_hp: '0',
            max_mp: '0',
            attack_power: '222',
            magic_power: '222',
            armor: '0',
            speed: '0',
            jump: '0',
            boss_damage: '0',
            ignore_monster_armor: '0',
            all_stat: '0',
            damage: '0',
            equipment_level_decrease: 0,
            max_hp_rate: '0',
            max_mp_rate: '0',
          },
          item_etc_option: null,
        },
      ],
    };

    mockContext = {
      nexonClient: {
        getCharacterOcid: jest.fn(),
        getCharacterBasic: jest.fn(),
        getCharacterStat: jest.fn(),
        getCharacterItemEquipment: jest.fn(),
      } as any,
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      } as any,
    };
  });

  describe('GetCharacterBasicInfoTool', () => {
    let tool: GetCharacterBasicInfoTool;

    beforeEach(() => {
      tool = new GetCharacterBasicInfoTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_character_basic_info');
        expect(tool.description).toContain('basic information');
        expect(tool.inputSchema).toBeDefined();
        expect(tool.metadata.category).toBe('character');
        expect(tool.metadata.tags).toContain('character');
        expect(tool.metadata.tags).toContain('basic');
      });

      test('should have valid input schema', () => {
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toHaveProperty('characterName');
        expect(tool.inputSchema.properties).toHaveProperty('date');
        expect(tool.inputSchema.required).toContain('characterName');
        expect(tool.inputSchema.additionalProperties).toBe(false);
      });

      test('should have examples in metadata', () => {
        expect(tool.metadata.examples).toHaveLength(2);
        expect(tool.metadata.examples[0].description).toContain('basic info');
        expect(tool.metadata.examples[1].description).toContain('specific date');
      });
    });

    describe('Validation', () => {
      test('should validate required characterName', () => {
        expect(tool.validate({})).toBe(false);
        expect(tool.validate({ characterName: '' })).toBe(false);
        expect(tool.validate({ characterName: '테스트캐릭터' })).toBe(true);
      });

      test('should validate optional date format', () => {
        expect(tool.validate({ characterName: '테스트캐릭터' })).toBe(true);
        expect(tool.validate({ characterName: '테스트캐릭터', date: '2024-01-15' })).toBe(true);
        expect(tool.validate({ characterName: '테스트캐릭터', date: 'invalid-date' })).toBe(false);
      });

      test('should validate character name pattern', () => {
        expect(tool.validate({ characterName: '테스트캐릭터123' })).toBe(true);
        expect(tool.validate({ characterName: 'TestChar' })).toBe(true);
        expect(tool.validate({ characterName: '캐릭터_테스트' })).toBe(false); // underscore not allowed
        expect(tool.validate({ characterName: '캐릭터@테스트' })).toBe(false); // special chars not allowed
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockResolvedValue({ ocid: 'test-ocid-123' });
        (mockContext.nexonClient.getCharacterBasic as jest.Mock).mockResolvedValue(mockCharacterBasic);
      });

      test('should execute successfully with character name only', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          level: 250,
          job: '아크메이지(불,독)',
          world: '스카니아',
          guildName: '테스트길드',
        });

        expect(result.metadata).toMatchObject({
          executionTime: expect.any(Number),
          cacheHit: false,
          apiCalls: 2,
        });

        expect(mockContext.nexonClient.getCharacterOcid).toHaveBeenCalledWith('테스트캐릭터');
        expect(mockContext.nexonClient.getCharacterBasic).toHaveBeenCalledWith('test-ocid-123', undefined);
      });

      test('should execute successfully with date parameter', async () => {
        const result = await tool.execute({ 
          characterName: '테스트캐릭터', 
          date: '2024-01-15' 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.date).toBe('2024-01-15');
        expect(mockContext.nexonClient.getCharacterBasic).toHaveBeenCalledWith('test-ocid-123', '2024-01-15');
      });

      test('should handle API errors gracefully', async () => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockRejectedValue(
          new Error('Character not found')
        );

        const result = await tool.execute({ characterName: '존재하지않는캐릭터' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Character not found');
      });

      test('should handle missing guild name', async () => {
        const basicInfoNoGuild = { ...mockCharacterBasic, character_guild_name: null };
        (mockContext.nexonClient.getCharacterBasic as jest.Mock).mockResolvedValue(basicInfoNoGuild);

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.guildName).toBe(null);
      });
    });
  });

  describe('GetCharacterStatsTool', () => {
    let tool: GetCharacterStatsTool;

    beforeEach(() => {
      tool = new GetCharacterStatsTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_character_stats');
        expect(tool.description).toContain('detailed statistics');
        expect(tool.metadata.category).toBe('character');
        expect(tool.metadata.tags).toContain('stats');
        expect(tool.metadata.tags).toContain('damage');
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockResolvedValue({ ocid: 'test-ocid-123' });
        (mockContext.nexonClient.getCharacterStat as jest.Mock).mockResolvedValue(mockCharacterStats);
      });

      test('should execute successfully and categorize stats', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          date: '2024-01-15',
          remainAp: 0,
        });

        expect(result.data.basicStats).toMatchObject({
          STR: '4',
          DEX: '4',
          INT: '55234',
          LUK: '4',
          HP: '123456',
          MP: '78910',
        });

        expect(result.data.combatStats).toMatchObject({
          '공격력': '12345',
          '마력': '98765',
          '크리티컬 확률': '100.00%',
          '크리티컬 데미지': '245.00%',
        });

        expect(result.data.defenseStats).toMatchObject({
          '물리방어력': '4567',
          '마법방어력': '4567',
        });

        expect(result.data.allStats).toBeDefined();
        expect(Object.keys(result.data.allStats).length).toBeGreaterThan(10);
      });

      test('should handle missing stats gracefully', async () => {
        const emptyStats = { ...mockCharacterStats, final_stat: [] };
        (mockContext.nexonClient.getCharacterStat as jest.Mock).mockResolvedValue(emptyStats);

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.basicStats).toEqual({});
        expect(result.data.combatStats).toEqual({});
        expect(result.data.allStats).toEqual({});
      });
    });
  });

  describe('GetCharacterEquipmentTool', () => {
    let tool: GetCharacterEquipmentTool;

    beforeEach(() => {
      tool = new GetCharacterEquipmentTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_character_equipment');
        expect(tool.description).toContain('equipment information');
        expect(tool.metadata.category).toBe('character');
        expect(tool.metadata.tags).toContain('equipment');
        expect(tool.metadata.tags).toContain('items');
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockResolvedValue({ ocid: 'test-ocid-123' });
        (mockContext.nexonClient.getCharacterItemEquipment as jest.Mock).mockResolvedValue(mockCharacterEquipment);
      });

      test('should execute successfully and organize equipment by slot', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          date: '2024-01-15',
          presetNo: 1,
        });

        expect(result.data.equipment['무기']).toMatchObject({
          name: '테스트 무기',
          icon: 'weapon_icon_url',
          starforce: 22,
          potential: '레전드리',
          potentialOptions: ['INT : +12%', '마력 : +9%', '몬스터 방어율 무시 : +30%'],
        });

        expect(result.data.equipmentList).toHaveLength(1);
        expect(result.data.title).toMatchObject({
          title_name: '테스트 타이틀',
        });
      });

      test('should handle empty equipment list', async () => {
        const emptyEquipment = { ...mockCharacterEquipment, item_equipment: [] };
        (mockContext.nexonClient.getCharacterItemEquipment as jest.Mock).mockResolvedValue(emptyEquipment);

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.equipment).toEqual({});
        expect(result.data.equipmentList).toEqual([]);
      });
    });
  });

  describe('GetCharacterFullInfoTool', () => {
    let tool: GetCharacterFullInfoTool;

    beforeEach(() => {
      tool = new GetCharacterFullInfoTool();
    });

    describe('Tool Properties', () => {
      test('should have correct properties', () => {
        expect(tool.name).toBe('get_character_full_info');
        expect(tool.description).toContain('comprehensive character information');
        expect(tool.metadata.category).toBe('character');
        expect(tool.metadata.tags).toContain('comprehensive');
        expect(tool.metadata.tags).toContain('full');
      });

      test('should have includeEquipment option in schema', () => {
        expect(tool.inputSchema.properties).toHaveProperty('includeEquipment');
        const equipmentProperty = tool.inputSchema.properties!.includeEquipment as any;
        expect(equipmentProperty.type).toBe('boolean');
        expect(equipmentProperty.default).toBe(true);
      });
    });

    describe('Execution', () => {
      beforeEach(() => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockResolvedValue({ ocid: 'test-ocid-123' });
        (mockContext.nexonClient.getCharacterBasic as jest.Mock).mockResolvedValue(mockCharacterBasic);
        (mockContext.nexonClient.getCharacterStat as jest.Mock).mockResolvedValue(mockCharacterStats);
        (mockContext.nexonClient.getCharacterItemEquipment as jest.Mock).mockResolvedValue(mockCharacterEquipment);
      });

      test('should execute successfully with all data included', async () => {
        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toMatchObject({
          characterName: '테스트캐릭터',
          date: 'latest',
        });

        // Check basic info structure
        expect(result.data.basicInfo).toMatchObject({
          level: 250,
          job: '아크메이지(불,독)',
          world: '스카니아',
          guildName: '테스트길드',
        });

        // Check stats structure
        expect(result.data.stats.basicStats).toMatchObject({
          INT: '55234',
          HP: '123456',
        });

        expect(result.data.stats.combatStats).toMatchObject({
          '공격력': '12345',
          '마력': '98765',
        });

        // Check equipment structure
        expect(result.data.equipment).toBeDefined();
        expect(result.data.equipment.presetNo).toBe(1);
        expect(result.data.equipment.items['무기']).toMatchObject({
          name: '테스트 무기',
          starforce: 22,
        });

        expect(result.metadata?.apiCalls).toBe(4); // OCID + basic + stats + equipment
      });

      test('should execute without equipment when includeEquipment is false', async () => {
        const result = await tool.execute({ 
          characterName: '테스트캐릭터',
          includeEquipment: false 
        }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data.equipment).toBeUndefined();
        expect(result.metadata?.apiCalls).toBe(3); // OCID + basic + stats only

        expect(mockContext.nexonClient.getCharacterItemEquipment).not.toHaveBeenCalled();
      });

      test('should handle parallel API call failures gracefully', async () => {
        (mockContext.nexonClient.getCharacterStat as jest.Mock).mockRejectedValue(
          new Error('Stats API error')
        );

        const result = await tool.execute({ characterName: '테스트캐릭터' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Stats API error');
      });

      test('should use provided date parameter', async () => {
        const result = await tool.execute({ 
          characterName: '테스트캐릭터',
          date: '2024-01-10'
        }, mockContext);

        expect(result.success).toBe(true);
        expect(mockContext.nexonClient.getCharacterBasic).toHaveBeenCalledWith('test-ocid-123', '2024-01-10');
        expect(mockContext.nexonClient.getCharacterStat).toHaveBeenCalledWith('test-ocid-123', '2024-01-10');
        expect(mockContext.nexonClient.getCharacterItemEquipment).toHaveBeenCalledWith('test-ocid-123', '2024-01-10');
      });
    });

    describe('Error Handling', () => {
      test('should handle OCID lookup failure', async () => {
        (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockRejectedValue(
          new Error('Character does not exist')
        );

        const result = await tool.execute({ characterName: '존재하지않는캐릭터' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Character does not exist');
      });

      test('should validate invalid arguments', async () => {
        await expect(tool.execute({ characterName: '' }, mockContext)).rejects.toThrow(
          'Invalid arguments provided'
        );
      });
    });
  });

  describe('All Character Tools Input Validation', () => {
    const tools = [
      new GetCharacterBasicInfoTool(),
      new GetCharacterStatsTool(),
      new GetCharacterEquipmentTool(),
      new GetCharacterFullInfoTool(),
    ];

    test.each(tools)('$name should reject empty character name', (tool) => {
      expect(tool.validate({ characterName: '' })).toBe(false);
      expect(tool.validate({})).toBe(false);
    });

    test.each(tools)('$name should accept valid character names', (tool) => {
      expect(tool.validate({ characterName: '테스트캐릭터' })).toBe(true);
      expect(tool.validate({ characterName: 'TestChar123' })).toBe(true);
      expect(tool.validate({ characterName: '한글캐릭터789' })).toBe(true);
    });

    test.each(tools)('$name should reject invalid character names', (tool) => {
      expect(tool.validate({ characterName: 'char_with_underscore' })).toBe(false);
      expect(tool.validate({ characterName: 'char@special' })).toBe(false);
      expect(tool.validate({ characterName: 'char with space' })).toBe(false);
    });

    test.each(tools)('$name should validate date format', (tool) => {
      expect(tool.validate({ characterName: '테스트캐릭터', date: '2024-01-15' })).toBe(true);
      expect(tool.validate({ characterName: '테스트캐릭터', date: 'invalid-date' })).toBe(false);
      expect(tool.validate({ characterName: '테스트캐릭터', date: '24-01-15' })).toBe(false);
      expect(tool.validate({ characterName: '테스트캐릭터', date: '2024/01/15' })).toBe(false);
    });
  });
});