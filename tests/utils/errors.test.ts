/**
 * Test suite for error utilities
 * Tests custom error classes and error handling functions
 */

import {
  McpMapleError,
  NexonApiError,
  CharacterNotFoundError,
  GuildNotFoundError,
  InvalidApiKeyError,
  RateLimitError,
  ValidationError,
  NetworkError,
  TimeoutError,
  createNexonApiError,
  isRetryableError,
  getRetryDelay,
  sanitizeErrorForLogging,
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('McpMapleError', () => {
    test('should create error with all properties', () => {
      const error = new McpMapleError(
        'Test error',
        'TEST_ERROR',
        400,
        { key: 'value' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ key: 'value' });
      expect(error.name).toBe('McpMapleError');
    });

    test('should serialize to JSON correctly', () => {
      const error = new McpMapleError('Test error', 'TEST_ERROR', 400);
      const json = error.toJSON();

      expect(json).toMatchObject({
        name: 'McpMapleError',
        message: 'Test error',
        code: 'TEST_ERROR',
        statusCode: 400,
      });
      expect(json.stack).toBeDefined();
    });
  });

  describe('NexonApiError', () => {
    test('should create NEXON API error with endpoint context', () => {
      const error = new NexonApiError(
        'API request failed',
        500,
        '/character/basic',
        { ocid: 'test' }
      );

      expect(error.message).toBe('API request failed');
      expect(error.code).toBe('NEXON_API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.context).toEqual({
        endpoint: '/character/basic',
        params: { ocid: 'test' },
      });
      expect(error.name).toBe('NexonApiError');
    });
  });

  describe('CharacterNotFoundError', () => {
    test('should create character not found error', () => {
      const error = new CharacterNotFoundError('TestCharacter');

      expect(error.message).toBe("Character 'TestCharacter' not found");
      expect(error.code).toBe('CHARACTER_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.context).toEqual({ characterName: 'TestCharacter' });
      expect(error.name).toBe('CharacterNotFoundError');
    });
  });

  describe('GuildNotFoundError', () => {
    test('should create guild not found error without world', () => {
      const error = new GuildNotFoundError('TestGuild');

      expect(error.message).toBe("Guild 'TestGuild' not found");
      expect(error.code).toBe('GUILD_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.context).toEqual({ guildName: 'TestGuild', worldName: undefined });
    });

    test('should create guild not found error with world', () => {
      const error = new GuildNotFoundError('TestGuild', '스카니아');

      expect(error.message).toBe("Guild 'TestGuild' not found in world '스카니아'");
      expect(error.context).toEqual({ guildName: 'TestGuild', worldName: '스카니아' });
    });
  });

  describe('InvalidApiKeyError', () => {
    test('should create invalid API key error', () => {
      const error = new InvalidApiKeyError();

      expect(error.message).toBe('Invalid NEXON API key provided');
      expect(error.code).toBe('INVALID_API_KEY');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('InvalidApiKeyError');
    });
  });

  describe('RateLimitError', () => {
    test('should create rate limit error', () => {
      const error = new RateLimitError(60);

      expect(error.message).toBe('API rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(429);
      expect(error.context).toEqual({ retryAfter: 60 });
    });
  });

  describe('ValidationError', () => {
    test('should create validation error', () => {
      const error = new ValidationError('characterName', null, 'string');

      expect(error.message).toBe("Validation failed for field 'characterName': null (expected string)");
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({
        field: 'characterName',
        value: null,
        expectedType: 'string',
      });
    });
  });

  describe('NetworkError', () => {
    test('should create network error from original error', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError(originalError);

      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.context).toEqual({
        originalError: 'Connection failed',
      });
    });
  });

  describe('TimeoutError', () => {
    test('should create timeout error', () => {
      const error = new TimeoutError(5000);

      expect(error.message).toBe('Request timed out after 5000ms');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.statusCode).toBe(408);
      expect(error.context).toEqual({ timeout: 5000 });
    });
  });
});

