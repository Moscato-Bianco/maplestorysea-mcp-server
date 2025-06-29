/**
 * Basic Performance Benchmarks
 * Tests response times and throughput for critical functions
 */

import { jest } from '@jest/globals';
import {
  formatSEANumber,
  formatSEADate,
  formatSEATime,
  convertToSEATime
} from '../../src/utils/server-utils';
import { validateCharacterName, validateWorldName } from '../../src/utils/validation';
import { MemoryCache } from '../../src/utils/cache';

describe('Performance Benchmarks', () => {
  describe('Formatting Performance', () => {
    test('formatSEANumber should handle large volumes efficiently', () => {
      const start = Date.now();
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        formatSEANumber(Math.floor(Math.random() * 1000000));
      }
      
      const duration = Date.now() - start;
      const avgTime = duration / iterations;
      
      // Should format numbers quickly (< 0.01ms per operation)
      expect(avgTime).toBeLessThan(0.01);
      expect(duration).toBeLessThan(100); // Total under 100ms
    });

    test('date formatting should be performant', () => {
      const start = Date.now();
      const iterations = 1000;
      const testDate = new Date('2024-06-29T10:30:00Z');
      
      for (let i = 0; i < iterations; i++) {
        formatSEADate(testDate);
        formatSEATime(testDate);
        convertToSEATime(testDate);
      }
      
      const duration = Date.now() - start;
      const avgTime = duration / iterations;
      
      // Date formatting should be reasonable (< 1ms per operation)
      expect(avgTime).toBeLessThan(1);
      expect(duration).toBeLessThan(1000); // Total under 1 second
    });
  });

  describe('Validation Performance', () => {
    test('character name validation should be fast', () => {
      const validNames = ['TestChar', 'Player123', 'SEAHero', 'MapleUser'];
      const invalidNames = ['', 'A', '한국이름', 'Test@'];
      
      const start = Date.now();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        validNames.forEach(name => {
          try { validateCharacterName(name); } catch {}
        });
        invalidNames.forEach(name => {
          try { validateCharacterName(name); } catch {}
        });
      }
      
      const duration = Date.now() - start;
      const avgTime = duration / (iterations * 8); // 8 validations per iteration
      
      // Validation should be reasonably fast (< 0.01ms per operation)
      expect(avgTime).toBeLessThan(0.01);
      expect(duration).toBeLessThan(50); // Total under 50ms
    });
  });

  describe('Cache Performance', () => {
    test('cache operations should be performant', () => {
      const cache = new MemoryCache();
      const start = Date.now();
      const operations = 1000;
      
      // Test set operations
      for (let i = 0; i < operations; i++) {
        cache.set(`key-${i}`, { data: `value-${i}` });
      }
      
      // Test get operations
      for (let i = 0; i < operations; i++) {
        cache.get(`key-${i}`);
      }
      
      // Test delete operations
      for (let i = 0; i < operations / 2; i++) {
        cache.delete(`key-${i}`);
      }
      
      const duration = Date.now() - start;
      const avgTime = duration / (operations * 2.5); // 2.5 operations per key on average
      
      // Cache operations should be very fast
      expect(avgTime).toBeLessThan(0.01);
      expect(duration).toBeLessThan(25); // Total under 25ms
      expect(cache.size()).toBe(operations / 2); // Half the items remain
    });

    test('cache key generation should be efficient', () => {
      const start = Date.now();
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        MemoryCache.generateOcidCacheKey(`Character${i}`);
      }
      
      const duration = Date.now() - start;
      const avgTime = duration / iterations;
      
      // Key generation should be very fast
      expect(avgTime).toBeLessThan(0.001);
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Memory Usage', () => {
    test('large number formatting should not cause memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeNumbers = [];
      
      // Generate and format many large numbers
      for (let i = 0; i < 10000; i++) {
        const num = Math.floor(Math.random() * 1000000000);
        largeNumbers.push(formatSEANumber(num));
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (< 10MB for 10k formatted strings)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      expect(largeNumbers.length).toBe(10000);
    });

    test('cache should not leak memory on frequent updates', () => {
      const cache = new MemoryCache();
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate frequent cache updates
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 1000; i++) {
          cache.set(`temp-key-${i}`, { cycle, data: `value-${i}` });
        }
        // Clear cache each cycle
        cache.clear();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory should not increase significantly after clearing
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // < 5MB
      expect(cache.size()).toBe(0);
    });
  });

  describe('Scalability Tests', () => {
    test('concurrent validation operations should not block', async () => {
      const start = Date.now();
      const concurrentOps = 100;
      
      const promises = Array.from({ length: concurrentOps }, async (_, i) => {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            try {
              validateCharacterName(`Player${i}`);
              validateWorldName('Aquila');
            } catch {}
            resolve();
          }, Math.random() * 10);
        });
      });
      
      await Promise.all(promises);
      
      const duration = Date.now() - start;
      
      // Should complete all operations reasonably quickly despite concurrency
      expect(duration).toBeLessThan(100); // Under 100ms
    });

    test('multiple cache instances should not interfere', () => {
      const cache1 = new MemoryCache();
      const cache2 = new MemoryCache();
      const start = Date.now();
      
      // Parallel operations on different caches
      for (let i = 0; i < 1000; i++) {
        cache1.set(`cache1-${i}`, { source: 'cache1', value: i });
        cache2.set(`cache2-${i}`, { source: 'cache2', value: i * 2 });
      }
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(50);
      expect(cache1.size()).toBe(1000);
      expect(cache2.size()).toBe(1000);
      
      // Verify data integrity
      expect(cache1.get('cache1-500')).toEqual({ source: 'cache1', value: 500 });
      expect(cache2.get('cache2-500')).toEqual({ source: 'cache2', value: 1000 });
    });
  });
});