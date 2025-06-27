/**
 * Guild Information Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory guild information
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting guild basic information
 */
export class GetGuildInfoTool extends EnhancedBaseTool {
  public readonly name = 'get_guild_info';
  public readonly description =
    'Retrieve basic information about a MapleStory guild including level, members, and skills';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      guildName: {
        type: 'string',
        description: 'The name of the guild to look up',
        minLength: 1,
        maxLength: 12,
      },
      worldName: {
        type: 'string',
        description: 'The world/server name where the guild exists',
        enum: [
          '스카니아',
          '베라',
          '루나',
          '제니스',
          '크로아',
          '유니온',
          '엘리시움',
          '이노시스',
          '레드',
          '오로라',
          '아케인',
          '노바',
          '리부트',
          '리부트2',
        ],
      },
      date: {
        type: 'string',
        description: 'Date for guild info in YYYY-MM-DD format (optional, defaults to yesterday)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    required: ['guildName', 'worldName'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.GUILD,
    tags: ['guild', 'info', 'members', 'skills', 'level'],
    examples: [
      {
        description: 'Get guild info',
        arguments: { guildName: '길드명', worldName: '스카니아' },
      },
      {
        description: 'Get guild info for specific date',
        arguments: { guildName: '길드명', worldName: '스카니아', date: '2024-01-15' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const guildName = this.getRequiredString(args, 'guildName');
    const worldName = this.getRequiredString(args, 'worldName');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      // Get guild ID first
      context.logger.info('Looking up guild ID', { guildName, worldName });
      const guildIdResult = await context.nexonClient.getGuildId(guildName, worldName);
      const oguildId = guildIdResult.oguild_id;

      // Get guild basic info
      context.logger.info('Fetching guild basic info', { guildName, worldName, oguildId });
      const guildInfo = await context.nexonClient.getGuildBasic(oguildId, date);

      const executionTime = Date.now() - startTime;

      // Process guild skills for better presentation
      const regularSkills =
        guildInfo.guild_skill?.map((skill) => ({
          name: skill.skill_name,
          description: skill.skill_description,
          level: skill.skill_level,
          effect: skill.skill_effect,
          icon: skill.skill_icon,
        })) || [];

      const noblesseSkills =
        guildInfo.guild_noblesse_skill?.map((skill) => ({
          name: skill.skill_name,
          description: skill.skill_description,
          level: skill.skill_level,
          effect: skill.skill_effect,
          icon: skill.skill_icon,
        })) || [];

      context.logger.info('Guild info retrieved successfully', {
        guildName: guildInfo.guild_name,
        worldName: guildInfo.world_name,
        level: guildInfo.guild_level,
        memberCount: guildInfo.guild_member_count,
        executionTime,
      });

      return this.formatResult(
        {
          guildName: guildInfo.guild_name,
          worldName: guildInfo.world_name,
          level: guildInfo.guild_level,
          fame: guildInfo.guild_fame,
          point: guildInfo.guild_point,
          masterName: guildInfo.guild_master_name,
          memberCount: guildInfo.guild_member_count,
          members: guildInfo.guild_member || [],
          skills: {
            regular: regularSkills,
            noblesse: noblesseSkills,
            totalSkills: regularSkills.length + noblesseSkills.length,
          },
          date: guildInfo.date || date || 'latest',
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 2, // Guild ID lookup + basic info
        }
      );
    } catch (error) {
      context.logger.error('Failed to get guild info', {
        guildName,
        worldName,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get info for guild "${guildName}" in world "${worldName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting guild ranking
 */
export class GetGuildRankingTool extends EnhancedBaseTool {
  public readonly name = 'get_guild_ranking';
  public readonly description = 'Retrieve guild rankings for a specific world or overall rankings';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      worldName: {
        type: 'string',
        description:
          'World name to get guild rankings for (optional, gets all worlds if not specified)',
        enum: [
          '스카니아',
          '베라',
          '루나',
          '제니스',
          '크로아',
          '유니온',
          '엘리시움',
          '이노시스',
          '레드',
          '오로라',
          '아케인',
          '노바',
          '리부트',
          '리부트2',
        ],
      },
      guildName: {
        type: 'string',
        description: 'Specific guild name to search for in rankings (optional)',
        minLength: 1,
        maxLength: 12,
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
    category: ToolCategory.GUILD,
    tags: ['guild', 'ranking', 'leaderboard', 'level'],
    examples: [
      {
        description: 'Get guild rankings for all worlds',
        arguments: {},
      },
      {
        description: 'Get guild rankings for specific world',
        arguments: { worldName: '스카니아' },
      },
      {
        description: 'Get guild rankings for specific guild',
        arguments: { guildName: '길드명' },
      },
      {
        description: 'Get page 2 of guild rankings',
        arguments: { worldName: '스카니아', page: 2 },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const worldName = this.getOptionalString(args, 'worldName');
    const guildName = this.getOptionalString(args, 'guildName');
    const page = this.getOptionalNumber(args, 'page', 1);
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      // Note: Guild ranking API uses guild name directly, not oguild_id

      // Get guild rankings
      context.logger.info('Fetching guild rankings', {
        worldName: worldName || undefined,
        guildName: guildName || undefined,
        page,
      } as any);

      const rankings = await context.nexonClient.getGuildRanking(
        worldName || '전체',
        0, // ranking_type: 0 for level ranking
        guildName,
        page || 1,
        date
      );

      const executionTime = Date.now() - startTime;

      const rankingData =
        rankings.ranking?.map((entry) => ({
          rank: entry.ranking,
          guildName: entry.guild_name,
          world: entry.world_name,
          level: entry.guild_level,
          masterName: entry.guild_master_name,
          guildMark: entry.guild_mark,
          guildPoint: entry.guild_point,
          date: entry.date,
        })) || [];

      context.logger.info('Guild rankings retrieved successfully', {
        worldName: worldName || undefined,
        guildName: guildName || undefined,
        page,
        resultsCount: rankingData.length,
        executionTime,
      } as any);

      return this.formatResult(
        {
          page,
          pageSize: rankingData.length,
          worldName: worldName || 'all',
          searchGuild: guildName || undefined,
          date: date || 'latest',
          rankings: rankingData,
          summary: {
            totalResults: rankingData.length,
            topLevel: rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.level)) : 0,
            averageLevel:
              rankingData.length > 0
                ? Math.round(rankingData.reduce((sum, r) => sum + r.level, 0) / rankingData.length)
                : 0,
            topGuildPoint:
              rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.guildPoint)) : 0,
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
          apiCalls: 1, // Guild rankings only
        }
      );
    } catch (error) {
      context.logger.error('Failed to get guild rankings', {
        worldName: worldName || undefined,
        guildName: guildName || undefined,
        page,
        error: error instanceof Error ? error.message : String(error),
      } as any);

      return this.formatError(
        `Failed to get guild rankings: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
