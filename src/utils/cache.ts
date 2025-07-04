/**
 * Simple in-memory cache for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Set a value in the cache with TTL (time to live) in milliseconds
   */
  set<T>(key: string, value: T, ttl: number = 300000): void {
    // Default 5 minutes
    const now = Date.now();

    // Remove expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl,
    });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Generate a cache key for character OCID lookup (SEA API optimized)
   */
  static generateOcidCacheKey(characterName: string): string {
    // SEA API uses English character names only - normalize for consistent caching
    const normalizedName = characterName.trim().toLowerCase().replace(/\s+/g, '');
    return `sea_ocid:${normalizedName}`;
  }

  /**
   * Generate a cache key for character basic info (SEA API optimized)
   */
  static generateCharacterBasicCacheKey(ocid: string, date?: string): string {
    const dateKey = date || 'latest';
    return `sea_char_basic:${ocid}:${dateKey}`;
  }

  /**
   * Generate a cache key for any SEA API endpoint
   */
  static generateApiCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => {
        const value = params[key];
        // Normalize character names for consistent caching
        if (key.includes('character_name') && typeof value === 'string') {
          return `${key}=${value.trim().toLowerCase().replace(/\s+/g, '')}`;
        }
        return `${key}=${value}`;
      })
      .join('&');

    return `sea_api:${endpoint}:${sortedParams}`;
  }
}

// Default cache instance
export const defaultCache = new MemoryCache(1000);
