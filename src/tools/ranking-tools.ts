/**
 * Ranking Tools for MCP Maple
 * Provides MCP tools for retrieving various MapleStory SEA rankings
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';
import { JOB_CLASSES } from '../api/constants';
import { formatSEADate, formatSEANumber, getCurrentSEADate } from '../utils/server-utils';

/**
 * Tool for getting overall level rankings
 */
export class GetOverallRankingTool extends EnhancedBaseTool {
  public readonly name = 'get_overall_ranking';
  public readonly description =
    'Retrieve overall level rankings for MapleStory SEA characters with filtering options';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      worldName: {
        type: 'string',
        description: 'World name to get rankings for (optional)',
        enum: ['Aquila', 'Bootes', 'Cassiopeia', 'Draco'],
      },
      className: {
        type: 'string',
        description: 'Character class filter (optional)',
        enum: [...JOB_CLASSES],
      },
      characterName: {
        type: 'string',
        description: 'Specific character name to search for (optional)',
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
    category: ToolCategory.RANKING,
    tags: ['ranking', 'overall', 'level', 'leaderboard'],
    examples: [
      {
        description: 'Get overall rankings for all worlds',
        arguments: {},
      },
      {
        description: 'Get rankings for specific world',
        arguments: { worldName: 'Aquila' },
      },
      {
        description: 'Get rankings for specific class',
        arguments: { className: 'Arch Mage (Ice, Lightning)' },
      },
      {
        description: 'Get rankings with pagination',
        arguments: { page: 2 },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const worldName = this.getOptionalString(args, 'worldName');
    const className = this.getOptionalString(args, 'className');
    const characterName = this.getOptionalString(args, 'characterName');
    const page = this.getOptionalNumber(args, 'page', 1);
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      let ocid: string | undefined;

      // If character name is provided, get OCID for search
      if (characterName) {
        context.logger.info('Looking up character OCID for ranking search', { characterName });
        const ocidResult = await context.nexonClient.getCharacterOcid(characterName);
        ocid = ocidResult.ocid;
      }

      // Get overall rankings
      context.logger.info('Fetching overall rankings', {
        worldName: worldName || undefined,
        className: className || undefined,
        characterName: characterName || undefined,
        page,
      } as any);

      const rankings = await context.nexonClient.getOverallRanking(
        worldName,
        undefined,
        className,
        ocid,
        page,
        date
      );

      const executionTime = Date.now() - startTime;

      const rankingData =
        rankings.ranking?.map((entry) => ({
          rank: formatSEANumber(entry.ranking),
          characterName: entry.character_name,
          world: entry.world_name,
          class: entry.class_name,
          subClass: entry.sub_class_name,
          level: formatSEANumber(entry.character_level),
          exp: formatSEANumber(entry.character_exp),
          popularity: formatSEANumber(entry.character_popularity),
          guildName: entry.character_guildname,
          date: entry.date ? formatSEADate(entry.date) : getCurrentSEADate(),
        })) || [];

      context.logger.info('Overall rankings retrieved successfully', {
        worldName: worldName || undefined,
        className: className || undefined,
        characterName: characterName || undefined,
        page,
        resultsCount: rankingData.length,
        executionTime,
      } as any);

      return this.formatResult(
        {
          page,
          pageSize: rankingData.length,
          filters: {
            worldName: worldName || 'all',
            className: className || 'all',
            searchCharacter: characterName || undefined,
          },
          date: date ? formatSEADate(date) : getCurrentSEADate(),
          rankings: rankingData,
          summary: {
            totalResults: formatSEANumber(rankingData.length),
            topLevel:
              rankingData.length > 0
                ? formatSEANumber(
                    Math.max(...rankingData.map((r) => parseInt(r.level.replace(/,/g, ''))))
                  )
                : '0',
            averageLevel:
              rankingData.length > 0
                ? formatSEANumber(
                    Math.round(
                      rankingData.reduce((sum, r) => sum + parseInt(r.level.replace(/,/g, '')), 0) /
                        rankingData.length
                    )
                  )
                : '0',
            worldDistribution: rankingData.reduce(
              (acc, entry) => {
                acc[entry.world] = (acc[entry.world] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>
            ),
            classDistribution: rankingData.reduce(
              (acc, entry) => {
                acc[entry.class] = (acc[entry.class] || 0) + 1;
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
      context.logger.error('Failed to get overall rankings', {
        worldName: worldName || undefined,
        className: className || undefined,
        characterName: characterName || undefined,
        page,
        error: error instanceof Error ? error.message : String(error),
      } as any);

      return this.formatError(
        `Failed to get overall rankings: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
