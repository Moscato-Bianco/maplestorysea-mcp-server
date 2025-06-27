/**
 * Health Check Tool for MCP Maple
 * Provides system health and status information
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolCategory, ToolMetadata } from './base-tool';

export class HealthCheckTool extends EnhancedBaseTool {
  public readonly name = 'health_check';
  public readonly description =
    'Check the health status of the MCP server and NEXON API connection';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      includeDetails: {
        type: 'boolean',
        description: 'Whether to include detailed system information',
        default: false,
      },
    },
    additionalProperties: false,
  };

  public readonly metadata: ToolMetadata = {
    category: ToolCategory.UTILITY,
    tags: ['health', 'status', 'system', 'api'],
    examples: [
      {
        description: 'Basic health check',
        arguments: {},
      },
      {
        description: 'Detailed health check with system information',
        arguments: {
          includeDetails: true,
        },
      },
    ],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<any> {
    const includeDetails = this.getOptionalBoolean(args, 'includeDetails', false);
    const startTime = Date.now();

    try {
      // Check NEXON API health
      const nexonHealthCheck = await context.nexonClient.healthCheck();

      const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: {
          name: 'mcp-maple',
          version: '1.0.0',
          uptime: `${process.uptime().toFixed(2)}s`,
        },
        nexonApi: {
          status: nexonHealthCheck.status,
          timestamp: nexonHealthCheck.timestamp,
        },
        responseTime: `${Date.now() - startTime}ms`,
      };

      if (includeDetails) {
        const memoryUsage = process.memoryUsage();
        (healthInfo as any).systemInfo = {
          node: {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
          },
          memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          },
          process: {
            pid: process.pid,
            ppid: process.ppid,
            cwd: process.cwd(),
          },
        };
      }

      return this.formatResult(healthInfo, {
        executionTime: Date.now() - startTime,
        cacheHit: false,
        apiCalls: 1,
      });
    } catch (error) {
      // Even if NEXON API fails, we can still report server health
      const healthInfo = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        server: {
          name: 'mcp-maple',
          version: '1.0.0',
          uptime: `${process.uptime().toFixed(2)}s`,
        },
        nexonApi: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error),
        },
        responseTime: `${Date.now() - startTime}ms`,
      };

      return this.formatResult(healthInfo, {
        executionTime: Date.now() - startTime,
        cacheHit: false,
        apiCalls: 1,
      });
    }
  }

  protected validateImpl(args: Record<string, any>): boolean {
    // Validate includeDetails if provided
    if ('includeDetails' in args) {
      const value = args.includeDetails;
      if (typeof value !== 'boolean') {
        return false;
      }
    }

    return true;
  }

}
