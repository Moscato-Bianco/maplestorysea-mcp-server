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
    super('Invalid NEXON API key provided', 'INVALID_API_KEY', 401);
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
    default:
      return new NexonApiError(message, statusCode, endpoint, params);
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
  // Exponential backoff with jitter
  const delay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, 30000); // Max 30 seconds
}

export function sanitizeErrorForLogging(error: any): Record<string, any> {
  if (error instanceof McpMapleError) {
    return error.toJSON();
  }

  return {
    name: error.name || 'UnknownError',
    message: error.message || 'Unknown error occurred',
    stack: error.stack,
  };
}
