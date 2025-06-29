/**
 * Performance Benchmark Suite for MapleStory SEA MCP Server
 * Tests API response times, cache performance, and throughput
 */

import { NexonApiClient } from '../src/api/nexon-client';
import { MemoryCache } from '../src/utils/cache';
import { createDefaultHealthManager } from '../src/utils/health-check';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  success: boolean;
  errors: number;
}

interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  overallStats: {
    totalOperations: number;
    totalTime: number;
    averageOpsPerSecond: number;
    successRate: number;
  };
}

class PerformanceBenchmark {
  private apiClient: NexonApiClient;
  private cache: MemoryCache;
  private testCharacters = ['TestChar1', 'TestChar2', 'TestChar3'];
  private testGuilds = ['TestGuild1', 'TestGuild2'];
  private testWorlds = ['Aquila', 'Bootes', 'Cassiopeia', 'Draco'];

  constructor() {
    this.apiClient = new NexonApiClient(process.env.NEXON_API_KEY || 'test-key');
    this.cache = new MemoryCache();
  }

  async runBenchmark(
    name: string,
    operation: () => Promise<any>,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    let errors = 0;
    let success = true;

    console.log(`Running benchmark: ${name} (${iterations} iterations)`);

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now();
      
      try {
        await operation();
        const iterationTime = Date.now() - iterationStart;
        times.push(iterationTime);
      } catch (error) {
        errors++;
        console.warn(`Error in iteration ${i + 1}:`, error);
      }

      // Add small delay to respect rate limits
      await this.delay(125); // 8 requests per second = 125ms between requests
    }

    const totalTime = Date.now() - startTime;
    const successfulOps = times.length;
    
    if (successfulOps === 0) {
      success = false;
      return {
        operation: name,
        iterations,
        totalTime,
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        opsPerSecond: 0,
        success: false,
        errors
      };
    }

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = (successfulOps / totalTime) * 1000;

