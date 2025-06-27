/**
 * Ranking Tools for MCP Maple
 * Provides MCP tools for retrieving various MapleStory rankings
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting overall level rankings
 */
export class GetOverallRankingTool extends EnhancedBaseTool {
  public readonly name = 'get_overall_ranking';
  public readonly description =
    'Retrieve overall level rankings for MapleStory characters with filtering options';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      worldName: {
        type: 'string',
        description: 'World name to get rankings for (optional)',
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
      worldType: {
        type: 'string',
        description: 'World type filter (optional)',
        enum: ['일반', '리부트'],
      },
      className: {
        type: 'string',
        description: 'Character class filter (optional)',
        enum: [
          '히어로',
          '팔라딘',
          '다크나이트',
          '아크메이지(불,독)',
          '아크메이지(썬,콜)',
          '비숍',
          '보우마스터',
          '신궁',
          '패스파인더',
          '나이트로드',
          '섀도어',
          '듀얼블레이드',
          '바이퍼',
          '캐논슈터',
          '스트라이커',
          '은월',
          '아란',
          '에반',
          '루미너스',
          '메르세데스',
          '팬텀',
          '레인',
          '미하일',
          '카이저',
          '엔젤릭버스터',
          '제로',
          '키네시스',
          '일리움',
          '아크',
          '카데나',
          '칼리',
          '아델',
          '카인',
          '라라',
          '호영',
        ],
      },
      characterName: {
        type: 'string',
        description: 'Specific character name to search for (optional)',
        minLength: 1,
        maxLength: 12,
        pattern: '^[a-zA-Z0-9가-힣]+$',
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
        arguments: { worldName: '스카니아' },
      },
      {
        description: 'Get rankings for specific class',
        arguments: { className: '아크메이지(썬,콜)' },
      },
      {
        description: 'Get rankings for reboot worlds only',
        arguments: { worldType: '리부트' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const worldName = this.getOptionalString(args, 'worldName');
    const worldType = this.getOptionalString(args, 'worldType');
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
        worldType: worldType || undefined,
        className: className || undefined,
        characterName: characterName || undefined,
        page,
      } as any);

      const rankings = await context.nexonClient.getOverallRanking(
        worldName,
        worldType,
        className,
        ocid,
        page,
        date
      );

      const executionTime = Date.now() - startTime;

      const rankingData =
        rankings.ranking?.map((entry) => ({
          rank: entry.ranking,
          characterName: entry.character_name,
          world: entry.world_name,
          class: entry.class_name,
          subClass: entry.sub_class_name,
          level: entry.character_level,
          exp: entry.character_exp,
          popularity: entry.character_popularity,
          guildName: entry.character_guildname,
          date: entry.date,
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
            worldType: worldType || 'all',
            className: className || 'all',
            searchCharacter: characterName || undefined,
          },
          date: date || 'latest',
          rankings: rankingData,
          summary: {
            totalResults: rankingData.length,
            topLevel: rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.level)) : 0,
            averageLevel:
              rankingData.length > 0
                ? Math.round(rankingData.reduce((sum, r) => sum + r.level, 0) / rankingData.length)
                : 0,
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