describe('Error Factory Functions', () => {
  describe('createNexonApiError', () => {
    test('should create InvalidApiKeyError for 401 status', () => {
      const error = createNexonApiError(401, 'Unauthorized');

      expect(error).toBeInstanceOf(InvalidApiKeyError);
      expect(error.statusCode).toBe(401);
    });

    test('should create CharacterNotFoundError for 404 with character endpoint', () => {
      const error = createNexonApiError(
        404,
        'Not Found',
        '/character/basic',
        { character_name: 'TestChar' }
      );

      expect(error).toBeInstanceOf(CharacterNotFoundError);
      expect(error.context?.characterName).toBe('TestChar');
    });

    test('should create GuildNotFoundError for 404 with guild endpoint', () => {
      const error = createNexonApiError(
        404,
        'Not Found',
        '/guild/basic',
        { guild_name: 'TestGuild', world_name: '스카니아' }
      );

      expect(error).toBeInstanceOf(GuildNotFoundError);
      expect(error.context?.guildName).toBe('TestGuild');
      expect(error.context?.worldName).toBe('스카니아');
    });

    test('should create RateLimitError for 429 status', () => {
      const error = createNexonApiError(429, 'Too Many Requests');

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.statusCode).toBe(429);
    });

    test('should create NexonApiError for other status codes', () => {
      const error = createNexonApiError(500, 'Internal Server Error', '/test');

      expect(error).toBeInstanceOf(NexonApiError);
      expect(error.statusCode).toBe(500);
    });
  });
});

describe('Error Utilities', () => {
  describe('isRetryableError', () => {
    test('should return true for server errors (5xx)', () => {
      const error = new NexonApiError('Server Error', 500);
      expect(isRetryableError(error)).toBe(true);
    });

    test('should return true for rate limit errors', () => {
      const error = new RateLimitError();
      expect(isRetryableError(error)).toBe(true);
    });

    test('should return true for network errors', () => {
      const error = new NetworkError(new Error('Connection failed'));
      expect(isRetryableError(error)).toBe(true);
    });

    test('should return true for timeout errors', () => {
      const error = new TimeoutError(5000);
      expect(isRetryableError(error)).toBe(true);
    });

    test('should return false for client errors (4xx except 429)', () => {
      const error = new InvalidApiKeyError();
      expect(isRetryableError(error)).toBe(false);
    });

    test('should return false for validation errors', () => {
      const error = new ValidationError('field', 'value');
      expect(isRetryableError(error)).toBe(false);
    });

    test('should return false for generic errors', () => {
      const error = new Error('Generic error');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    test('should calculate exponential backoff delay', () => {
      expect(getRetryDelay(1, 1000)).toBeGreaterThanOrEqual(1000);
      expect(getRetryDelay(1, 1000)).toBeLessThan(1100); // with jitter

      expect(getRetryDelay(2, 1000)).toBeGreaterThanOrEqual(2000);
      expect(getRetryDelay(2, 1000)).toBeLessThan(2200);

      expect(getRetryDelay(3, 1000)).toBeGreaterThanOrEqual(4000);
      expect(getRetryDelay(3, 1000)).toBeLessThan(4400);
    });

    test('should cap delay at 30 seconds', () => {
      const delay = getRetryDelay(10, 1000);
      expect(delay).toBeLessThanOrEqual(30000);
    });
  });

  describe('sanitizeErrorForLogging', () => {
    test('should sanitize McpMapleError', () => {
      const error = new ValidationError('field', 'value');
      const sanitized = sanitizeErrorForLogging(error);

      expect(sanitized).toMatchObject({
        name: 'ValidationError',
        message: error.message,
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    test('should sanitize generic error', () => {
      const error = new Error('Generic error');
      const sanitized = sanitizeErrorForLogging(error);

      expect(sanitized).toMatchObject({
        name: 'Error',
        message: 'Generic error',
      });
      expect(sanitized.stack).toBeDefined();
    });

    test('should handle error without name or message', () => {
      const error = {};
      const sanitized = sanitizeErrorForLogging(error);

      expect(sanitized).toMatchObject({
        name: 'UnknownError',
        message: 'Unknown error occurred',
      });
    });
  });
});