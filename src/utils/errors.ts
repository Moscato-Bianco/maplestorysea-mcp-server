/**
 * Custom error classes for MCP Maple
 * Provides structured error handling for different failure scenarios
 */

export class McpMapleError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'McpMapleError';
    Object.setPrototypeOf(this, McpMapleError.prototype);
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class NexonApiError extends McpMapleError {
  constructor(
    message: string,
    statusCode: number,
    endpoint?: string,
    params?: Record<string, any>
  ) {
    super(message, 'NEXON_API_ERROR', statusCode, { endpoint, params });
    this.name = 'NexonApiError';
    Object.setPrototypeOf(this, NexonApiError.prototype);
  }
}

export class CharacterNotFoundError extends McpMapleError {
  constructor(characterName: string) {
    super(`Character '${characterName}' not found`, 'CHARACTER_NOT_FOUND', 404, { characterName });
    this.name = 'CharacterNotFoundError';
    Object.setPrototypeOf(this, CharacterNotFoundError.prototype);
  }
}

export class GuildNotFoundError extends McpMapleError {
  constructor(guildName: string, worldName?: string) {
    super(
      `Guild '${guildName}' not found${worldName ? ` in world '${worldName}'` : ''}`,
      'GUILD_NOT_FOUND',
      404,
      { guildName, worldName }
    );
    this.name = 'GuildNotFoundError';
    Object.setPrototypeOf(this, GuildNotFoundError.prototype);
  }
}

export class InvalidApiKeyError extends McpMapleError {
  constructor() {
    super('Invalid NEXON API key provided for MapleStory SEA', 'INVALID_API_KEY', 401);
    this.name = 'InvalidApiKeyError';
    Object.setPrototypeOf(this, InvalidApiKeyError.prototype);
  }
}

