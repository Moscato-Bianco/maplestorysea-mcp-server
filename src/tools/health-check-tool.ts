/**
 * Health Check Tool for MCP Maple
 * Provides comprehensive system health and status information
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolCategory, ToolMetadata, ToolResult } from './base-tool';
import { createDefaultHealthManager } from '../utils/health-check';
import {
  formatSEADate,
  formatSEATime,
  getCurrentSEADate,
  getCurrentSEATime,
  getNextDailyReset,
  getNextWeeklyReset,
  getTimeUntilDailyReset,
  isMaintenanceTime,
  isDuringDataUpdate,
  getNextDataUpdate,
  SEA_SCHEDULES,
} from '../utils/server-utils';

export class HealthCheckTool extends EnhancedBaseTool {
  public readonly name = 'health_check';
  public readonly description =
    'Check the comprehensive health status of the MapleStory SEA MCP server and all its components';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      detailed: {
        type: 'boolean',
        description: 'Include detailed health information for all components (default: true)',
        default: true,
      },
      component: {
        type: 'string',
        description: 'Check specific component only (nexon-api, cache, memory, process)',
        enum: ['nexon-api', 'cache', 'memory', 'process'],
      },
      timeout: {
        type: 'number',
        description: 'Timeout for health checks in milliseconds (default: 5000)',
        minimum: 1000,
        maximum: 30000,
        default: 5000,
      },
    },
    additionalProperties: false,
  };

  public readonly metadata: ToolMetadata = {
    category: ToolCategory.SYSTEM,
    tags: ['health', 'monitoring', 'status', 'diagnostics', 'system'],
    examples: [
      {
        description: 'Comprehensive health check',
        arguments: {},
      },
      {
        description: 'Quick health status without details',
        arguments: { detailed: false },
      },
      {
        description: 'Check specific component',
        arguments: { component: 'nexon-api' },
      },
      {
        description: 'Health check with custom timeout',
        arguments: { timeout: 10000 },
      },
    ],
  };

  protected async executeImpl(
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const detailed = this.getOptionalBoolean(args, 'detailed', true);
    const component = this.getOptionalString(args, 'component');
    const timeout = this.getOptionalNumber(args, 'timeout', 5000);

    try {
      const startTime = Date.now();

      // Create health manager with current API client
      const healthManager = createDefaultHealthManager(context.nexonClient);

      if (!detailed && !component) {
        // Quick status check
        const quickStatus = await healthManager.getQuickStatus();
        const executionTime = Date.now() - startTime;

        context.logger.info('Quick health check completed', {
          status: quickStatus.status,
          executionTime,
        });

        return this.formatResult(
          {
            status: quickStatus.status,
            uptime: quickStatus.uptime,
            timestamp: quickStatus.timestamp,
            mode: 'quick',
          },
          {
            executionTime,
            cacheHit: false,
            apiCalls: 0,
          }
        );
      }

      // Full health check
      const healthStatus = await healthManager.runHealthChecks({ timeout });
      const executionTime = Date.now() - startTime;

      // Add SEA-specific schedule information
      const timeUntilReset = getTimeUntilDailyReset();
      const nextDataUpdate = getNextDataUpdate();

      const seaScheduleInfo = {
        currentTime: {
          date: getCurrentSEADate(),
          time: getCurrentSEATime(),
          timezone: 'SGT (UTC+8)',
        },
        gameSchedules: {
          dailyReset: {
            next: formatSEADate(getNextDailyReset(), true),
            timeRemaining: `${timeUntilReset.hours}h ${timeUntilReset.minutes}m ${timeUntilReset.seconds}s`,
          },
          weeklyReset: {
            next: formatSEADate(getNextWeeklyReset(), true),
            day: 'Wednesday 00:00 SGT',
          },
          dataUpdate: {
            next: formatSEADate(nextDataUpdate, true),
            schedule: 'Daily at 08:00 SGT',
            inProgress: isDuringDataUpdate(),
          },
        },
        maintenanceInfo: {
          likelyMaintenance: isMaintenanceTime(),
          weeklyWindow: 'Wednesday 08:00-12:00 SGT',
          emergencyWindow: 'Daily 01:00-06:00 SGT',
          patchWindow: 'Tuesday 23:00 - Wednesday 03:00 SGT',
        },
      };

      let result = {
        ...healthStatus,
        seaSchedules: seaScheduleInfo,
      };

      // Filter for specific component if requested
      if (component && healthStatus.details[component]) {
        result = {
          ...healthStatus,
          seaSchedules: seaScheduleInfo,
          details: {
            [component]: healthStatus.details[component],
          },
        };
      }

      context.logger.info('Health check completed', {
        overallStatus: healthStatus.status,
        componentsChecked: Object.keys(healthStatus.details).length,
        executionTime,
        component: component || 'all',
      });

      return this.formatResult(
        {
          ...result,
          mode: component ? 'component' : 'full',
        },
        {
          executionTime,
          cacheHit: false,
          apiCalls: component === 'nexon-api' || !component ? 1 : 0,
        }
      );
    } catch (error) {
      context.logger.error('Health check failed', {
        component,
        detailed,
        timeout,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  protected validateImpl(args: Record<string, any>): boolean {
    // Validate detailed if provided
    if ('detailed' in args && typeof args.detailed !== 'boolean') {
      return false;
    }

    // Validate component if provided
    if ('component' in args) {
      const validComponents = ['nexon-api', 'cache', 'memory', 'process'];
      if (!validComponents.includes(args.component)) {
        return false;
      }
    }

    // Validate timeout if provided
    if ('timeout' in args) {
      const timeout = args.timeout;
      if (typeof timeout !== 'number' || timeout < 1000 || timeout > 30000) {
        return false;
      }
    }

    return true;
  }
}
