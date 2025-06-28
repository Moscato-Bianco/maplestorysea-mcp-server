#!/bin/bash

# MapleStory SEA MCP Server Benchmark Runner
# Runs comprehensive performance and load testing

set -e

echo "🚀 MapleStory SEA MCP Server Benchmark Suite"
echo "=============================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run benchmarks."
    exit 1
fi

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ NPX is not available. Please install Node.js/npm properly."
    exit 1
fi

# Create results directory
mkdir -p benchmarks/results

# Set default environment variables for benchmarks
export NODE_ENV=test
export LOG_LEVEL=warn

# Check if NEXON_API_KEY is set
if [ -z "$NEXON_API_KEY" ]; then
    echo "⚠️  Warning: NEXON_API_KEY not set. Using mock data for benchmarks."
    export NEXON_API_KEY="benchmark-mock-key"
fi

echo ""
echo "📋 Benchmark Configuration:"
echo "  Environment: $NODE_ENV"
echo "  Log Level: $LOG_LEVEL"
echo "  API Key: $(echo $NEXON_API_KEY | cut -c1-10)..."
echo ""

# Build the project first
echo "🔨 Building project..."
npm run build

# Function to run benchmark with proper error handling
run_benchmark() {
    local benchmark_name="$1"
    local benchmark_file="$2"
    
    echo ""
    echo "▶️  Running $benchmark_name..."
    echo "----------------------------------------"
    
    if npx ts-node "$benchmark_file"; then
        echo "✅ $benchmark_name completed successfully!"
    else
        echo "❌ $benchmark_name failed!"
        return 1
    fi
}

# Run performance benchmarks
run_benchmark "Performance Benchmark" "benchmarks/performance-benchmark.ts"

# Ask user if they want to run load tests (they take longer)
echo ""
read -p "🤔 Do you want to run load tests? They take ~10 minutes (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_benchmark "Load Test Suite" "benchmarks/load-test.ts"
else
    echo "⏭️  Skipping load tests."
fi

# Generate summary report
echo ""
echo "📊 Generating summary report..."

# Count result files
PERF_RESULTS=$(find benchmarks/results -name "benchmark-*.json" | wc -l)
LOAD_RESULTS=$(find benchmarks/results -name "load-test-*.json" | wc -l)

echo ""
echo "✅ Benchmark Suite Complete!"
echo "============================="
echo "Performance Benchmarks: $PERF_RESULTS"
echo "Load Test Results: $LOAD_RESULTS"
echo ""
echo "📁 Results saved in: benchmarks/results/"
echo ""

# List recent result files
echo "📄 Recent benchmark files:"
find benchmarks/results -name "*.json" -type f -exec ls -la {} \; | tail -5

echo ""
echo "🎯 Benchmark Tips:"
echo "  - Run benchmarks regularly to track performance trends"
echo "  - Compare results before/after code changes"
echo "  - Use production-like environment for accurate results"
echo "  - Monitor rate limits when testing with real API keys"
echo ""
echo "📚 For analysis tools and detailed documentation:"
echo "  - Check benchmarks/README.md"
echo "  - View results with: cat benchmarks/results/latest-result.json | jq ."
echo ""

exit 0