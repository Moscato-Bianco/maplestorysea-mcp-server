/**
 * Logging utilities for MCP Maple
 * Provides structured logging for API operations and errors
 */

import winston, { Logger } from 'winston';

export interface LogContext {
  operation?: string;
  characterName?: string;
  guildName?: string;
  endpoint?: string;
  params?: Record<string, any>;
  duration?: number;
  error?: any;
  success?: boolean;
  worldName?: string;
  toolName?: string;
  [key: string]: any;
}

export class McpLogger {
  private logger: Logger;

  constructor(component: string = 'mcp-maple') {
    // In MCP mode (no port specified), disable console logging to avoid JSON pollution
    const isMcpMode = !process.env.MCP_PORT && !process.argv.includes('--port');

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, component: comp, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            component: comp || component,
            message,
            ...meta,
          });
        })
      ),
      defaultMeta: { component },
      silent: isMcpMode,
      transports: isMcpMode
        ? []
        : [
            new winston.transports.Console({
              stderrLevels: ['error', 'warn', 'info', 'debug'],
              consoleWarnLevels: [],
              format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            }),
          ],
    });

    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        })
      );
    }
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Specialized logging methods
  logApiRequest(endpoint: string, params?: Record<string, any>): void {
    this.info('API Request Started', {
      operation: 'api_request',
      endpoint,
      ...(params && { params }),
    });
  }

  logApiResponse(endpoint: string, duration: number, success: boolean): void {
    if (success) {
      this.info('API Request Completed', {
        operation: 'api_response',
        endpoint,
        duration,
        success,
      });
    } else {
      this.warn('API Request Failed', {
        operation: 'api_response',
        endpoint,
        duration,
        success,
      });
    }
  }

  logApiError(endpoint: string, error: any, duration?: number): void {
    this.error('API Request Error', {
      operation: 'api_error',
      endpoint,
      error: error.message || error,
      ...(duration !== undefined && { duration }),
    });
  }

  logCharacterOperation(operation: string, characterName: string, context?: any): void {
    this.info(`Character ${operation}`, {
      operation: `character_${operation}`,
      characterName,
      ...context,
    });
  }

  logGuildOperation(operation: string, guildName: string, worldName?: string, context?: any): void {
    this.info(`Guild ${operation}`, {
      operation: `guild_${operation}`,
      guildName,
      worldName,
      ...context,
    });
  }

  logMcpOperation(operation: string, toolName: string, context?: any): void {
    this.info(`MCP ${operation}`, {
      operation: `mcp_${operation}`,
      toolName,
      ...context,
    });
  }

  // Security and audit logging
  logSecurityEvent(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      operation: 'security_event',
      event,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  logAuditEvent(action: string, resource: string, user?: string, context?: LogContext): void {
    this.info(`Audit: ${action} on ${resource}`, {
      operation: 'audit_event',
      action,
      resource,
      user: user || 'anonymous',
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  // Performance logging
  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string = 'ms',
    context?: LogContext
  ): void {
    this.info(`Performance Metric: ${metric}`, {
      operation: 'performance_metric',
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  // Cache operations
  logCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete' | 'clear',
    key: string,
    context?: LogContext
  ): void {
    this.debug(`Cache ${operation.toUpperCase()}: ${key}`, {
      operation: 'cache_operation',
      cacheOperation: operation,
      cacheKey: key,
      ...context,
    });
  }

  // Error recovery logging
  logRecoveryAttempt(
    strategy: string,
    error: Error,
    attempt: number,
    success: boolean,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'warn';
    const message = `Recovery ${success ? 'succeeded' : 'failed'}: ${strategy} (attempt ${attempt})`;

    this.logger.log(level, message, {
      operation: 'error_recovery',
      strategy,
      attempt,
      success,
      error: error.message,
      ...context,
    });
  }

  // Health check logging
  logHealthCheck(
    component: string,
    status: 'healthy' | 'unhealthy' | 'degraded',
    details?: any
  ): void {
    const level = status === 'healthy' ? 'info' : 'warn';

    this.logger.log(level, `Health Check: ${component} is ${status}`, {
      operation: 'health_check',
      component,
      status,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // Rate limiting logging
  logRateLimit(action: 'applied' | 'exceeded' | 'reset', context?: LogContext): void {
    const level = action === 'exceeded' ? 'warn' : 'debug';

    this.logger.log(level, `Rate Limit ${action}`, {
      operation: 'rate_limit',
      action,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  // Structured error logging with sanitization
  logError(error: Error, context?: LogContext): void {
    const sanitizedError = this.sanitizeLogData({ error });

    this.error(`Error: ${error.message}`, {
      operation: 'error',
      errorType: error.constructor.name,
      errorMessage: error.message,
      stack: error.stack,
      ...sanitizedError,
      ...context,
    });
  }

  // Data sanitization for logging
  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = Array.isArray(data) ? [] : {};
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'authorization',
      'api_key',
      'apiKey',
      'accessToken',
      'refreshToken',
      'sessionId',
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey))) {
        (sanitized as any)[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = this.sanitizeLogData(value);
      } else {
        (sanitized as any)[key] = value;
      }
    }

    return sanitized;
  }

  // Batch logging for performance
  async flushLogs(): Promise<void> {
    return new Promise((resolve) => {
      if (this.logger.transports.length === 0) {
        resolve();
        return;
      }

      let pending = this.logger.transports.length;

      this.logger.transports.forEach((transport) => {
        if (typeof (transport as any).flush === 'function') {
          (transport as any).flush(() => {
            pending--;
            if (pending === 0) resolve();
          });
        } else {
          pending--;
          if (pending === 0) resolve();
        }
      });
    });
  }

  // Create child logger with additional context
  createChild(context: LogContext): McpLogger {
    const childLogger = new McpLogger();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<
    string,
    { count: number; totalTime: number; minTime: number; maxTime: number }
  > = new Map();
  private logger: McpLogger;

  constructor(logger: McpLogger) {
    this.logger = logger;
  }

  startTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
      });
    }

    this.logger.logPerformanceMetric(operation, duration, 'ms', {
      operation: operation,
    });
  }

  getMetrics(): Record<
    string,
    { count: number; avgTime: number; minTime: number; maxTime: number; totalTime: number }
  > {
    const result: Record<string, any> = {};

    for (const [operation, metric] of this.metrics.entries()) {
      result[operation] = {
        count: metric.count,
        avgTime: Math.round(metric.totalTime / metric.count),
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        totalTime: metric.totalTime,
      };
    }

    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  logSummary(): void {
    const metrics = this.getMetrics();

    this.logger.info('Performance Summary', {
      operation: 'performance_summary',
      metrics,
      timestamp: new Date().toISOString(),
    });
  }
}

// Request tracking for audit purposes
export class RequestTracker {
  private requests: Map<string, { startTime: number; context: LogContext }> = new Map();
  private logger: McpLogger;

  constructor(logger: McpLogger) {
    this.logger = logger;
  }

  startRequest(requestId: string, context: LogContext): void {
    this.requests.set(requestId, {
      startTime: Date.now(),
      context: { ...context },
    });

    this.logger.logAuditEvent('request_started', context.operation || 'unknown', context.user, {
      requestId,
      ...context,
    });
  }

  endRequest(requestId: string, success: boolean, additionalContext?: LogContext): void {
    const request = this.requests.get(requestId);

    if (!request) {
      this.logger.warn('Request tracking error: Unknown request ID', { requestId });
      return;
    }

    const duration = Date.now() - request.startTime;

    this.logger.logAuditEvent(
      success ? 'request_completed' : 'request_failed',
      request.context.operation || 'unknown',
      request.context.user,
      {
        requestId,
        duration,
        success,
        ...request.context,
        ...additionalContext,
      }
    );

    this.requests.delete(requestId);
  }

  getActiveRequests(): string[] {
    return Array.from(this.requests.keys());
  }

  cleanupStaleRequests(maxAge: number = 300000): void {
    // 5 minutes default
    const now = Date.now();

    for (const [requestId, request] of this.requests.entries()) {
      if (now - request.startTime > maxAge) {
        this.logger.warn('Cleaning up stale request', {
          requestId,
          age: now - request.startTime,
          context: request.context,
        });

        this.requests.delete(requestId);
      }
    }
  }
}

// Default logger instance
export const defaultLogger = new McpLogger('mcp-maple');
export const performanceMonitor = new PerformanceMonitor(defaultLogger);
export const requestTracker = new RequestTracker(defaultLogger);
