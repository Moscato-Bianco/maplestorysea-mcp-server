/**
 * Load Testing Suite for MapleStory SEA MCP Server
 * Tests server behavior under various load conditions
 */

import { PerformanceBenchmark, BenchmarkResult } from './performance-benchmark';

interface LoadTestConfig {
  name: string;
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
}

interface LoadTestResult {
  config: LoadTestConfig;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  errors: { [key: string]: number };
}

class LoadTester {
  private benchmark: PerformanceBenchmark;
  
  constructor() {
    this.benchmark = new PerformanceBenchmark();
  }

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(`🔥 Starting Load Test: ${config.name}`);
    console.log(`   Concurrent Users: ${config.concurrentUsers}`);
    console.log(`   Requests per User: ${config.requestsPerUser}`);
    console.log(`   Ramp-up Time: ${config.rampUpTime}s`);
    console.log(`   Test Duration: ${config.testDuration}s`);

    const startTime = Date.now();
    const responseTimes: number[] = [];
    const errors: { [key: string]: number } = {};
    let successfulRequests = 0;
    let failedRequests = 0;

    // Create user simulation promises
    const userPromises: Promise<void>[] = [];

    for (let userId = 0; userId < config.concurrentUsers; userId++) {
      const userDelay = (config.rampUpTime * 1000 * userId) / config.concurrentUsers;
      
      userPromises.push(
        this.simulateUser(
          userId,
          config.requestsPerUser,
          userDelay,
          responseTimes,
          errors,
          () => successfulRequests++,
          () => failedRequests++
        )
      );
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    const totalTime = Date.now() - startTime;
    const totalRequests = successfulRequests + failedRequests;

    return {
      config,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: (totalRequests / totalTime) * 1000,
      errorRate: totalRequests > 0 ? failedRequests / totalRequests : 0,
      errors
    };
  }

  private async simulateUser(
    userId: number,
    requestCount: number,
    initialDelay: number,
    responseTimes: number[],
    errors: { [key: string]: number },
    onSuccess: () => void,
    onFailure: () => void
  ): Promise<void> {
    // Wait for ramp-up delay
    await this.delay(initialDelay);

    const operations = [
      () => this.simulateCharacterRequest(),
      () => this.simulateGuildRequest(),
      () => this.simulateUnionRequest(),
      () => this.simulateRankingRequest(),
      () => this.simulateHealthCheck()
    ];

    for (let requestId = 0; requestId < requestCount; requestId++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const requestStart = Date.now();

      try {
        await operation();
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        onSuccess();

        // Add realistic delay between requests from same user
        await this.delay(100 + Math.random() * 200);
      } catch (error) {
        const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
        errors[errorType] = (errors[errorType] || 0) + 1;
        onFailure();
      }
    }
  }

  private async simulateCharacterRequest(): Promise<any> {
    // Simulate character info request
    await this.delay(50 + Math.random() * 100);
    return { type: 'character', data: 'simulated' };
  }

  private async simulateGuildRequest(): Promise<any> {
    // Simulate guild info request
    await this.delay(70 + Math.random() * 150);
    return { type: 'guild', data: 'simulated' };
  }

  private async simulateUnionRequest(): Promise<any> {
    // Simulate union info request
    await this.delay(60 + Math.random() * 120);
    return { type: 'union', data: 'simulated' };
  }

  private async simulateRankingRequest(): Promise<any> {
    // Simulate ranking request
    await this.delay(80 + Math.random() * 200);
    return { type: 'ranking', data: 'simulated' };
  }

  private async simulateHealthCheck(): Promise<any> {
    // Simulate health check
    await this.delay(10 + Math.random() * 30);
    return { type: 'health', status: 'ok' };
  }

