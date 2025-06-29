/**
 * Union Information Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory SEA union data and rankings
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';
import { formatSEADate, formatSEANumber, getCurrentSEADate } from '../utils/server-utils';

/**
 * Tool for getting union information
 */
export class GetUnionInfoTool extends EnhancedBaseTool {
  public readonly name = 'get_union_info';
  public readonly description =
    'Retrieve union information for a MapleStory SEA character including level, grade, and artifact details';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up union info for',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9]+$',
      },
      date: {
        type: 'string',
        description: 'Date for union info in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UNION,
    tags: ['union', 'level', 'grade', 'artifact'],
    examples: [
      {
        description: 'Get union info for character',
        arguments: { characterName: 'AquilaHero' },
      },
      {
        description: 'Get union info for specific date',
        arguments: { characterName: 'AquilaHero', date: '2024-01-15' },
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
      context.logger.info('Looking up character OCID for union info', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get union info
      context.logger.info('Fetching union information', { characterName, ocid });
      const unionInfo = await context.nexonClient.getUnionInfo(ocid, date);

      const executionTime = Date.now() - startTime;

      context.logger.info('Union info retrieved successfully', {
        characterName,
        unionLevel: unionInfo.union_level,
        unionGrade: unionInfo.union_grade,
        artifactLevel: unionInfo.union_artifact_level,
        executionTime,
      });

      return this.formatResult(
        {
          characterName,
          date: unionInfo.date
            ? formatSEADate(unionInfo.date)
            : date
              ? formatSEADate(date)
              : getCurrentSEADate(),
          unionLevel: formatSEANumber(unionInfo.union_level),
          unionGrade: unionInfo.union_grade,
          unionArtifact: {
            level: formatSEANumber(unionInfo.union_artifact_level),
            exp: formatSEANumber(unionInfo.union_artifact_exp),
            point: formatSEANumber(unionInfo.union_artifact_point),
          },
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // OCID lookup + union info
        }
      );
    } catch (error) {
      context.logger.error('Failed to get union info', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get union info for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting union raider information
 */
export class GetUnionRaiderTool extends EnhancedBaseTool {
  public readonly name = 'get_union_raider';
  public readonly description =
    'Retrieve union raider board information including block placement and stats';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: {
        type: 'string',
        description: 'The name of the character to look up union raider for',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9]+$',
      },
      date: {
        type: 'string',
        description: 'Date for union raider in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['characterName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UNION,
    tags: ['union', 'raider', 'blocks', 'stats', 'board'],
    examples: [
      {
        description: 'Get union raider info for character',
        arguments: { characterName: 'AquilaHero' },
      },
      {
        description: 'Get union raider for specific date',
        arguments: { characterName: 'AquilaHero', date: '2024-01-15' },
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
      context.logger.info('Looking up character OCID for union raider', { characterName });
      const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
      const ocid = ocidResult.ocid;

      // Get union raider info
      context.logger.info('Fetching union raider information', { characterName, ocid });
      const raiderInfo = await context.nexonClient.getUnionRaider(ocid, date);

      const executionTime = Date.now() - startTime;

      // Process union blocks for better presentation
      const blocksByClass =
        raiderInfo.union_block?.reduce(
          (acc, block) => {
            if (!acc[block.block_class]) {
              acc[block.block_class] = [];
            }
            acc[block.block_class]!.push({
              type: block.block_type,
              level: block.block_level,
              controlPoint: block.block_control_point,
              positions: block.block_position,
            });
            return acc;
          },
          {} as Record<string, Array<any>>
        ) || {};

      context.logger.info('Union raider info retrieved successfully', {
        characterName,
        blockCount: raiderInfo.union_block?.length || 0,
        innerStatCount: raiderInfo.union_inner_stat?.length || 0,
        executionTime,
      });

      return this.formatResult(
        {
          characterName,
          date: raiderInfo.date || date || 'latest',
          presetNo: raiderInfo.use_preset_no,
          raiderStats: raiderInfo.union_raider_stat || [],
          occupiedStats: raiderInfo.union_occupied_stat || [],
          innerStats:
            raiderInfo.union_inner_stat?.map((stat) => ({
              fieldId: stat.stat_field_id,
              effect: stat.stat_field_effect,
            })) || [],
          blocks: {
            total: raiderInfo.union_block?.length || 0,
            byClass: blocksByClass,
            details: raiderInfo.union_block || [],
          },
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // OCID lookup + raider info
        }
      );
    } catch (error) {
      context.logger.error('Failed to get union raider info', {
        characterName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get union raider info for character "${characterName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting union ranking
 */
export class GetUnionRankingTool extends EnhancedBaseTool {
  public readonly name = 'get_union_ranking';
  public readonly description =
    'Retrieve union power rankings for a specific world or overall rankings';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      worldName: {
        type: 'string',
        description: 'World name to get rankings for (optional, gets all worlds if not specified)',
        enum: ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'],
      },
      characterName: {
        type: 'string',
        description: 'Specific character name to search for in rankings (optional)',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9]+$',
      },
      page: {
        type: 'integer',
        description: 'Page number for pagination (1-based, optional, defaults to 1)',
        minimum: 1,
        maximum: 200,
        default: 1,
      },
      date: {
        type: 'string',
        description: 'Date for rankings in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UNION,
    tags: ['union', 'ranking', 'power', 'leaderboard'],
    examples: [
      {
        description: 'Get union rankings for all worlds',
        arguments: {},
      },
      {
        description: 'Get union rankings for specific world',
        arguments: { worldName: 'Aquila' },
      },
      {
        description: 'Get union rankings for specific character',
        arguments: { characterName: 'AquilaHero' },
      },
      {
        description: 'Get page 2 of union rankings',
        arguments: { worldName: 'Aquila', page: 2 },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const worldName = this.getOptionalString(args, 'worldName');
    const characterName = this.getOptionalString(args, 'characterName');
    const page = this.getOptionalNumber(args, 'page', 1);
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      let ocid: string | undefined;

      // If character name is provided, get OCID for search
      if (characterName) {
        context.logger.info('Looking up character OCID for union ranking search', {
          characterName,
        });
        const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
        ocid = ocidResult.ocid;
      }

      // Get union rankings
      context.logger.info('Fetching union rankings', {
        worldName: worldName || undefined,
        characterName: characterName || undefined,
        ocid: ocid ? `${ocid.substring(0, 8)}...` : undefined,
        page,
      } as any);

      const rankings = await context.nexonClient.getUnionRanking(worldName, ocid, page, date);

      const executionTime = Date.now() - startTime;

      const rankingData =
        rankings.ranking?.map((entry) => ({
          rank: entry.ranking,
          characterName: entry.character_name,
          world: entry.world_name,
          class: entry.class_name,
          subClass: entry.sub_class_name,
          unionLevel: entry.union_level,
          unionPower: entry.union_power,
          date: entry.date,
        })) || [];

      context.logger.info('Union rankings retrieved successfully', {
        worldName: worldName || undefined,
        characterName: characterName || undefined,
        page,
        resultsCount: rankingData.length,
        executionTime,
      } as any);

      return this.formatResult(
        {
          page,
          pageSize: rankingData.length,
          worldName: worldName || 'all',
          searchCharacter: characterName || undefined,
          date: date || 'latest',
          rankings: rankingData,
          summary: {
            totalResults: rankingData.length,
            topUnionLevel:
              rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.unionLevel)) : 0,
            topUnionPower:
              rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.unionPower)) : 0,
            worldDistribution: rankingData.reduce(
              (acc, entry) => {
                acc[entry.world] = (acc[entry.world] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>
            ),
          },
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: characterName ? 2 : 1, // OCID lookup (if needed) + rankings
        }
      );
    } catch (error) {
      context.logger.error('Failed to get union rankings', {
        worldName: worldName || undefined,
        characterName: characterName || undefined,
        page,
        error: error instanceof Error ? error.message : String(error),
      } as any);

      return this.formatError(
        `Failed to get union rankings: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
