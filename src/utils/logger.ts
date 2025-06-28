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
}