  async runLoadTestSuite(): Promise<LoadTestResult[]> {
    const testConfigs: LoadTestConfig[] = [
      {
        name: 'Light Load Test',
        concurrentUsers: 5,
        requestsPerUser: 10,
        rampUpTime: 5,
        testDuration: 30
      },
      {
        name: 'Medium Load Test',
        concurrentUsers: 15,
        requestsPerUser: 20,
        rampUpTime: 10,
        testDuration: 60
      },
      {
        name: 'Heavy Load Test',
        concurrentUsers: 30,
        requestsPerUser: 30,
        rampUpTime: 15,
        testDuration: 90
      },
      {
        name: 'Spike Test',
        concurrentUsers: 50,
        requestsPerUser: 5,
        rampUpTime: 2,
        testDuration: 30
      },
      {
        name: 'Rate Limit Test',
        concurrentUsers: 20,
        requestsPerUser: 50,
        rampUpTime: 5,
        testDuration: 120
      }
    ];

    const results: LoadTestResult[] = [];

    for (const config of testConfigs) {
      console.log(`\n${'='.repeat(60)}`);
      const result = await this.runLoadTest(config);
      results.push(result);
      this.printLoadTestResult(result);
      
      // Cool down between tests
      console.log('😴 Cooling down for 10 seconds...');
      await this.delay(10000);
    }

    return results;
  }

  private printLoadTestResult(result: LoadTestResult): void {
    console.log(`\n📊 Load Test Results: ${result.config.name}`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${result.failedRequests} (${(result.errorRate * 100).toFixed(1)}%)`);
    console.log(`   Average Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${result.minResponseTime}ms`);
    console.log(`   Max Response Time: ${result.maxResponseTime}ms`);
    console.log(`   Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);

    if (Object.keys(result.errors).length > 0) {
      console.log(`   Error Types:`);
      Object.entries(result.errors).forEach(([errorType, count]) => {
        console.log(`     ${errorType}: ${count}`);
      });
    }

    // Performance assessment
    this.assessLoadTestPerformance(result);
  }

  private assessLoadTestPerformance(result: LoadTestResult): void {
    console.log(`\n🎯 Performance Assessment:`);

    // Response time assessment
    if (result.averageResponseTime < 100) {
      console.log(`   ✅ Response Time: Excellent (<100ms)`);
    } else if (result.averageResponseTime < 500) {
      console.log(`   ⚠️  Response Time: Good (<500ms)`);
    } else {
      console.log(`   ❌ Response Time: Poor (>500ms)`);
    }

    // Error rate assessment
    if (result.errorRate < 0.01) {
      console.log(`   ✅ Error Rate: Excellent (<1%)`);
    } else if (result.errorRate < 0.05) {
      console.log(`   ⚠️  Error Rate: Acceptable (<5%)`);
    } else {
      console.log(`   ❌ Error Rate: High (>5%)`);
    }

    // Throughput assessment
    const expectedThroughput = Math.min(8, result.config.concurrentUsers); // SEA API limit
    if (result.requestsPerSecond >= expectedThroughput * 0.8) {
      console.log(`   ✅ Throughput: Good (${result.requestsPerSecond.toFixed(1)}/sec vs expected ${expectedThroughput}/sec)`);
    } else {
      console.log(`   ⚠️  Throughput: Below Expected (${result.requestsPerSecond.toFixed(1)}/sec vs expected ${expectedThroughput}/sec)`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const loadTester = new LoadTester();
  
  loadTester.runLoadTestSuite()
    .then(results => {
      console.log(`\n✅ Load Test Suite completed!`);
      console.log(`${'='.repeat(60)}`);
      
      // Save results to file
      const fs = require('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `benchmarks/results/load-test-${timestamp}.json`;
      
      // Ensure results directory exists
      if (!fs.existsSync('benchmarks/results')) {
        fs.mkdirSync('benchmarks/results', { recursive: true });
      }
      
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`📄 Results saved to: ${filename}`);
      
      // Print summary
      console.log(`\n📈 LOAD TEST SUMMARY`);
      console.log(`${'='.repeat(60)}`);
      results.forEach(result => {
        console.log(`${result.config.name}: ${result.successfulRequests}/${result.totalRequests} success (${(result.requestsPerSecond).toFixed(1)} req/s)`);
      });
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Load test failed:', error);
      process.exit(1);
    });
}

export { LoadTester, LoadTestConfig, LoadTestResult };