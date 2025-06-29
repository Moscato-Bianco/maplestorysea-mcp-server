/**
 * Health check system for monitoring application status
 */

import { McpLogger, defaultLogger } from './logger';
import { NexonApiClient } from '../api/nexon-client';
import { MemoryCache, defaultCache } from './cache';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version?: string;
  details: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface HealthCheckOptions {
  timeout?: number;
  retries?: number;
  interval?: number;
}

export abstract class HealthChecker {
  abstract name: string;
  abstract check(options?: HealthCheckOptions): Promise<ComponentHealth>;
}

export class ApiHealthChecker extends HealthChecker {
  name = 'nexon-api';

  constructor(private apiClient: NexonApiClient) {
    super();
  }

  async check(options: HealthCheckOptions = {}): Promise<ComponentHealth> {
    const startTime = Date.now();
    const timeout = options.timeout || 5000;

    // Create a timeout promise with cleanup
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Health check timeout')), timeout);
    });

    try {
      // Test API connectivity with a simple ranking request
      const healthPromise = this.apiClient.getOverallRanking(
        undefined,
        undefined,
        undefined,
        undefined,
        1
      );

      const result = await Promise.race([healthPromise, timeoutPromise]);

      // Clear the timeout if the API call succeeded
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        details: {
          endpoint: 'ranking/overall',
          timeout,
        },
      };
    } catch (error) {
      // Clear the timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const responseTime = Date.now() - startTime;

      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
        // Include more context for NEXON API errors
        if ('code' in error || 'statusCode' in error) {
          const extra = [];
          if ('statusCode' in error) extra.push(`Status: ${(error as any).statusCode}`);
          if ('code' in error) extra.push(`Code: ${(error as any).code}`);
          if (extra.length > 0) {
            errorMessage += ` (${extra.join(', ')})`;
          }
        }
      } else {
        errorMessage = String(error);
      }

      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: errorMessage,
        details: {
          endpoint: 'ranking/overall',
          timeout,
        },
      };
    }
  }
}

export class CacheHealthChecker extends HealthChecker {
  name = 'cache';

  constructor(private cache: MemoryCache) {
    super();
  }

  async check(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      // Test cache operations
      const testKey = 'health-check-test';
      const testValue: { timestamp: number } = { timestamp: Date.now() };

      // Test set operation
      this.cache.set(testKey, testValue, 1000);

      // Test get operation
      const retrieved = this.cache.get<{ timestamp: number }>(testKey);

      if (!retrieved || retrieved.timestamp !== testValue.timestamp) {
        throw new Error('Cache read/write verification failed');
      }

      // Test delete operation
      this.cache.delete(testKey);

      const afterDelete = this.cache.get(testKey);
      if (afterDelete !== null) {
        throw new Error('Cache delete verification failed');
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        details: {
          operations: ['set', 'get', 'delete'],
          cacheSize: this.cache.size(),
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export class MemoryHealthChecker extends HealthChecker {
  name = 'memory';

  async check(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      const memUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;

      // Convert bytes to MB
      const memoryMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      };

      // Determine status based on memory usage
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

      if (heapUsagePercent > 90) {
        status = 'unhealthy';
      } else if (heapUsagePercent > 80) {
        status = 'degraded';
      }

      return {
        status,
        lastCheck: new Date().toISOString(),
        responseTime,
        details: {
          memory: memoryMB,
          heapUsagePercent: Math.round(heapUsagePercent),
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export class ProcessHealthChecker extends HealthChecker {
  name = 'process';
  private startTime = Date.now();

  async check(): Promise<ComponentHealth> {
    const checkStartTime = Date.now();

    try {
      const uptime = process.uptime();
      const responseTime = Date.now() - checkStartTime;

      return {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        details: {
          uptime: Math.round(uptime),
          uptimeFormatted: this.formatUptime(uptime),
          pid: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - checkStartTime;

      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

export class HealthCheckManager {
  private checkers: Map<string, HealthChecker> = new Map();
  private logger: McpLogger;
  private lastCheck?: HealthStatus;

  constructor(logger: McpLogger = defaultLogger) {
    this.logger = logger;
  }

  registerChecker(checker: HealthChecker): void {
    this.checkers.set(checker.name, checker);
    this.logger.debug(`Registered health checker: ${checker.name}`);
  }

  async runHealthChecks(options: HealthCheckOptions = {}): Promise<HealthStatus> {
    const startTime = Date.now();
    const details: Record<string, ComponentHealth> = {};

    // Run all health checks in parallel
    const checkPromises = Array.from(this.checkers.entries()).map(async ([name, checker]) => {
      try {
        const result = await checker.check(options);
        details[name] = result;

        this.logger.logHealthCheck(name, result.status, {
          responseTime: result.responseTime,
          error: result.error,
        });

        return result;
      } catch (error) {
        const errorResult: ComponentHealth = {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        };

        details[name] = errorResult;
        this.logger.logHealthCheck(name, 'unhealthy', { error: errorResult.error });

        return errorResult;
      }
    });

    await Promise.all(checkPromises);

    // Determine overall status
    const statuses = Object.values(details).map((d) => d.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      details,
    };

    this.lastCheck = healthStatus;

    const checkDuration = Date.now() - startTime;
    this.logger.info(`Health check completed in ${checkDuration}ms`, {
      operation: 'health_check_summary',
      overallStatus,
      checkDuration,
      checkerCount: this.checkers.size,
    });

    return healthStatus;
  }

  getLastCheck(): HealthStatus | undefined {
    return this.lastCheck;
  }

  async getQuickStatus(): Promise<{ status: string; uptime: number; timestamp: string }> {
    return {
      status: this.lastCheck?.status || 'unknown',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Start periodic health checks
  startPeriodicChecks(interval: number = 60000): NodeJS.Timeout {
    // Default 1 minute
    this.logger.info(`Starting periodic health checks every ${interval}ms`);

    return setInterval(async () => {
      try {
        await this.runHealthChecks({ timeout: 5000 });
      } catch (error) {
        this.logger.error('Periodic health check failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, interval);
  }
}

// Create default health check manager with all checkers
export function createDefaultHealthManager(
  apiClient?: NexonApiClient,
  cache?: MemoryCache
): HealthCheckManager {
  const manager = new HealthCheckManager();

  // Always add process and memory checkers
  manager.registerChecker(new ProcessHealthChecker());
  manager.registerChecker(new MemoryHealthChecker());

  // Add cache checker if available
  if (cache) {
    manager.registerChecker(new CacheHealthChecker(cache));
  } else {
    manager.registerChecker(new CacheHealthChecker(defaultCache));
  }

  // Add API checker if available
  if (apiClient) {
    manager.registerChecker(new ApiHealthChecker(apiClient));
  }

  return manager;
}

// Export default health manager
export const defaultHealthManager = createDefaultHealthManager();
