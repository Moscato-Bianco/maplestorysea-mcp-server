# Best Practices and Rate Limiting Guide

Comprehensive guide for optimal usage of MapleStory SEA MCP Server including rate limiting, performance optimization, and production best practices.

## Table of Contents
- [Rate Limiting](#rate-limiting)
- [Performance Optimization](#performance-optimization)
- [API Usage Best Practices](#api-usage-best-practices)
- [Error Handling](#error-handling)
- [Caching Strategies](#caching-strategies)
- [Security Considerations](#security-considerations)
- [Production Deployment](#production-deployment)
- [Monitoring and Logging](#monitoring-and-logging)

## Rate Limiting

### Understanding SEA API Limits

The MapleStory SEA API implements strict rate limiting to ensure service stability:

```typescript
// Current SEA-optimized limits
{
  requestsPerSecond: 10,        // Conservative for stability
  requestsPerMinute: 500,       // Daily quota management
  burstLimit: 15,              // Handle traffic spikes
  retryDelay: 1500,            // Base delay between retries
  maxRetryDelay: 45000,        // Maximum retry delay
  circuitBreakerThreshold: 10   // Failures before circuit break
}
```

### Rate Limit Headers

Monitor these headers in API responses:
```typescript
{
  'x-ratelimit-limit': '500',           // Requests per minute
  'x-ratelimit-remaining': '487',       // Remaining requests
  'x-ratelimit-reset': '1640995200',    // Reset timestamp
  'x-ratelimit-retry-after': '60'       // Seconds to wait
}
```

### Implementing Backoff Strategies

#### Exponential Backoff with Jitter
```typescript
function calculateRetryDelay(attempt: number): number {
  const baseDelay = 1500; // 1.5 seconds
  const maxDelay = 45000; // 45 seconds
  const jitterFactor = 0.1; // 10% jitter
  
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = exponentialDelay * jitterFactor * Math.random();
  
  return Math.min(exponentialDelay + jitter, maxDelay);
}
```

#### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private threshold = 10;
  private timeout = 60000; // 1 minute
  
  canExecute(): boolean {
    if (this.failures < this.threshold) return true;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure > this.timeout) {
      this.failures = 0; // Reset circuit breaker
      return true;
    }
    
    return false;
  }
}
```

### Rate Limiting by Endpoint Type

Different endpoints have different performance characteristics:

#### Character Endpoints
```typescript
// Lightweight operations (fast)
get_character_basic_info: {
  timeout: 10000,      // 10 seconds
  priority: 'high',
  cacheTime: 1800000   // 30 minutes
}

// Heavy operations (slower)
get_character_analysis: {
  timeout: 25000,      // 25 seconds
  priority: 'low',
  cacheTime: 900000    // 15 minutes
}
```

#### Ranking Endpoints
```typescript
// Rankings are the slowest operations
get_overall_ranking: {
  timeout: 30000,           // 30 seconds
  requestsPerSecond: 3,     // More conservative
  priority: 'lowest',
  cacheTime: 900000         // 15 minutes
}
```

## Performance Optimization

### Optimal Configuration

#### Production Settings
```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_key_here",
        "MAX_CONCURRENT_REQUESTS": "8",
        "REQUEST_TIMEOUT": "20000",
        "CACHE_TTL_MULTIPLIER": "1.2",
        "LOG_LEVEL": "warn",
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Development Settings
```json
{
  "env": {
    "NEXON_API_KEY": "your_key_here",
    "MAX_CONCURRENT_REQUESTS": "3",
    "REQUEST_TIMEOUT": "15000",
    "CACHE_TTL_MULTIPLIER": "0.5",
    "LOG_LEVEL": "debug",
    "NODE_ENV": "development"
  }
}
```

### Query Optimization

#### Efficient Query Patterns
```typescript
// ✅ Good: Batch related queries
"Get full character information for AquilaHero including equipment and stats"

// ❌ Inefficient: Multiple separate queries
"Get basic info for AquilaHero"
"Get stats for AquilaHero"  
"Get equipment for AquilaHero"
```

#### Use Appropriate Tools
```typescript
// ✅ For complete analysis
get_character_full_info

// ✅ For specific data only
get_character_basic_info

// ✅ For equipment focus
get_character_equipment

// ❌ Avoid over-querying
// Don't use get_character_analysis if you only need basic stats
```

### Memory Management

#### Cache Size Optimization
```typescript
{
  // Adjust cache based on usage patterns
  CACHE_TTL_MULTIPLIER: "1.0",  // Default
  
  // For high-volume usage
  CACHE_TTL_MULTIPLIER: "1.5",  // Longer caching
  
  // For development/testing
  CACHE_TTL_MULTIPLIER: "0.2"   // Shorter caching
}
```

## API Usage Best Practices

### 1. Character Name Validation

Always validate character names before API calls:
```typescript
function validateCharacterName(name: string): boolean {
  // Length check (2-13 characters)
  if (name.length < 2 || name.length > 13) return false;
  
  // English alphanumeric only
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(name);
}

// ✅ Valid names
validateCharacterName("AquilaHero123"); // true
validateCharacterName("Player");        // true

// ❌ Invalid names  
validateCharacterName("Hero Player");   // false (space)
validateCharacterName("영웅");           // false (Korean)
validateCharacterName("Hero!");         // false (special char)
```

### 2. World Name Validation

Ensure world names are valid for SEA:
```typescript
const SEA_WORLDS = ["Aquila", "Bootes", "Cassiopeia", "Delphinus"];

function validateWorldName(world: string): boolean {
  return SEA_WORLDS.includes(world);
}
```

### 3. Date Handling

Use proper date formats and timezone awareness:
```typescript
function formatSEADate(date: Date): string {
  // Convert to Singapore timezone
  const seaDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  return seaDate.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ✅ Correct usage
const today = formatSEADate(new Date());
const yesterday = formatSEADate(new Date(Date.now() - 24 * 60 * 60 * 1000));
```

### 4. Job Class Handling

Use exact job class names:
```typescript
// ✅ Correct job class names
const validJobClasses = [
  "Hero",
  "Arch Mage (Fire, Poison)",
  "Night Lord",
  "Dawn Warrior"
];

// ❌ Common mistakes to avoid
const invalidJobClasses = [
  "hero",                          // Wrong case
  "Arch Mage (Fire/Poison)",      // Wrong punctuation
  "Arch Mage Fire Poison",        // Missing parentheses
  "Fire Poison Arch Mage"         // Wrong order
];
```

## Error Handling

### Graceful Degradation

Implement proper error handling with fallbacks:
```typescript
class APIErrorHandler {
  async handleCharacterQuery(characterName: string) {
    try {
      // Primary attempt
      return await this.getCharacterFullInfo(characterName);
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        // Wait and retry
        await this.wait(error.retryAfter * 1000);
        return await this.getCharacterBasicInfo(characterName);
      } else if (error.code === 'CHARACTER_NOT_FOUND') {
        // Try alternative search
        return await this.searchSimilarCharacters(characterName);
      }
      throw error;
    }
  }
}
```

### Error Recovery Strategies

#### Rate Limit Recovery
```typescript
async function handleRateLimit(error: RateLimitError) {
  const waitTime = error.retryAfter || 60; // seconds
  console.log(`Rate limited. Waiting ${waitTime} seconds...`);
  await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  // Retry with reduced concurrency
}
```

#### Network Error Recovery
```typescript
async function handleNetworkError(error: NetworkError, attempt: number) {
  if (attempt >= 3) throw error;
  
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
  console.log(`Network error. Retrying in ${delay}ms...`);
  await new Promise(resolve => setTimeout(resolve, delay));
  // Retry the request
}
```

## Caching Strategies

### Smart Cache TTL

Optimize cache durations based on data volatility:
```typescript
const CACHE_STRATEGIES = {
  // Static data (changes rarely)
  CHARACTER_OCID: 7200000,      // 2 hours
  JOB_CLASS_INFO: 86400000,     // 24 hours
  
  // Semi-static data
  CHARACTER_BASIC: 1800000,     // 30 minutes
  UNION_INFO: 1800000,          // 30 minutes
  GUILD_BASIC: 3600000,         // 1 hour
  
  // Dynamic data
  CHARACTER_STATS: 900000,      // 15 minutes
  CHARACTER_EQUIPMENT: 600000,  // 10 minutes
  RANKINGS: 900000,             // 15 minutes
  
  // Real-time data
  RANKING_SEARCH: 300000        // 5 minutes
};
```

### Cache Invalidation

Implement intelligent cache invalidation:
```typescript
class SmartCache {
  async invalidateCharacterData(characterName: string) {
    // Invalidate all character-related cache entries
    const keys = [
      `character:basic:${characterName}`,
      `character:stats:${characterName}`,
      `character:equipment:${characterName}`,
      `character:analysis:${characterName}`
    ];
    
    await Promise.all(keys.map(key => this.cache.delete(key)));
  }
}
```

## Security Considerations

### API Key Management

#### Environment Variables
```bash
# ✅ Store in environment variables
export NEXON_API_KEY="your_actual_api_key_here"

# ❌ Never hardcode in configuration
{
  "NEXON_API_KEY": "NX-123456789abcdef..." // Don't do this
}
```

#### Key Rotation
```typescript
// Implement API key rotation
class APIKeyManager {
  private primaryKey: string;
  private backupKey: string;
  private keyIndex = 0;
  
  getCurrentKey(): string {
    return this.keyIndex === 0 ? this.primaryKey : this.backupKey;
  }
  
  rotateKey() {
    this.keyIndex = (this.keyIndex + 1) % 2;
  }
}
```

### Request Sanitization

Always sanitize user input:
```typescript
function sanitizeCharacterName(name: string): string {
  // Remove dangerous characters
  return name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 13);
}

function sanitizeWorldName(world: string): string {
  const validWorlds = ["Aquila", "Bootes", "Cassiopeia", "Delphinus"];
  return validWorlds.includes(world) ? world : "Aquila";
}
```

## Production Deployment

### Health Monitoring

Implement comprehensive health checks:
```typescript
class HealthMonitor {
  async checkSystemHealth() {
    const checks = await Promise.all([
      this.checkAPIConnectivity(),
      this.checkCacheHealth(),
      this.checkMemoryUsage(),
      this.checkResponseTimes()
    ]);
    
    return {
      status: checks.every(c => c.healthy) ? 'healthy' : 'degraded',
      checks: checks
    };
  }
}
```

### Load Balancing

For high-traffic scenarios:
```typescript
class LoadBalancer {
  private servers = [
    { url: 'server1', weight: 3, healthy: true },
    { url: 'server2', weight: 2, healthy: true },
    { url: 'server3', weight: 1, healthy: true }
  ];
  
  selectServer() {
    const healthyServers = this.servers.filter(s => s.healthy);
    // Implement weighted round-robin
    return this.weightedSelection(healthyServers);
  }
}
```

### Resource Limits

Set appropriate resource limits:
```json
{
  "env": {
    "NODE_MAX_OLD_SPACE_SIZE": "2048",    // 2GB memory limit
    "UV_THREADPOOL_SIZE": "16",           // Thread pool size
    "MAX_CONCURRENT_REQUESTS": "8",       // Request concurrency
    "REQUEST_TIMEOUT": "20000",           // 20 second timeout
    "CACHE_MAX_SIZE": "1000"              // Cache size limit
  }
}
```

## Monitoring and Logging

### Structured Logging

Use structured logging for better monitoring:
```typescript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'maplestory-sea-mcp',
    version: '2.0.0'
  }
});

// Log performance metrics
logger.info('API request completed', {
  endpoint: '/character/basic',
  characterName: 'AquilaHero',
  responseTime: 1250,
  cacheHit: false,
  statusCode: 200
});
```

### Metrics Collection

Track important metrics:
```typescript
class MetricsCollector {
  private metrics = {
    requestsPerMinute: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    activeConnections: 0
  };
  
  recordRequest(duration: number, cached: boolean, error?: Error) {
    this.metrics.requestsPerMinute++;
    this.updateAverageResponseTime(duration);
    if (cached) this.updateCacheHitRate();
    if (error) this.updateErrorRate();
  }
}
```

### Alerting

Set up alerts for critical issues:
```typescript
const ALERT_THRESHOLDS = {
  errorRate: 0.05,           // 5% error rate
  averageResponseTime: 5000, // 5 seconds
  memoryUsage: 0.85,         // 85% memory usage
  cacheHitRate: 0.60         // 60% cache hit rate
};

class AlertManager {
  checkThresholds(metrics: Metrics) {
    if (metrics.errorRate > ALERT_THRESHOLDS.errorRate) {
      this.sendAlert('High error rate detected');
    }
    // ... other threshold checks
  }
}
```

### Performance Baselines

Establish performance baselines:
```typescript
const PERFORMANCE_BASELINES = {
  get_character_basic_info: {
    p50: 800,    // 50th percentile: 800ms
    p95: 2000,   // 95th percentile: 2000ms
    p99: 5000    // 99th percentile: 5000ms
  },
  get_character_analysis: {
    p50: 3000,
    p95: 8000,
    p99: 15000
  },
  get_overall_ranking: {
    p50: 5000,
    p95: 15000,
    p99: 30000
  }
};
```

## Summary Checklist

### ✅ Rate Limiting Best Practices
- [ ] Implement exponential backoff with jitter
- [ ] Use circuit breaker pattern for reliability
- [ ] Monitor rate limit headers
- [ ] Set appropriate timeout values
- [ ] Handle burst traffic gracefully

### ✅ Performance Optimization
- [ ] Use appropriate cache TTL settings
- [ ] Batch related queries when possible
- [ ] Choose the right tool for each task
- [ ] Monitor memory usage
- [ ] Implement connection pooling

### ✅ Error Handling
- [ ] Graceful degradation strategies
- [ ] Proper retry mechanisms
- [ ] User-friendly error messages
- [ ] Fallback options for failures
- [ ] Comprehensive error logging

### ✅ Security
- [ ] Secure API key storage
- [ ] Input sanitization
- [ ] Request validation
- [ ] Access control measures
- [ ] Regular security audits

### ✅ Production Readiness
- [ ] Health monitoring setup
- [ ] Structured logging implementation
- [ ] Metrics collection
- [ ] Alerting system
- [ ] Performance baseline establishment

Following these best practices will ensure optimal performance, reliability, and maintainability of your MapleStory SEA MCP Server integration.