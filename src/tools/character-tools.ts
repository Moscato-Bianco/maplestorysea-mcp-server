/**
 * Character Information Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory character data
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting basic character information
 */
export class GetCharacterBasicInfoTool extends EnhancedBaseTool {
  public readonly name = 'get_character_basic_info';
  public readonly description =
    'Retrieve basic information about a MapleStory character including level, job, world, and guild';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9가-힣]+$',
      },
      date: {
        type: 'string',
        description:
          'Date for character info in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.CHARACTER,
    tags: ['character', 'basic', 'info', 'level', 'job'],
    examples: [
      {
        description: 'Get basic info for character',
        arguments: { characterName: '스카니아용사' },
      },
      {
        description: 'Get basic info for specific date',
        arguments: { characterName: '스카니아용사', date: '2024-01-15' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const characterName = this.getRequiredString(args, 'characterName');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      // Get character OCID first
      context.logger.info('Looking up character OCID', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get basic character info
      context.logger.info('Fetching character basic info', { characterName, ocid });
      const basicInfo = await context.nexonClient.getCharacterBasic(ocid, date);

      const executionTime = Date.now() - startTime;

      context.logger.info('Character basic info retrieved successfully', {
        characterName,
        level: basicInfo.character_level,
        job: basicInfo.character_class,
        executionTime,
      });

      return this.formatResult(
        {
          characterName: basicInfo.character_name,
          level: basicInfo.character_level,
          job: basicInfo.character_class,
          jobDetail: basicInfo.character_class_level,
          exp: basicInfo.character_exp,
          expRate: basicInfo.character_exp_rate,
          guildName: basicInfo.character_guild_name || null,
          world: basicInfo.world_name,
          gender: basicInfo.character_gender,
          // Basic stats are not available in CharacterBasic endpoint
          // They need to be fetched separately from getCharacterStat
          date: basicInfo.date || date || 'latest',
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // OCID lookup + basic info
        }
      );
    } catch (error) {
      context.logger.error('Failed to get character basic info', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get basic info for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting detailed character statistics
 */
export class GetCharacterStatsTool extends EnhancedBaseTool {
  public readonly name = 'get_character_stats';
  public readonly description =
    'Retrieve detailed statistics for a MapleStory character including damage, critical rate, and all combat stats';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9가-힣]+$',
      },
      date: {
        type: 'string',
        description:
          'Date for character stats in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.CHARACTER,
    tags: ['character', 'stats', 'damage', 'critical', 'combat'],
    examples: [
      {
        description: 'Get detailed stats for character',
        arguments: { characterName: '스카니아용사' },
      },
      {
        description: 'Get stats for specific date',
        arguments: { characterName: '스카니아용사', date: '2024-01-15' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const characterName = this.getRequiredString(args, 'characterName');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      // Get character OCID first
      context.logger.info('Looking up character OCID for stats', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get character stats
      context.logger.info('Fetching character detailed stats', { characterName, ocid });
      const stats = await context.nexonClient.getCharacterStat(ocid, date);

      const executionTime = Date.now() - startTime;

      // Group stats by category for better presentation
      const basicStats =
        stats.final_stat?.filter((s) =>
          ['STR', 'DEX', 'INT', 'LUK', 'HP', 'MP'].includes(s.stat_name)
        ) || [];

      const combatStats =
        stats.final_stat?.filter((s) =>
          [
            '공격력',
            '마력',
            '크리티컬 확률',
            '크리티컬 데미지',
            '보스 몬스터 데미지',
            '방어율 무시',
            '데미지',
          ].includes(s.stat_name)
        ) || [];

      const defenseStats =
        stats.final_stat?.filter((s) =>
          ['물리방어력', '마법방어력', '스탠스', '방어율'].includes(s.stat_name)
        ) || [];

      context.logger.info('Character stats retrieved successfully', {
        characterName,
        statCount: stats.final_stat?.length || 0,
        executionTime,
      });

      return this.formatResult(
        {
          characterName,
          date: stats.date || date || 'latest',
          basicStats: basicStats.reduce(
            (acc, stat) => {
              acc[stat.stat_name] = stat.stat_value;
              return acc;
            },
            {} as Record<string, string>
          ),
          combatStats: combatStats.reduce(
            (acc, stat) => {
              acc[stat.stat_name] = stat.stat_value;
              return acc;
            },
            {} as Record<string, string>
          ),
          defenseStats: defenseStats.reduce(
            (acc, stat) => {
              acc[stat.stat_name] = stat.stat_value;
              return acc;
            },
            {} as Record<string, string>
          ),
          allStats:
            stats.final_stat?.reduce(
              (acc, stat) => {
                acc[stat.stat_name] = stat.stat_value;
                return acc;
              },
              {} as Record<string, string>
            ) || {},
          remainAp: stats.remain_ap,
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // OCID lookup + stats
        }
      );
    } catch (error) {
      context.logger.error('Failed to get character stats', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get stats for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting character equipment information
 */
export class GetCharacterEquipmentTool extends EnhancedBaseTool {
  public readonly name = 'get_character_equipment';
  public readonly description =
    'Retrieve equipment information for a MapleStory character including all equipped items and their stats';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9가-힣]+$',
      },
      date: {
        type: 'string',
        description:
          'Date for character equipment in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.CHARACTER,
    tags: ['character', 'equipment', 'items', 'gear', 'weapon'],
    examples: [
      {
        description: 'Get equipment for character',
        arguments: { characterName: '스카니아용사' },
      },
      {
        description: 'Get equipment for specific date',
        arguments: { characterName: '스카니아용사', date: '2024-01-15' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const characterName = this.getRequiredString(args, 'characterName');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      // Get character OCID first
      context.logger.info('Looking up character OCID for equipment', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get character equipment
      context.logger.info('Fetching character equipment', { characterName, ocid });
      const equipment = await context.nexonClient.getCharacterItemEquipment(ocid, date);

      const executionTime = Date.now() - startTime;

      // Organize equipment by category
      const equipmentBySlot =
        equipment.item_equipment?.reduce(
          (acc, item) => {
            acc[item.item_equipment_slot] = {
              name: item.item_name,
              icon: item.item_icon,
              description: item.item_description,
              shapeIcon: item.item_shape_icon,
              shapeName: item.item_shape_name,
              gender: item.item_gender,
              totalOption: item.item_total_option,
              baseOption: item.item_base_option,
              exceptionalOption: item.item_exceptional_option,
              addOption: item.item_add_option,
              starforceOption: item.item_starforce_option,
              etcOption: item.item_etc_option,
              starforce: item.starforce,
              starforceScrollFlag: item.starforce_scroll_flag,
              cuttableCount: item.cuttable_count,
              goldenHammerFlag: item.golden_hammer_flag,
              scrollUpgrade: item.scroll_upgrade,
              scrollUpgradableCount: item.scroll_upgradeable_count,
              scrollResilienceCount: item.scroll_resilience_count,
              scrollUpgradeCount: item.scroll_upgradeable_count,
              potential: item.potential_option_grade,
              potentialOptions: [
                item.potential_option_1,
                item.potential_option_2,
                item.potential_option_3,
              ].filter(Boolean),
              additionalPotential: item.additional_potential_option_grade,
              additionalPotentialOptions: [
                item.additional_potential_option_1,
                item.additional_potential_option_2,
                item.additional_potential_option_3,
              ].filter(Boolean),
            };
            return acc;
          },
          {} as Record<string, any>
        ) || {};

      context.logger.info('Character equipment retrieved successfully', {
        characterName,
        equipmentCount: equipment.item_equipment?.length || 0,
        executionTime,
      });

      return this.formatResult(
        {
          characterName,
          date: equipment.date || date || 'latest',
          equipment: equipmentBySlot,
          equipmentList: equipment.item_equipment || [],
          presetNo: equipment.preset_no,
          title: equipment.title,
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // OCID lookup + equipment
        }
      );
    } catch (error) {
      context.logger.error('Failed to get character equipment', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get equipment for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting comprehensive character information (combines basic, stats, and equipment)
 */
export class GetCharacterFullInfoTool extends EnhancedBaseTool {
  public readonly name = 'get_character_full_info';
  public readonly description =
    'Retrieve comprehensive character information including basic info, stats, and equipment in a single request';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9가-힣]+$',
      },
      date: {
        type: 'string',
        description:
          'Date for character info in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      includeEquipment: {
        type: 'boolean',
        description: 'Whether to include equipment information (defaults to true)',
        default: true,
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.CHARACTER,
    tags: ['character', 'comprehensive', 'full', 'complete', 'all'],
    examples: [
      {
        description: 'Get full character information',
        arguments: { characterName: '스카니아용사' },
      },
      {
        description: 'Get full info without equipment',
        arguments: { characterName: '스카니아용사', includeEquipment: false },
      },
      {
        description: 'Get full info for specific date',
        arguments: { characterName: '스카니아용사', date: '2024-01-15' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const characterName = this.getRequiredString(args, 'characterName');
    const date = this.getOptionalString(args, 'date');
    const includeEquipment = this.getOptionalBoolean(args, 'includeEquipment', true);

    try {
      const startTime = Date.now();

      // Get character OCID first
      context.logger.info('Looking up character OCID for full info', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get all character data in parallel
      context.logger.info('Fetching comprehensive character data', {
        characterName,
        ocid,
        includeEquipment,
      });

      const [basicInfo, stats, equipment] = await Promise.all([
        context.nexonClient.getCharacterBasic(ocid, date),
        context.nexonClient.getCharacterStat(ocid, date),
        includeEquipment ? context.nexonClient.getCharacterItemEquipment(ocid, date) : null,
      ]);

      const executionTime = Date.now() - startTime;

      const result = {
        characterName: basicInfo.character_name,
        basicInfo: {
          level: basicInfo.character_level,
          job: basicInfo.character_class,
          jobDetail: basicInfo.character_class_level,
          exp: basicInfo.character_exp,
          expRate: basicInfo.character_exp_rate,
          guildName: basicInfo.character_guild_name || null,
          world: basicInfo.world_name,
          gender: basicInfo.character_gender,
          date: basicInfo.date || date || 'latest',
        },
        stats: {
          basicStats:
            stats.final_stat
              ?.filter((s) => ['STR', 'DEX', 'INT', 'LUK', 'HP', 'MP'].includes(s.stat_name))
              .reduce(
                (acc, stat) => {
                  acc[stat.stat_name] = stat.stat_value;
                  return acc;
                },
                {} as Record<string, string>
              ) || {},
          combatStats:
            stats.final_stat
              ?.filter((s) =>
                [
                  '공격력',
                  '마력',
                  '크리티컬 확률',
                  '크리티컬 데미지',
                  '보스 몬스터 데미지',
                  '방어율 무시',
                  '데미지',
                ].includes(s.stat_name)
              )
              .reduce(
                (acc, stat) => {
                  acc[stat.stat_name] = stat.stat_value;
                  return acc;
                },
                {} as Record<string, string>
              ) || {},
          remainAp: stats.remain_ap,
        },
        ...(includeEquipment &&
          equipment && {
            equipment: {
              presetNo: equipment.preset_no,
              title: equipment.title,
              items:
                equipment.item_equipment?.reduce(
                  (acc, item) => {
                    acc[item.item_equipment_slot] = {
                      name: item.item_name,
                      icon: item.item_icon,
                      starforce: item.starforce,
                      potential: item.potential_option_grade,
                      potentialOptions: [
                        item.potential_option_1,
                        item.potential_option_2,
                        item.potential_option_3,
                      ].filter(Boolean),
                    };
                    return acc;
                  },
                  {} as Record<string, any>
                ) || {},
            },
          }),
        date: date || 'latest',
      };

      context.logger.info('Character full info retrieved successfully', {
        characterName,
        level: basicInfo.character_level,
        job: basicInfo.character_class,
        statsCount: stats.final_stat?.length || 0,
        equipmentCount: equipment?.item_equipment?.length || 0,
        executionTime,
      });

      return this.formatResult(result, {
        executionTime,
        cacheHit: false,
        apiCalls: includeEquipment ? 4 : 3, // OCID + basic + stats + equipment (optional)
      });
    } catch (error) {
      context.logger.error('Failed to get character full info', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get full information for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
