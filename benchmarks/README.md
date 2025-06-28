# Performance Benchmarks

Comprehensive performance testing suite for the MapleStory SEA MCP Server.

## Overview

This benchmark suite tests various aspects of the MCP server performance:

- **API Response Times** - Measures response times for different operations
- **Cache Performance** - Tests in-memory cache efficiency
- **Rate Limiting** - Validates rate limiting behavior
- **Load Testing** - Tests server behavior under various load conditions
- **Health Checks** - Monitors system health performance

## Quick Start

### Run All Benchmarks
```bash
# From project root
./benchmarks/run-benchmarks.sh
```

### Run Individual Benchmarks
```bash
# Performance benchmark only
npx ts-node benchmarks/performance-benchmark.ts

# Load testing only
npx ts-node benchmarks/load-test.ts
```

## Benchmark Types

### 1. Performance Benchmark (`performance-benchmark.ts`)

Tests core operations performance:

- **Character Basic Info** - Simulates character data retrieval
- **Character Stats** - Tests detailed stats queries
- **Guild Info** - Measures guild data performance
- **Cache Operations** - Tests cache set/get/delete operations
- **Health Check** - Monitors health check response times
- **Rate Limiting** - Tests rate limiting effectiveness

**Metrics Collected:**
- Average response time
- Min/Max response times
- Operations per second
- Success rate
- Error count

### 2. Load Test (`load-test.ts`)

Tests server behavior under load:

- **Light Load** - 5 concurrent users
- **Medium Load** - 15 concurrent users  
- **Heavy Load** - 30 concurrent users
- **Spike Test** - 50 concurrent users (short burst)
- **Rate Limit Test** - High request volume

**Metrics Collected:**
- Total requests processed
- Success/failure rates
- Response time distribution
- Requests per second
- Error types and frequency

## Environment Setup

### Required Environment Variables
```bash
# Optional: Use real API key for actual testing
NEXON_API_KEY=your_nexon_api_key_here

# Benchmark configuration
NODE_ENV=test
LOG_LEVEL=warn
```

### Benchmark Configuration
```bash
# Performance benchmark iterations
BENCHMARK_ITERATIONS=100

# Load test configuration
MAX_CONCURRENT_USERS=50
TEST_DURATION=120  # seconds
```

## Understanding Results

### Performance Benchmark Results

```json
{
  "operation": "Character Basic Info",
  "iterations": 50,
  "totalTime": 5000,
  "averageTime": 100,
  "minTime": 50,
  "maxTime": 200,
  "opsPerSecond": 10,
  "success": true,
  "errors": 0
}
```

**Performance Thresholds:**
- ✅ **Excellent**: < 50ms average response time
- ⚠️ **Good**: 50-200ms average response time  
- ❌ **Poor**: > 200ms average response time

### Load Test Results

```json
{
  "config": {
    "name": "Medium Load Test",
    "concurrentUsers": 15,
    "requestsPerUser": 20
  },
  "totalRequests": 300,
  "successfulRequests": 295,
  "failedRequests": 5,
  "averageResponseTime": 150,
  "requestsPerSecond": 8.2,
  "errorRate": 0.017
}
```

**Load Test Thresholds:**
- ✅ **Excellent**: < 1% error rate, < 100ms avg response
- ⚠️ **Good**: < 5% error rate, < 500ms avg response
- ❌ **Poor**: > 5% error rate, > 500ms avg response

## Analyzing Results

### Viewing Results
```bash
# List all benchmark results
ls -la benchmarks/results/

# View latest performance benchmark
cat benchmarks/results/benchmark-*.json | jq .

# View latest load test
cat benchmarks/results/load-test-*.json | jq .
```

### Key Metrics to Monitor

1. **Response Time Trends**
   - Monitor average response times over time
   - Look for degradation patterns
   - Compare before/after code changes

2. **Throughput**
   - Target: ~8 requests/second (SEA API limit)
   - Monitor ops/second across different operations
   - Ensure rate limiting is working correctly

3. **Error Rates**
   - Target: < 1% for production workloads
   - Monitor error types and patterns
   - Check for rate limiting violations

4. **Cache Performance**
   - Target: > 1000 cache ops/second
   - Monitor cache hit/miss ratios
   - Validate cache TTL effectiveness

## Benchmark Automation

### Package.json Scripts
Add to your `package.json`:

```json
{
  "scripts": {
    "benchmark": "./benchmarks/run-benchmarks.sh",
    "benchmark:perf": "npx ts-node benchmarks/performance-benchmark.ts",
    "benchmark:load": "npx ts-node benchmarks/load-test.ts"
  }
}
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
name: Performance Benchmarks

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run benchmark:perf
      env:
        NEXON_API_KEY: ${{ secrets.NEXON_API_KEY }}
```

## Customizing Benchmarks

### Adding New Benchmark Operations

1. **Add to Performance Benchmark:**
```typescript
async benchmarkCustomOperation(): Promise<BenchmarkResult> {
  return this.runBenchmark(
    'Custom Operation',
    async () => {
      // Your operation logic here
      return await customOperation();
    },
    iterations
  );
}
```

2. **Add to Load Test:**
```typescript
private async simulateCustomRequest(): Promise<any> {
  // Simulate your operation
  await this.delay(response_time_simulation);
  return { type: 'custom', data: 'simulated' };
}
```

### Modifying Test Configurations

Edit the test configs in `load-test.ts`:

```typescript
const testConfigs: LoadTestConfig[] = [
  {
    name: 'Custom Load Test',
    concurrentUsers: 10,
    requestsPerUser: 20,
    rampUpTime: 5,
    testDuration: 60
  }
];
```

## Performance Optimization Tips

### Based on Benchmark Results

1. **High Response Times**
   - Check network connectivity
   - Optimize API client configuration
   - Review rate limiting settings

2. **Low Throughput**
   - Increase concurrent request limits
   - Optimize caching strategies
   - Review bottlenecks in code

3. **High Error Rates**
   - Check API key validity
   - Review rate limiting compliance
   - Investigate network issues

4. **Poor Cache Performance**
   - Review cache TTL settings
   - Check memory usage
   - Optimize cache key strategies

## Troubleshooting

### Common Issues

1. **"NEXON_API_KEY not set" Warning**
   ```bash
   export NEXON_API_KEY=your_key_here
   ```

2. **TypeScript Compilation Errors**
   ```bash
   npm run build
   ```

3. **Permission Denied on Script**
   ```bash
   chmod +x benchmarks/run-benchmarks.sh
   ```

4. **Out of Memory Errors**
   - Reduce benchmark iterations
   - Lower concurrent users in load tests
   - Check for memory leaks

### Debug Mode

Run benchmarks with detailed logging:

```bash
export LOG_LEVEL=debug
export ENABLE_API_LOGGING=true
npm run benchmark:perf
```

## Contributing

When adding new benchmarks:

1. Follow the existing pattern for benchmark functions
2. Include proper error handling
3. Add meaningful performance thresholds
4. Update this README with new benchmark descriptions
5. Test benchmarks with various configurations

## Results Archive

Benchmark results are automatically saved with timestamps:
- `benchmarks/results/benchmark-YYYY-MM-DD-HH-mm-ss.json`
- `benchmarks/results/load-test-YYYY-MM-DD-HH-mm-ss.json`

Keep historical results to track performance trends over time.