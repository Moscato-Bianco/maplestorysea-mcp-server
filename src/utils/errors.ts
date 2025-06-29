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
  constructor(timeout: number, endpoint?: string) {
    const endpointInfo = endpoint ? ` for endpoint ${endpoint}` : '';
    super(`Request timed out after ${timeout}ms${endpointInfo}`, 'TIMEOUT_ERROR', 408, {
      timeout,
      endpoint,
    });
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class RankingTimeoutError extends McpMapleError {
  constructor(timeout: number, endpoint: string, queryParams?: Record<string, any>) {
    const message = `Ranking request timed out after ${timeout}ms. Ranking queries may take longer than other API calls.`;
    super(message, 'RANKING_TIMEOUT_ERROR', 408, {
      timeout,
      endpoint,
      queryParams,
      isRankingEndpoint: true,
    });
    this.name = 'RankingTimeoutError';
    Object.setPrototypeOf(this, RankingTimeoutError.prototype);
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

export class SeaGuildNameError extends McpMapleError {
  constructor(guildName: string, reason: string = 'Invalid guild name format') {
    super(
      `${reason}. Guild names in SEA must contain only English letters, numbers, and spaces: '${guildName}'`,
      'SEA_GUILD_NAME_ERROR',
      400,
      { guildName, reason }
    );
    this.name = 'SeaGuildNameError';
    Object.setPrototypeOf(this, SeaGuildNameError.prototype);
  }
}

export class SeaMaintenanceError extends McpMapleError {
  constructor(estimatedEndTime?: string) {
    const message = estimatedEndTime
      ? `MapleStory SEA servers are currently under maintenance. Estimated completion: ${estimatedEndTime}`
      : 'MapleStory SEA servers are currently under maintenance. Please try again later';

    super(message, 'SEA_MAINTENANCE_ERROR', 503, { estimatedEndTime });
    this.name = 'SeaMaintenanceError';
    Object.setPrototypeOf(this, SeaMaintenanceError.prototype);
  }
}

export class SeaDataUnavailableError extends McpMapleError {
  constructor(dataType: string, characterName?: string, additionalInfo?: string) {
    const characterInfo = characterName ? ` for character '${characterName}'` : '';
    const extraInfo = additionalInfo ? ` ${additionalInfo}` : '';
    const message = `${dataType} data is temporarily unavailable${characterInfo}.${extraInfo} Please try again later.`;

    super(message, 'SEA_DATA_UNAVAILABLE', 503, { dataType, characterName, additionalInfo });
    this.name = 'SeaDataUnavailableError';
    Object.setPrototypeOf(this, SeaDataUnavailableError.prototype);
  }
}

export class SeaQuotaExceededError extends McpMapleError {
  constructor(quotaType: 'daily' | 'hourly' | 'concurrent', resetTime?: string) {
    const resetInfo = resetTime ? ` Quota resets at ${resetTime}.` : ' Please try again later.';
    const message = `Your ${quotaType} API quota has been exceeded.${resetInfo}`;

    super(message, 'SEA_QUOTA_EXCEEDED', 429, { quotaType, resetTime });
    this.name = 'SeaQuotaExceededError';
    Object.setPrototypeOf(this, SeaQuotaExceededError.prototype);
  }
}

export class SeaValidationError extends McpMapleError {
  constructor(field: string, value: any, requirement: string, suggestion?: string) {
    const suggestionText = suggestion ? ` Suggestion: ${suggestion}` : '';
    const message = `Invalid ${field}: '${value}'. ${requirement}.${suggestionText}`;

    super(message, 'SEA_VALIDATION_ERROR', 400, { field, value, requirement, suggestion });
    this.name = 'SeaValidationError';
    Object.setPrototypeOf(this, SeaValidationError.prototype);
  }
}

export class SeaConnectionError extends McpMapleError {
  constructor(type: 'timeout' | 'network' | 'gateway', duration?: number, endpoint?: string) {
    let message = '';
    switch (type) {
      case 'timeout':
        message = duration
          ? `Connection timed out after ${duration}ms while accessing MapleStory SEA API`
          : 'Connection timeout while accessing MapleStory SEA API';
        break;
      case 'network':
        message = 'Network connection failed while accessing MapleStory SEA API';
        break;
      case 'gateway':
        message = 'Gateway error from MapleStory SEA API servers';
        break;
    }

    if (endpoint) {
      message += `. Endpoint: ${endpoint}`;
    }

    super(message, 'SEA_CONNECTION_ERROR', type === 'timeout' ? 408 : 502, {
      type,
      duration,
      endpoint,
    });
    this.name = 'SeaConnectionError';
    Object.setPrototypeOf(this, SeaConnectionError.prototype);
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
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('expire')) {
        return new McpMapleError(
          'Your NEXON API key has expired. Please renew your API key',
          'API_KEY_EXPIRED',
          401
        );
      }
      if (message.toLowerCase().includes('missing') || message.toLowerCase().includes('required')) {
        return new McpMapleError(
          'NEXON API key is required to access MapleStory SEA data',
          'API_KEY_MISSING',
          401
        );
      }
      return new InvalidApiKeyError();

    case 403:
      if (
        message.toLowerCase().includes('insufficient') ||
        message.toLowerCase().includes('permission')
      ) {
        return new McpMapleError(
          'Your API key does not have sufficient permissions for this operation',
          'INSUFFICIENT_PERMISSIONS',
          403
        );
      }
      if (message.toLowerCase().includes('access denied')) {
        return new AuthorizationError('NEXON API', 'access data with provided API key');
      }
      return new AuthorizationError('API endpoint', 'access');

    case 404:
      if (endpoint?.includes('character')) {
        const characterName = params?.character_name || 'unknown';
        // Check if it's actually a data unavailable issue vs character not found
        if (
          message.toLowerCase().includes('unavailable') ||
          message.toLowerCase().includes('temporary')
        ) {
          return new SeaDataUnavailableError('Character', characterName);
        }
        return new CharacterNotFoundError(characterName);
      }
      if (endpoint?.includes('guild')) {
        const guildName = params?.guild_name || 'unknown';
        const worldName = params?.world_name;
        if (
          message.toLowerCase().includes('unavailable') ||
          message.toLowerCase().includes('temporary')
        ) {
          return new SeaDataUnavailableError('Guild', guildName);
        }
        return new GuildNotFoundError(guildName, worldName);
      }
      if (endpoint?.includes('ranking')) {
        return new McpMapleError(
          'No ranking data available for the specified criteria',
          'RANKING_DATA_NOT_FOUND',
          404,
          { endpoint, params }
        );
      }
      return new McpMapleError(message, 'NOT_FOUND', statusCode, { endpoint, params });

    case 408:
      const timeout = params?.timeout || 'unknown';
      return new SeaConnectionError(
        'timeout',
        typeof timeout === 'number' ? timeout : undefined,
        endpoint
      );

    case 429:
      // Check for different types of rate limiting
      if (message.toLowerCase().includes('daily') || message.toLowerCase().includes('quota')) {
        return new SeaQuotaExceededError('daily');
      }
      if (message.toLowerCase().includes('concurrent')) {
        return new SeaQuotaExceededError('concurrent');
      }
      return new RateLimitError();

    case 500:
      return new McpMapleError(
        'Internal server error occurred. Please try again later',
        'INTERNAL_SERVER_ERROR',
        500,
        { endpoint, params }
      );

    case 501:
      // Handle unsupported features for SEA API
      if (
        message.toLowerCase().includes('notice') ||
        message.toLowerCase().includes('probability') ||
        message.toLowerCase().includes('server status') ||
        endpoint?.includes('/notice/') ||
        endpoint?.includes('/probability/') ||
        endpoint?.includes('/server/')
      ) {
        const feature = endpoint?.split('/').pop() || 'unknown';
        return new SeaApiUnsupportedFeatureError(feature);
      }
      return new NexonApiError(message, statusCode, endpoint, params);

    case 502:
      return new SeaConnectionError('gateway', undefined, endpoint);

    case 503:
      if (message.toLowerCase().includes('maintenance')) {
        return new SeaMaintenanceError();
      }
      return new ServiceUnavailableError('MapleStory SEA API', message);

    case 504:
      return new McpMapleError(
        'Gateway timeout while processing your request',
        'GATEWAY_TIMEOUT',
        504,
        { endpoint, params }
      );

    case 400:
      // Handle SEA-specific validation errors with detailed feedback
      if (endpoint?.includes('/maplestorysea/') && params) {
        // Check for invalid world names
        if (
          params.world_name &&
          !['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'].includes(params.world_name)
        ) {
          return new SeaWorldNotFoundError(params.world_name);
        }

        // Check for invalid character names
        if (params.character_name) {
          const characterName = params.character_name;
          if (/[가-힣]/.test(characterName)) {
            return new SeaCharacterNameError(
              characterName,
              'Korean characters not supported in SEA API'
            );
          }
          if (characterName.length < 2) {
            return new SeaValidationError(
              'character name',
              characterName,
              'Must be at least 2 characters long'
            );
          }
          if (characterName.length > 13) {
            return new SeaValidationError(
              'character name',
              characterName,
              'Must be 13 characters or less'
            );
          }
          if (!/^[a-zA-Z0-9]+$/.test(characterName)) {
            return new SeaCharacterNameError(characterName, 'Contains invalid characters');
          }
        }

        // Check for invalid guild names
        if (params.guild_name) {
          const guildName = params.guild_name;
          if (/[가-힣]/.test(guildName)) {
            return new SeaGuildNameError(guildName, 'Korean characters not supported in SEA API');
          }
          if (guildName.length < 2) {
            return new SeaValidationError(
              'guild name',
              guildName,
              'Must be at least 2 characters long'
            );
          }
          if (guildName.length > 12) {
            return new SeaValidationError('guild name', guildName, 'Must be 12 characters or less');
          }
        }

        // Check for invalid dates
        if (params.date) {
          const date = params.date;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return new SeaValidationError(
              'date',
              date,
              'Must be in YYYY-MM-DD format',
              'Use format like 2024-01-15'
            );
          }
          const parsedDate = new Date(date);
          const today = new Date();
          if (parsedDate > today) {
            return new SeaValidationError(
              'date',
              date,
              'Cannot be in the future',
              "Use today's date or earlier"
            );
          }
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (parsedDate < thirtyDaysAgo) {
            return new SeaValidationError(
              'date',
              date,
              'Date is too old',
              'Data is only available from the last 30 days'
            );
          }
        }

        // Check for invalid page numbers
        if (params.page) {
          const page = parseInt(params.page);
          if (isNaN(page) || page < 1 || page > 200) {
            return new SeaValidationError('page number', params.page, 'Must be between 1 and 200');
          }
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

export function getRetryDelay(
  attemptNumber: number,
  baseDelay: number = 1000,
  errorType?: 'rate_limit' | 'server_error' | 'network_error' | 'timeout'
): number {
  // SEA API optimized retry delays based on error type
  let adjustedBaseDelay = baseDelay;

  switch (errorType) {
    case 'rate_limit':
      adjustedBaseDelay = 5000; // 5 seconds for rate limit errors
      break;
    case 'server_error':
      adjustedBaseDelay = 2000; // 2 seconds for server errors
      break;
    case 'network_error':
      adjustedBaseDelay = 1500; // 1.5 seconds for network errors
      break;
    case 'timeout':
      adjustedBaseDelay = 3000; // 3 seconds for timeout errors
      break;
    default:
      adjustedBaseDelay = baseDelay;
  }

  // Exponential backoff with jitter for SEA API stability
  const backoffFactor = 2;
  const delay = adjustedBaseDelay * Math.pow(backoffFactor, attemptNumber - 1);

  // Add jitter to prevent thundering herd effect
  const jitterFactor = 0.1;
  const jitter = Math.random() * jitterFactor * delay;

  // Cap at maximum delay for stability
  return Math.min(delay + jitter, 30000);
}

export function shouldRetryError(error: Error, attemptNumber: number): boolean {
  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= 4) {
    // Max 3 retries (attempt 4 is final)
    return false;
  }

  // Always retry for retryable errors
  if (isRetryableError(error)) {
    return true;
  }

  // Special retry logic for SEA API specific errors
  if (error instanceof SeaConnectionError) {
    return error.context?.type !== 'gateway'; // Don't retry gateway errors
  }

  if (error instanceof SeaDataUnavailableError) {
    return attemptNumber <= 2; // Only retry twice for data availability
  }

  if (error instanceof SeaMaintenanceError) {
    return false; // Don't retry during maintenance
  }

  if (error instanceof SeaQuotaExceededError) {
    return error.context?.quotaType === 'concurrent'; // Only retry concurrent limits
  }

  return false;
}

export function getRetryDelayForError(error: Error, attemptNumber: number): number {
  if (error instanceof RateLimitError || error instanceof SeaQuotaExceededError) {
    return getRetryDelay(attemptNumber, 1000, 'rate_limit');
  }

  if (error instanceof TimeoutError || error instanceof SeaConnectionError) {
    const errorType =
      error instanceof SeaConnectionError
        ? error.context?.type === 'timeout'
          ? 'timeout'
          : 'network_error'
        : 'timeout';
    return getRetryDelay(attemptNumber, 1000, errorType);
  }

  if (error instanceof NexonApiError && error.statusCode && error.statusCode >= 500) {
    return getRetryDelay(attemptNumber, 1000, 'server_error');
  }

  if (error instanceof NetworkError) {
    return getRetryDelay(attemptNumber, 1000, 'network_error');
  }

  return getRetryDelay(attemptNumber);
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

  // Handle plain objects with context property
  const sanitizedError: Record<string, any> = {
    name: error.name || 'UnknownError',
    message: error.message || 'Unknown error occurred',
    stack: error.stack,
  };

  // Also sanitize context for plain objects
  if (error.context && typeof error.context === 'object') {
    const sanitizedContext = { ...error.context };

    // Remove API keys, passwords, tokens
    const sensitiveKeys = ['api_key', 'apiKey', 'password', 'token', 'secret', 'authorization'];
    sensitiveKeys.forEach((key) => {
      if (sanitizedContext[key]) {
        sanitizedContext[key] = '[REDACTED]';
      }
    });

    sanitizedError.context = sanitizedContext;
  }

  return sanitizedError;
}

/**
 * Enhanced error logging for SEA API debugging
 */
export function createDetailedErrorLog(
  error: Error,
  context: {
    operation?: string;
    endpoint?: string;
    params?: Record<string, any>;
    attemptNumber?: number;
    duration?: number;
    userAgent?: string;
    timestamp?: Date;
  } = {}
): Record<string, any> {
  const timestamp = context.timestamp || new Date();
  const sanitizedError = sanitizeErrorForLogging(error);

  const logEntry = {
    timestamp: timestamp.toISOString(),
    level: 'error',
    operation: context.operation || 'unknown',

    // Error information
    error: {
      type: error.constructor.name,
      code: error instanceof McpMapleError ? error.code : 'UNKNOWN',
      message: error.message,
      statusCode: error instanceof McpMapleError ? error.statusCode : undefined,
    },

    // Request context
    request: {
      endpoint: context.endpoint,
      params: context.params ? sanitizeParams(context.params) : undefined,
      userAgent: context.userAgent,
      duration: context.duration,
    },

    // Retry information
    retry: {
      attemptNumber: context.attemptNumber || 1,
      isRetryable: isRetryableError(error),
      nextRetryDelay: context.attemptNumber
        ? getRetryDelayForError(error, context.attemptNumber)
        : undefined,
    },

    // SEA API specific context
    seaApiContext: getSeaApiContextForError(error),

    // Debugging information
    debug: {
      stack: error.stack,
      fullError: sanitizedError,
    },
  };

  return logEntry;
}

/**
 * Sanitize request parameters for logging
 */
function sanitizeParams(params: Record<string, any>): Record<string, any> {
  const sanitized = { ...params };

  // Remove sensitive parameter values
  const sensitiveKeys = ['api_key', 'apiKey', 'key', 'password', 'token', 'secret'];
  sensitiveKeys.forEach((key) => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Get SEA API specific context for error logging
 */
function getSeaApiContextForError(error: Error): Record<string, any> {
  const context: Record<string, any> = {
    apiRegion: 'SEA',
    supportedWorlds: ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'],
  };

  if (error instanceof SeaWorldNotFoundError) {
    context.errorType = 'invalid_world';
    context.providedWorld = error.context?.worldName;
    context.suggestion = 'Use one of the supported SEA worlds';
  }

  if (error instanceof SeaCharacterNameError) {
    context.errorType = 'invalid_character_name';
    context.providedName = error.context?.characterName;
    context.requirement = 'English letters and numbers only';
  }

  if (error instanceof SeaGuildNameError) {
    context.errorType = 'invalid_guild_name';
    context.providedName = error.context?.guildName;
    context.requirement = 'English letters, numbers, and spaces only';
  }

  if (error instanceof SeaApiUnsupportedFeatureError) {
    context.errorType = 'unsupported_feature';
    context.feature = error.context?.feature;
    context.reason = 'Feature not available in SEA API';
  }

  if (error instanceof SeaConnectionError) {
    context.errorType = 'connection_issue';
    context.connectionType = error.context?.type;
    context.suggestion = 'Check network connectivity and SEA API status';
  }

  if (error instanceof SeaMaintenanceError) {
    context.errorType = 'maintenance';
    context.estimatedEndTime = error.context?.estimatedEndTime;
    context.suggestion = 'Wait for maintenance to complete';
  }

  if (error instanceof SeaDataUnavailableError) {
    context.errorType = 'data_unavailable';
    context.dataType = error.context?.dataType;
    context.characterName = error.context?.characterName;
    context.suggestion = 'Try again later or check if character/data exists';
  }

  if (error instanceof SeaQuotaExceededError) {
    context.errorType = 'quota_exceeded';
    context.quotaType = error.context?.quotaType;
    context.resetTime = error.context?.resetTime;
    context.suggestion = 'Reduce request frequency or wait for quota reset';
  }

  return context;
}

/**
 * Format error for user display (customer-friendly message)
 */
export function formatErrorForUser(error: Error): string {
  if (error instanceof SeaWorldNotFoundError) {
    return `Invalid world name. Please use one of these SEA worlds: Aquila, Bootes, Cassiopeia, or Delphinus.`;
  }

  if (error instanceof SeaCharacterNameError) {
    return `Invalid character name format. Character names in MapleStory SEA must contain only English letters and numbers.`;
  }

  if (error instanceof SeaGuildNameError) {
    return `Invalid guild name format. Guild names in MapleStory SEA must contain only English letters, numbers, and spaces.`;
  }

  if (error instanceof SeaMaintenanceError) {
    return `MapleStory SEA servers are currently under maintenance. Please try again later.`;
  }

  if (error instanceof SeaDataUnavailableError) {
    return `The requested data is temporarily unavailable. Please try again in a few moments.`;
  }

  if (error instanceof SeaQuotaExceededError) {
    const quotaType = error.context?.quotaType || 'API';
    return `Your ${quotaType} request limit has been reached. Please wait before making more requests.`;
  }

  if (error instanceof SeaConnectionError) {
    return `Connection issue with MapleStory SEA servers. Please check your internet connection and try again.`;
  }

  if (error instanceof CharacterNotFoundError) {
    return `Character not found in MapleStory SEA servers. Please check the character name and world.`;
  }

  if (error instanceof GuildNotFoundError) {
    return `Guild not found in MapleStory SEA servers. Please check the guild name and world.`;
  }

  if (error instanceof RateLimitError || error instanceof SeaQuotaExceededError) {
    return `Too many requests. Please wait a moment before trying again.`;
  }

  if (error instanceof InvalidApiKeyError) {
    return `Invalid API key. Please check your NEXON API key configuration.`;
  }

  if (error instanceof SeaApiUnsupportedFeatureError) {
    return `This feature is not available in MapleStory SEA. Please use only SEA-supported features.`;
  }

  // Generic fallback
  return `An error occurred while accessing MapleStory SEA data. Please try again later.`;
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
        feature:
          error instanceof SeaApiUnsupportedFeatureError ? error.context?.feature : 'unknown',
        message: error.message,
        operation: 'error_recovery',
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
        operation: 'validation_error_recovery',
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