export class RateLimitError extends McpMapleError {
  constructor(retryAfter?: number) {
    super('API rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ValidationError extends McpMapleError {
  constructor(field: string, value: any, expectedType?: string) {
    super(
      `Validation failed for field '${field}': ${value}${expectedType ? ` (expected ${expectedType})` : ''}`,
      'VALIDATION_ERROR',
      400,
      { field, value, expectedType }
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NetworkError extends McpMapleError {
  constructor(originalError: Error) {
    super('Network request failed', 'NETWORK_ERROR', undefined, {
      originalError: originalError.message,
    });
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends McpMapleError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`, 'TIMEOUT_ERROR', 408, { timeout });
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class CacheError extends McpMapleError {
  constructor(operation: string, originalError?: Error) {
    super(`Cache operation failed: ${operation}`, 'CACHE_ERROR', undefined, {
      operation,
      originalError: originalError?.message,
    });
    this.name = 'CacheError';
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

export class ConfigurationError extends McpMapleError {
  constructor(setting: string, value?: any) {
    super(
      `Invalid configuration for '${setting}'${value ? `: ${value}` : ''}`,
      'CONFIGURATION_ERROR',
      500,
      {
        setting,
        value,
      }
    );
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ServiceUnavailableError extends McpMapleError {
  constructor(service: string, reason?: string) {
    super(
      `Service '${service}' is unavailable${reason ? `: ${reason}` : ''}`,
      'SERVICE_UNAVAILABLE',
      503,
      {
        service,
        reason,
      }
    );
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * SEA API specific errors
 */
export class SeaApiUnsupportedFeatureError extends McpMapleError {
  constructor(feature: string) {
    super(
      `Feature '${feature}' is not supported by MapleStory SEA API`,
      'SEA_API_UNSUPPORTED_FEATURE',
      501,
      { feature }
    );
    this.name = 'SeaApiUnsupportedFeatureError';
    Object.setPrototypeOf(this, SeaApiUnsupportedFeatureError.prototype);
  }
}

export class SeaWorldNotFoundError extends McpMapleError {
  constructor(worldName: string) {
    super(
      `World '${worldName}' is not available in MapleStory SEA. Available worlds: Aquila, Bootes, Cassiopeia, Delphinus`,
      'SEA_WORLD_NOT_FOUND',
      400,
      { worldName, availableWorlds: ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'] }
    );
    this.name = 'SeaWorldNotFoundError';
    Object.setPrototypeOf(this, SeaWorldNotFoundError.prototype);
  }
}

export class SeaCharacterNameError extends McpMapleError {
  constructor(characterName: string, reason: string = 'Invalid character name format') {
    super(
      `${reason}. Character names in SEA must contain only English letters and numbers: '${characterName}'`,
      'SEA_CHARACTER_NAME_ERROR',
      400,
      { characterName, reason }
    );
    this.name = 'SeaCharacterNameError';
    Object.setPrototypeOf(this, SeaCharacterNameError.prototype);
  }
}

export class DatabaseError extends McpMapleError {
  constructor(operation: string, originalError?: Error) {
    super(`Database operation failed: ${operation}`, 'DATABASE_ERROR', 500, {
      operation,
      originalError: originalError?.message,
    });
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class AuthenticationError extends McpMapleError {
  constructor(reason?: string) {
    super(`Authentication failed${reason ? `: ${reason}` : ''}`, 'AUTHENTICATION_ERROR', 401, {
      reason,
    });
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends McpMapleError {
  constructor(resource: string, action: string) {
    super(
      `Access denied: insufficient permissions for '${action}' on '${resource}'`,
      'AUTHORIZATION_ERROR',
      403,
      {
        resource,
        action,
      }
    );
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ToolExecutionError extends McpMapleError {
  constructor(toolName: string, originalError: Error) {
    super(`Tool execution failed: ${toolName}`, 'TOOL_EXECUTION_ERROR', 500, {
      toolName,
      originalError: originalError.message,
      originalStack: originalError.stack,
    });
    this.name = 'ToolExecutionError';
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

// Error factory functions
export function createNexonApiError(
  statusCode: number,
  message: string,
  endpoint?: string,
  params?: Record<string, any>
): McpMapleError {
  switch (statusCode) {
    case 401:
      return new InvalidApiKeyError();
    case 403:
      // Handle access denied errors - often API key doesn't have proper permissions
      if (message.toLowerCase().includes('access denied')) {
        return new AuthorizationError('NEXON API', 'access data with provided API key');
      }
      return new AuthorizationError('API endpoint', 'access');
    case 404:
      if (endpoint?.includes('character')) {
        const characterName = params?.character_name || 'unknown';
        return new CharacterNotFoundError(characterName);
      }
      if (endpoint?.includes('guild')) {
        const guildName = params?.guild_name || 'unknown';
        const worldName = params?.world_name;
        return new GuildNotFoundError(guildName, worldName);
      }
      return new McpMapleError(message, 'NOT_FOUND', statusCode, { endpoint, params });
    case 429:
      return new RateLimitError();
    case 501:
      // Handle unsupported features for SEA API
      if (message.toLowerCase().includes('notice') || 
          message.toLowerCase().includes('probability') || 
          message.toLowerCase().includes('server status') ||
          endpoint?.includes('/notice/') ||
          endpoint?.includes('/probability/') ||
          endpoint?.includes('/server/')) {
        const feature = endpoint?.split('/').pop() || 'unknown';
        return new SeaApiUnsupportedFeatureError(feature);
      }
      return new NexonApiError(message, statusCode, endpoint, params);
    case 400:
      // Handle SEA-specific validation errors
      if (endpoint?.includes('/maplestorysea/') && params) {
        // Check for invalid world names
        if (params.world_name && !['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'].includes(params.world_name)) {
          return new SeaWorldNotFoundError(params.world_name);
        }
        // Check for invalid character names (Korean characters in SEA API)
        if (params.character_name && /[가-힣]/.test(params.character_name)) {
          return new SeaCharacterNameError(params.character_name, 'Korean characters not supported in SEA API');
        }
      }
      return new NexonApiError(message, statusCode, endpoint, params);
    default:
      return new NexonApiError(message, statusCode, endpoint, params);
  }
}

/**
 * SEA API specific error factory
 */
export function createSeaApiError(
  type: 'unsupported_feature' | 'invalid_world' | 'invalid_character_name',
  details: { feature?: string; worldName?: string; characterName?: string; reason?: string }
): McpMapleError {
  switch (type) {
    case 'unsupported_feature':
      return new SeaApiUnsupportedFeatureError(details.feature || 'unknown');
    case 'invalid_world':
      return new SeaWorldNotFoundError(details.worldName || 'unknown');
    case 'invalid_character_name':
      return new SeaCharacterNameError(details.characterName || 'unknown', details.reason);
    default:
      return new McpMapleError('Unknown SEA API error', 'SEA_API_ERROR');
  }
}

// Error utilities
export function isRetryableError(error: Error): boolean {
  if (error instanceof NexonApiError) {
    // Retry on server errors and rate limits (with backoff)
    return error.statusCode ? error.statusCode >= 500 || error.statusCode === 429 : false;
  }
  if (error instanceof RateLimitError) {
    return true;
  }
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  return false;
}

export function getRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
  // Exponential backoff with jitter for SEA API
  const delay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, 30000); // Max 30 seconds for stability
}

export function sanitizeErrorForLogging(error: any): Record<string, any> {
  if (error instanceof McpMapleError) {
    const errorData = error.toJSON();

    // Remove sensitive information from context
    if (errorData.context) {
      const sanitizedContext = { ...errorData.context };

      // Remove API keys, passwords, tokens
      const sensitiveKeys = ['api_key', 'apiKey', 'password', 'token', 'secret', 'authorization'];
      sensitiveKeys.forEach((key) => {
        if (sanitizedContext[key]) {
          sanitizedContext[key] = '[REDACTED]';
        }
      });

      // Sanitize URLs to remove query parameters that might contain sensitive data
      if (sanitizedContext.endpoint && typeof sanitizedContext.endpoint === 'string') {
        try {
          const url = new URL(sanitizedContext.endpoint);
          url.search = ''; // Remove query parameters
          sanitizedContext.endpoint = url.toString();
        } catch {
          // If URL parsing fails, leave as is
        }
      }

      errorData.context = sanitizedContext;
    }

    return errorData;
  }

  return {
    name: error.name || 'UnknownError',
    message: error.message || 'Unknown error occurred',
    stack: error.stack,
  };
}

export interface ErrorRecoveryStrategy {
  name: string;
  canHandle: (error: Error) => boolean;
  recover: (error: Error, context?: any) => Promise<any>;
  maxAttempts?: number;
}

export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = [];

  registerStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  async attemptRecovery(error: Error, context?: any): Promise<any> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          return await strategy.recover(error, context);
        } catch (recoveryError) {
          // Recovery failed, try next strategy or throw original error
          continue;
        }
      }
    }

    // No strategy could handle the error
    throw error;
  }
}

// Built-in recovery strategies
export const retryStrategy: ErrorRecoveryStrategy = {
  name: 'retry',
  canHandle: (error: Error) => isRetryableError(error),
  recover: async (
    error: Error,
    context?: { operation: () => Promise<any>; maxAttempts?: number }
  ) => {
    if (!context?.operation) {
      throw error;
    }

    const maxAttempts = context.maxAttempts || 3;
    let lastError = error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          // Wait before retry
          const delay = getRetryDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        return await context.operation();
      } catch (retryError) {
        lastError = retryError as Error;

        if (!isRetryableError(lastError) || attempt === maxAttempts) {
          break;
        }
      }
    }

    throw lastError;
  },
};

export const fallbackStrategy: ErrorRecoveryStrategy = {
  name: 'fallback',
  canHandle: (error: Error) => true, // Can handle any error
  recover: async (
    error: Error,
    context?: { fallbackValue?: any; fallbackOperation?: () => Promise<any> }
  ) => {
    if (context?.fallbackOperation) {
      return await context.fallbackOperation();
    }

    if (context?.fallbackValue !== undefined) {
      return context.fallbackValue;
    }

    // Default fallback behavior
    if (error instanceof CharacterNotFoundError || error instanceof GuildNotFoundError) {
      return null;
    }

    throw error;
  },
};

export const cacheBypassStrategy: ErrorRecoveryStrategy = {
  name: 'cache-bypass',
  canHandle: (error: Error) => error instanceof CacheError,
  recover: async (error: Error, context?: { operation: () => Promise<any> }) => {
    if (!context?.operation) {
      throw error;
    }

    // Bypass cache and execute operation directly
    return await context.operation();
  },
};

export const seaApiUnsupportedFeatureStrategy: ErrorRecoveryStrategy = {
  name: 'sea-api-unsupported-feature',
  canHandle: (error: Error) => error instanceof SeaApiUnsupportedFeatureError,
  recover: async (error: Error, context?: { fallbackValue?: any; logger?: any }) => {
    // Log warning through proper logger if available
    if (context?.logger) {
      context.logger.warn('SEA API unsupported feature', {
        feature: error instanceof SeaApiUnsupportedFeatureError ? error.context?.feature : 'unknown',
        message: error.message,
        operation: 'error_recovery'
      });
    }
    
    // Return fallback value or empty result
    return context?.fallbackValue || null;
  },
};

export const seaWorldValidationStrategy: ErrorRecoveryStrategy = {
  name: 'sea-world-validation',
  canHandle: (error: Error) => error instanceof SeaWorldNotFoundError,
  recover: async (error: Error, context?: { suggestClosest?: boolean; logger?: any }) => {
    if (context?.suggestClosest && error instanceof SeaWorldNotFoundError && context?.logger) {
      // Log suggestion through proper logger
      const availableWorlds = ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'];
      context.logger.warn('Invalid world name for SEA API', {
        invalidWorld: error.context?.worldName,
        availableWorlds,
        operation: 'validation_error_recovery'
      });
    }
    
    throw error; // Don't recover from validation errors, let user fix input
  },
};

// Default error recovery manager with built-in strategies
export const defaultErrorRecovery = new ErrorRecoveryManager();
defaultErrorRecovery.registerStrategy(retryStrategy);
defaultErrorRecovery.registerStrategy(cacheBypassStrategy);
defaultErrorRecovery.registerStrategy(seaApiUnsupportedFeatureStrategy);
defaultErrorRecovery.registerStrategy(seaWorldValidationStrategy);
defaultErrorRecovery.registerStrategy(fallbackStrategy);

// Error aggregation for batch operations
export class ErrorAggregator {
  private errors: { operation: string; error: Error; context?: any }[] = [];

  addError(operation: string, error: Error, context?: any): void {
    this.errors.push({ operation, error, context });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): { operation: string; error: Error; context?: any }[] {
    return [...this.errors];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getSummary(): { total: number; byType: Record<string, number>; byCode: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byCode: Record<string, number> = {};

    this.errors.forEach(({ error }) => {
      const type = error.constructor.name;
      const code = error instanceof McpMapleError ? error.code : 'UNKNOWN';

      byType[type] = (byType[type] || 0) + 1;
      byCode[code] = (byCode[code] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      byCode,
    };
  }

  clear(): void {
    this.errors = [];
  }

  createAggregateError(): McpMapleError {
    if (this.errors.length === 0) {
      throw new Error('No errors to aggregate');
    }

    if (this.errors.length === 1) {
      const errorEntry = this.errors[0];
      if (errorEntry) {
        const { error } = errorEntry;
        return error instanceof McpMapleError
          ? error
          : new McpMapleError(error.message, 'UNKNOWN_ERROR');
      }
    }

    const summary = this.getSummary();
    return new McpMapleError(
      `Multiple operations failed: ${summary.total} errors`,
      'AGGREGATE_ERROR',
      500,
      {
        summary,
        errors: this.errors.map(({ operation, error }) => ({
          operation,
          error: sanitizeErrorForLogging(error),
        })),
      }
    );
  }
}