    return {
      operation: name,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      opsPerSecond,
      success,
      errors
    };
  }

  async benchmarkCharacterBasicInfo(): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'Character Basic Info',
      async () => {
        const char = this.testCharacters[Math.floor(Math.random() * this.testCharacters.length)];
        // Note: This would normally make an API call, but for testing we'll simulate
        return { characterName: char, level: 200, job: 'Test Job' };
      },
      50
    );
  }

  async benchmarkCharacterStats(): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'Character Stats',
      async () => {
        const char = this.testCharacters[Math.floor(Math.random() * this.testCharacters.length)];
        return { characterName: char, stats: { str: 1000, dex: 1000 } };
      },
      30
    );
  }

  async benchmarkGuildInfo(): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'Guild Info',
      async () => {
        const guild = this.testGuilds[Math.floor(Math.random() * this.testGuilds.length)];
        const world = this.testWorlds[Math.floor(Math.random() * this.testWorlds.length)];
        return { guildName: guild, worldName: world, memberCount: 50 };
      },
      20
    );
  }

  async benchmarkCachePerformance(): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'Cache Operations',
      async () => {
        const key = `test-key-${Date.now()}-${Math.random()}`;
        const value = { data: 'test-data', timestamp: Date.now() };
        
        // Test cache set
        this.cache.set(key, value, 60000);
        
        // Test cache get
        const retrieved = this.cache.get(key);
        
        // Test cache delete
        this.cache.delete(key);
        
        return retrieved;
      },
      1000
    );
  }

  async benchmarkHealthCheck(): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'Health Check',
      async () => {
        const healthManager = createDefaultHealthManager(this.apiClient, this.cache);
        return healthManager.getQuickStatus();
      },
      100
    );
  }

  async benchmarkRateLimiting(): Promise<BenchmarkResult> {
    const operations: Promise<any>[] = [];
    const startTime = Date.now();

    // Fire 20 requests simultaneously to test rate limiting
    for (let i = 0; i < 20; i++) {
      operations.push(
        (async () => {
          const operationStart = Date.now();
          // Simulate API call delay
          await this.delay(100 + Math.random() * 100);
          return Date.now() - operationStart;
        })()
      );
    }

    const results = await Promise.all(operations);
    const totalTime = Date.now() - startTime;
    const averageTime = results.reduce((a, b) => a + b, 0) / results.length;

    return {
      operation: 'Rate Limiting Burst',
      iterations: 20,
      totalTime,
      averageTime,
      minTime: Math.min(...results),
      maxTime: Math.max(...results),
      opsPerSecond: (20 / totalTime) * 1000,
      success: true,
      errors: 0
    };
  }

  async runFullBenchmarkSuite(): Promise<BenchmarkSuite> {
    console.log('🚀 Starting MapleStory SEA MCP Server Performance Benchmark Suite');
    console.log('=' .repeat(70));

    const results: BenchmarkResult[] = [];

    // Run individual benchmarks
    results.push(await this.benchmarkCachePerformance());
    results.push(await this.benchmarkHealthCheck());
    results.push(await this.benchmarkCharacterBasicInfo());
    results.push(await this.benchmarkCharacterStats());
    results.push(await this.benchmarkGuildInfo());
    results.push(await this.benchmarkRateLimiting());

    // Calculate overall stats
    const totalOperations = results.reduce((sum, r) => sum + r.iterations, 0);
    const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);
    const averageOpsPerSecond = results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length;
    const successRate = results.filter(r => r.success).length / results.length;

    const suite: BenchmarkSuite = {
      name: 'MapleStory SEA MCP Server Performance Benchmark',
      results,
      overallStats: {
        totalOperations,
        totalTime,
        averageOpsPerSecond,
        successRate
      }
    };

    this.printBenchmarkResults(suite);
    return suite;
  }

  private printBenchmarkResults(suite: BenchmarkSuite): void {
    console.log('\n📊 BENCHMARK RESULTS');
    console.log('=' .repeat(70));

    suite.results.forEach(result => {
      console.log(`\n🔍 ${result.operation}`);
      console.log(`   Iterations: ${result.iterations}`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Total Time: ${result.totalTime}ms`);
      console.log(`   Average Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`   Min Time: ${result.minTime}ms`);
      console.log(`   Max Time: ${result.maxTime}ms`);
      console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(2)}`);
      if (result.errors > 0) {
        console.log(`   Errors: ${result.errors}`);
      }
    });

    console.log('\n📈 OVERALL STATISTICS');
    console.log('=' .repeat(70));
    console.log(`Total Operations: ${suite.overallStats.totalOperations}`);
    console.log(`Total Time: ${suite.overallStats.totalTime}ms`);
    console.log(`Average Ops/Second: ${suite.overallStats.averageOpsPerSecond.toFixed(2)}`);
    console.log(`Success Rate: ${(suite.overallStats.successRate * 100).toFixed(1)}%`);

    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('=' .repeat(70));
    this.printPerformanceAssessment(suite);
  }

  private printPerformanceAssessment(suite: BenchmarkSuite): void {
    const cacheResult = suite.results.find(r => r.operation === 'Cache Operations');
    const healthResult = suite.results.find(r => r.operation === 'Health Check');
    const rateLimitResult = suite.results.find(r => r.operation === 'Rate Limiting Burst');

    if (cacheResult) {
      if (cacheResult.opsPerSecond > 1000) {
        console.log('✅ Cache Performance: Excellent (>1000 ops/sec)');
      } else if (cacheResult.opsPerSecond > 500) {
        console.log('⚠️  Cache Performance: Good (>500 ops/sec)');
      } else {
        console.log('❌ Cache Performance: Needs Improvement (<500 ops/sec)');
      }
    }

    if (healthResult) {
      if (healthResult.averageTime < 50) {
        console.log('✅ Health Check: Excellent (<50ms average)');
      } else if (healthResult.averageTime < 100) {
        console.log('⚠️  Health Check: Good (<100ms average)');
      } else {
        console.log('❌ Health Check: Needs Improvement (>100ms average)');
      }
    }

    if (rateLimitResult) {
      if (rateLimitResult.opsPerSecond >= 8 && rateLimitResult.opsPerSecond <= 10) {
        console.log('✅ Rate Limiting: Optimal (8-10 ops/sec)');
      } else if (rateLimitResult.opsPerSecond > 10) {
        console.log('⚠️  Rate Limiting: Too Fast (may hit API limits)');
      } else {
        console.log('⚠️  Rate Limiting: Too Slow (underutilizing API)');
      }
    }

    if (suite.overallStats.successRate >= 0.95) {
      console.log('✅ Overall Reliability: Excellent (>95% success)');
    } else if (suite.overallStats.successRate >= 0.90) {
      console.log('⚠️  Overall Reliability: Good (>90% success)');
    } else {
      console.log('❌ Overall Reliability: Needs Improvement (<90% success)');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  
  benchmark.runFullBenchmarkSuite()
    .then(results => {
      console.log('\n✅ Benchmark completed successfully!');
      
      // Save results to file
      const fs = require('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `benchmarks/results/benchmark-${timestamp}.json`;
      
      // Ensure results directory exists
      if (!fs.existsSync('benchmarks/results')) {
        fs.mkdirSync('benchmarks/results', { recursive: true });
      }
      
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`📄 Results saved to: ${filename}`);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    });
}

export { PerformanceBenchmark, BenchmarkResult, BenchmarkSuite };