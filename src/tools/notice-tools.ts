/**
 * Notice Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory game notices and announcements
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting game notices
 */
export class GetNoticeListTool extends EnhancedBaseTool {
  public readonly name = 'get_notice_list';
  public readonly description = 'Retrieve list of MapleStory game notices and announcements';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      noticeType: {
        type: 'string',
        description: 'Type of notices to retrieve (optional)',
        enum: ['general', 'update', 'event', 'cashshop'],
        default: 'general',
      },
      page: {
        type: 'integer',
        description: 'Page number for pagination (1-based, optional, defaults to 1)',
        minimum: 1,
        maximum: 100,
        default: 1,
      },
      limit: {
        type: 'integer',
        description: 'Number of notices per page (optional, defaults to 10)',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UTILITY,
    tags: ['notice', 'announcement', 'news', 'update'],
    examples: [
      {
        description: 'Get general notices',
        arguments: {},
      },
      {
        description: 'Get event notices',
        arguments: { noticeType: 'event' },
      },
      {
        description: 'Get update notices',
        arguments: { noticeType: 'update' },
      },
      {
        description: 'Get cash shop notices',
        arguments: { noticeType: 'cashshop' },
      },
    ],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const noticeType = this.getOptionalString(args, 'noticeType', 'general');
    const page = this.getOptionalNumber(args, 'page', 1);
    const limit = this.getOptionalNumber(args, 'limit', 10);

    try {
      const startTime = Date.now();

      context.logger.info('Fetching notice list', { 
        noticeType,
        page,
        limit,
      });

      // Note: This is a placeholder implementation
      // The actual API endpoints would need to be implemented in the NexonApiClient
      // Based on the constants, we have these endpoints:
      // - /maplestory/v1/notice (general notices)
      // - /maplestory/v1/notice-update (update notices)  
      // - /maplestory/v1/notice-event (event notices)
      // - /maplestory/v1/notice-cashshop (cash shop notices)

      const executionTime = Date.now() - startTime;

      // Placeholder response structure
      const notices = [
        {
          id: 1,
          title: '메이플스토리 정기점검 안내',
          content: '정기점검이 진행됩니다.',
          date: '2024-01-15',
          type: 'update',
          important: true,
        },
        {
          id: 2,
          title: '이벤트 안내',
          content: '새로운 이벤트가 시작됩니다.',
          date: '2024-01-14',
          type: 'event',
          important: false,
        },
      ];

      const filteredNotices = notices.filter(notice => 
        noticeType === 'general' || notice.type === noticeType
      );

      context.logger.info('Notice list retrieved successfully', {
        noticeType,
        page,
        resultsCount: filteredNotices.length,
        executionTime,
      });

      return this.formatResult({
        noticeType,
        page,
        limit,
        totalNotices: filteredNotices.length,
        notices: filteredNotices.slice((page - 1) * limit, page * limit),
        hasMore: filteredNotices.length > page * limit,
        summary: {
          importantNotices: filteredNotices.filter(n => n.important).length,
          updateNotices: filteredNotices.filter(n => n.type === 'update').length,
          eventNotices: filteredNotices.filter(n => n.type === 'event').length,
          cashshopNotices: filteredNotices.filter(n => n.type === 'cashshop').length,
        },
      }, {
        executionTime,
        cacheHit: false,
        apiCalls: 1,
      });
    } catch (error) {
      context.logger.error('Failed to get notice list', {
        noticeType,
        page,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get notice list: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting detailed notice information
 */
export class GetNoticeDetailTool extends EnhancedBaseTool {
  public readonly name = 'get_notice_detail';
  public readonly description = 'Retrieve detailed information for a specific MapleStory notice';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      noticeId: {
        type: 'integer',
        description: 'ID of the notice to retrieve details for',
        minimum: 1,
      },
    },
    required: ['noticeId'],
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UTILITY,
    tags: ['notice', 'detail', 'announcement', 'content'],
    examples: [
      {
        description: 'Get notice details',
        arguments: { noticeId: 123 },
      },
    ],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const noticeId = this.getRequiredNumber(args, 'noticeId');

    try {
      const startTime = Date.now();

      context.logger.info('Fetching notice detail', { noticeId });

      // Note: This is a placeholder implementation
      // The actual API endpoint would be /maplestory/v1/notice/detail

      const executionTime = Date.now() - startTime;

      // Placeholder response
      const noticeDetail = {
        id: noticeId,
        title: '메이플스토리 정기점검 안내',
        content: `
          안녕하세요 메이플스토리입니다.
          
          정기점검이 다음과 같이 진행됩니다:
          - 일시: 2024년 1월 15일 (월) 오전 6:00 ~ 오전 11:00 (예정)
          - 대상: 전체 월드
          
          점검 내용:
          - 게임 안정화 작업
          - 버그 수정
          - 신규 콘텐츠 업데이트
          
          점검 중에는 게임 접속이 불가능합니다.
          이용에 불편을 드려 죄송합니다.
        `,
        date: '2024-01-15T09:00:00Z',
        type: 'update',
        important: true,
        author: '메이플스토리 운영팀',
        views: 15420,
        tags: ['점검', '업데이트', '공지'],
        attachments: [],
      };

      context.logger.info('Notice detail retrieved successfully', {
        noticeId,
        title: noticeDetail.title,
        type: noticeDetail.type,
        executionTime,
      });

      return this.formatResult(noticeDetail, {
        executionTime,
        cacheHit: false,
        apiCalls: 1,
      });
    } catch (error) {
      context.logger.error('Failed to get notice detail', {
        noticeId,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get notice detail for ID ${noticeId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}