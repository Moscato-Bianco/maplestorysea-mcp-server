/**
 * Unit tests for utility functions
 */

import { jest } from '@jest/globals';
import {
  createNexonApiError,
  createSeaApiError,
  SeaApiUnsupportedFeatureError,
  SeaWorldNotFoundError,
  SeaCharacterNameError,
  isRetryableError,
  getRetryDelay,
  sanitizeErrorForLogging,
} from '../../src/utils/errors';
import { MemoryCache } from '../../src/utils/cache';
import {
  validateCharacterName,
  validateWorldName,
  validateDate,
  sanitizeCharacterName,
  sanitizeGuildName,
} from '../../src/utils/validation';

describe('Error Utilities', () => {
  describe('createNexonApiError', () => {
    test('should create appropriate error for 404 character endpoint', () => {
      const error = createNexonApiError(404, 'Not found', '/maplestorysea/v1/character/basic', {
        character_name: 'TestChar'
      });

      expect(error.message).toContain('TestChar');
      expect(error.code).toBe('CHARACTER_NOT_FOUND');
    });

    test('should create appropriate error for 404 guild endpoint', () => {
      const error = createNexonApiError(404, 'Not found', '/maplestorysea/v1/guild/basic', {
        guild_name: 'TestGuild'
      });

      expect(error.message).toContain('TestGuild');
      expect(error.code).toBe('GUILD_NOT_FOUND');
    });

    test('should create invalid API key error for 401', () => {
      const error = createNexonApiError(401, 'Unauthorized');

      expect(error.message).toContain('Invalid NEXON API key');
      expect(error.code).toBe('INVALID_API_KEY');
    });

    test('should create rate limit error for 429', () => {
      const error = createNexonApiError(429, 'Too many requests');

      expect(error.message).toContain('rate limit');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should detect Korean character names in 400 errors', () => {
      const error = createNexonApiError(400, 'Bad request', '/maplestorysea/v1/character/basic', {
        character_name: '한국이름' // Korean name for testing validation
      });

      expect(error).toBeInstanceOf(SeaCharacterNameError);
      expect(error.message).toContain('Korean characters not supported');
    });

    test('should detect invalid world names in 400 errors', () => {
      const error = createNexonApiError(400, 'Bad request', '/maplestorysea/v1/ranking/overall', {
        world_name: 'Scania'
      });

      expect(error).toBeInstanceOf(SeaWorldNotFoundError);
      expect(error.message).toContain('Scania');
    });
  });

  describe('createSeaApiError', () => {
    test('should create unsupported feature error', () => {
      const error = createSeaApiError('unsupported_feature', { feature: 'notices' });

      expect(error).toBeInstanceOf(SeaApiUnsupportedFeatureError);
      expect(error.message).toContain('notices');
    });

    test('should create invalid world error', () => {
      const error = createSeaApiError('invalid_world', { worldName: 'Scania' });

      expect(error).toBeInstanceOf(SeaWorldNotFoundError);
      expect(error.message).toContain('Scania');
    });

    test('should create invalid character name error', () => {
      const error = createSeaApiError('invalid_character_name', { 
        characterName: '한국이름', // Korean name for testing
        reason: 'Korean characters not allowed'
      });

      expect(error).toBeInstanceOf(SeaCharacterNameError);
      expect(error.message).toContain('한국이름');
    });
  });

  describe('isRetryableError', () => {
    test('should identify retryable errors', () => {
      const networkError = new (require('../../src/utils/errors').NetworkError)(new Error('Network timeout'));
      const rateLimit = new (require('../../src/utils/errors').RateLimitError)();

      expect(isRetryableError(networkError)).toBe(true);
      expect(isRetryableError(rateLimit)).toBe(true);
    });

    test('should identify non-retryable errors', () => {
      const validationError = new (require('../../src/utils/errors').ValidationError)('field', 'value');
      const authError = new (require('../../src/utils/errors').InvalidApiKeyError)();

      expect(isRetryableError(validationError)).toBe(false);
      expect(isRetryableError(authError)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    test('should calculate exponential backoff with jitter', () => {
      const delay1 = getRetryDelay(1);
      const delay2 = getRetryDelay(2);
      const delay3 = getRetryDelay(3);

      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      expect(delay3).toBeLessThanOrEqual(30000); // Max delay
    });

    test('should respect custom base delay', () => {
      const delay = getRetryDelay(1, 2000);
      expect(delay).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('sanitizeErrorForLogging', () => {
    test('should redact sensitive information', () => {
      const error = {
        message: 'Test error',
        context: {
          api_key: 'secret123',
          password: 'password123',
          normalField: 'normalValue'
        }
      };

      const sanitized = sanitizeErrorForLogging(error);

      expect(sanitized.context?.api_key).toBe('[REDACTED]');
      expect(sanitized.context?.password).toBe('[REDACTED]');
      expect(sanitized.context?.normalField).toBe('normalValue');
    });
  });
});

describe('Cache Utilities', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  test('should store and retrieve values', () => {
    const key = 'test-key';
    const value = { data: 'test-data' };

    cache.set(key, value);
    const retrieved = cache.get(key);

    expect(retrieved).toEqual(value);
  });

  test('should respect TTL', (done) => {
    const key = 'test-key';
    const value = { data: 'test-data' };

    cache.set(key, value, 50); // 50ms TTL

    setTimeout(() => {
      const retrieved = cache.get(key);
      expect(retrieved).toBeNull();
      done();
    }, 100);
  });

  test('should delete values', () => {
    const key = 'test-key';
    const value = { data: 'test-data' };

    cache.set(key, value);
    cache.delete(key);
    const retrieved = cache.get(key);

    expect(retrieved).toBeNull();
  });

  test('should clear all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.size()).toBe(2);

    cache.clear();

    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  test('should generate consistent cache keys', () => {
    const key1 = MemoryCache.generateOcidCacheKey('TestChar');
    const key2 = MemoryCache.generateOcidCacheKey('testchar'); // Different case
    const key3 = MemoryCache.generateOcidCacheKey('Test Char'); // With space

    // Should normalize to same key
    expect(key1).toBe(key2);
    expect(key1).toBe(key3);
  });
});

describe('Validation Utilities', () => {
  describe('validateCharacterName', () => {
    test('should accept valid English character names', () => {
      expect(() => validateCharacterName('TestChar')).not.toThrow();
      expect(() => validateCharacterName('Test123')).not.toThrow();
      expect(() => validateCharacterName('AB')).not.toThrow(); // Changed from 'A' to 'AB' (min 2 chars)
    });

    test('should reject Korean characters', () => {
      expect(() => validateCharacterName('한국이름')).toThrow(); // Korean name should throw
      expect(() => validateCharacterName('Test한국')).toThrow(); // Mixed name should throw
    });

    test('should reject invalid lengths', () => {
      expect(() => validateCharacterName('')).toThrow();
      expect(() => validateCharacterName('A'.repeat(20))).toThrow();
    });

    test('should reject special characters', () => {
      expect(() => validateCharacterName('Test@')).toThrow();
      expect(() => validateCharacterName('Test-Name')).toThrow();
    });
  });

  describe('validateWorldName', () => {
    test('should accept valid SEA world names', () => {
      expect(() => validateWorldName('Aquila')).not.toThrow();
      expect(() => validateWorldName('Bootes')).not.toThrow();
      expect(() => validateWorldName('Cassiopeia')).not.toThrow();
      expect(() => validateWorldName('Draco')).not.toThrow();
    });

    test('should reject invalid world names', () => {
      expect(() => validateWorldName('Scania')).toThrow();
      expect(() => validateWorldName('Windia')).toThrow();
      expect(() => validateWorldName('Bera')).toThrow();
    });

    test('should be case sensitive', () => {
      expect(() => validateWorldName('aquila')).toThrow();
      expect(() => validateWorldName('AQUILA')).toThrow();
    });
  });

  describe('validateDate', () => {
    test('should accept valid date formats', () => {
      expect(() => validateDate('2024-01-15')).not.toThrow();
      expect(() => validateDate('2023-12-31')).not.toThrow();
    });

    test('should reject invalid date formats', () => {
      expect(() => validateDate('01-15-2024')).toThrow();
      expect(() => validateDate('2024/01/15')).toThrow();
      expect(() => validateDate('invalid-date')).toThrow();
    });

    test('should reject invalid dates', () => {
      expect(() => validateDate('2024-13-01')).toThrow(); // Invalid month
      expect(() => validateDate('2024-02-31')).toThrow(); // Invalid day for February
    });
  });

  describe('sanitizeCharacterName', () => {
    test('should normalize character names', () => {
      expect(sanitizeCharacterName(' TestChar ')).toBe('testchar');
      expect(sanitizeCharacterName('Test Char')).toBe('testchar');
      expect(sanitizeCharacterName('TEST123')).toBe('test123');
    });
  });

  describe('sanitizeGuildName', () => {
    test('should normalize guild names', () => {
      expect(sanitizeGuildName(' TestGuild ')).toBe('testguild');
      expect(sanitizeGuildName('Test Guild')).toBe('testguild');
      expect(sanitizeGuildName('TEST123')).toBe('test123');
    });
  });
});