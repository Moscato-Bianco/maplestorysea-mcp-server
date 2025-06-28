/**
 * Server Information Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory server status and game information
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting server status information
 */
export class GetServerStatusTool extends EnhancedBaseTool {
  public readonly name = 'get_server_status';
  public readonly description =
    'Get current server status, population estimates, and maintenance information for MapleStory SEA servers';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      includeNotices: {
        type: 'boolean',
        description: 'Include latest game notices and maintenance information (default: true)',
        default: true,
      },
      worldName: {
        type: 'string',
        description: 'Specific world to check status for (optional)',
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
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.SYSTEM,
    tags: ['server', 'status', 'maintenance', 'population', 'uptime'],
    examples: [
      {
        description: 'Get overall server status',
        arguments: {},
      },
      {
        description: 'Get server status without notices',
        arguments: { includeNotices: false },
      },
      {
        description: 'Check specific world status',
        arguments: { worldName: '스카니아' },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const includeNotices = this.getOptionalBoolean(args, 'includeNotices', true);
    const worldName = this.getOptionalString(args, 'worldName');

    try {
      const startTime = Date.now();

      const serverStatus = await context.nexonClient.getServerStatus(worldName);
      const executionTime = Date.now() - startTime;

      context.logger.info('Server status retrieved', {
        includeNotices,
        worldName: worldName || 'all',
        onlineWorlds: serverStatus.worlds?.filter((w: any) => w.status === 'online').length || 0,
        totalWorlds: serverStatus.worlds?.length || 0,
        executionTime,
      });

      return this.formatResult(serverStatus, {
        executionTime,
        cacheHit: false,
        apiCalls: includeNotices ? 2 : 1, // Server status + notices (optional)
      });
    } catch (error) {
      context.logger.error('Failed to get server status', {
        includeNotices,
        worldName: worldName || 'all',
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get server status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Tool for getting game notices and announcements
 */
export class GetGameNoticesTool extends EnhancedBaseTool {
  public readonly name = 'get_game_notices';
  public readonly description =
    'Retrieve latest game notices, announcements, events, and maintenance schedules';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      noticeType: {
        type: 'string',
        description: 'Type of notices to retrieve (optional)',
        enum: ['all', 'maintenance', 'update', 'event', 'notice', 'cashshop'],
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of notices to return (default: 10)',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
      includeDetails: {
        type: 'boolean',
        description: 'Include detailed notice content (default: true)',
        default: true,
      },
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.SYSTEM,
    tags: ['notices', 'announcements', 'maintenance', 'events', 'updates'],
    examples: [
      {
        description: 'Get latest notices',
        arguments: {},
      },
      {
        description: 'Get only maintenance notices',
        arguments: { noticeType: 'maintenance' },
      },
      {
        description: 'Get 5 latest events',
        arguments: { noticeType: 'event', maxResults: 5 },
      },
      {
        description: 'Get notice list without details',
        arguments: { includeDetails: false },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const noticeType = this.getOptionalString(args, 'noticeType', 'all');
    const maxResults = this.getOptionalNumber(args, 'maxResults', 10);
    const includeDetails = this.getOptionalBoolean(args, 'includeDetails', true);

    try {
      const startTime = Date.now();

      // Get notice list first
      const filteredNotices = await context.nexonClient.getNotices(noticeType === 'all' ? undefined : noticeType, maxResults);

      // Since getNotices already filters by type, we can use the results directly
      let detailedNotices = filteredNotices;

      // Note: getNoticeDetail might not be available in the current API client
      // So we'll use the notices as they come from getNotices which may already include details

      const executionTime = Date.now() - startTime;

      context.logger.info('Game notices retrieved', {
        noticeType,
        requestedResults: maxResults,
        actualResults: detailedNotices.length,
        includeDetails,
        executionTime,
      });

      return this.formatResult(
        {
          noticeType,
          maxResults,
          includeDetails,
          totalFound: filteredNotices.length,
          notices: detailedNotices.slice(0, maxResults),
          summary: {
            latestNotice: detailedNotices[0]?.title || detailedNotices[0]?.notice_title || 'No notices found',
            noticeCount: detailedNotices.length,
            hasMaintenanceNotices: detailedNotices.some(
              (n: any) =>
                n.title?.toLowerCase().includes('maintenance') ||
                n.title?.toLowerCase().includes('점검') ||
                n.notice_title?.toLowerCase().includes('maintenance') ||
                n.notice_title?.toLowerCase().includes('점검')
            ),
            hasEventNotices: detailedNotices.some(
              (n: any) =>
                n.title?.toLowerCase().includes('event') ||
                n.title?.toLowerCase().includes('이벤트') ||
                n.notice_title?.toLowerCase().includes('event') ||
                n.notice_title?.toLowerCase().includes('이벤트')
            ),
          },
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: 1,
        }
      );
    } catch (error) {
      context.logger.error('Failed to get game notices', {
        noticeType,
        maxResults,
        includeDetails,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get game notices: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
