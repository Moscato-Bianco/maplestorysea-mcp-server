#!/usr/bin/env node

/**
 * Test health check tool specifically
 */

const { spawn } = require('child_process');

function testHealthCheck() {
  console.log('🏥 Testing Health Check Tool...\n');

  const env = {
    ...process.env,
    NEXON_API_KEY: 'test_86bd7da053eab9a9328c1008c8c2c1a75b82a506727038e778a8ad5122dc6633efe8d04e6d233bd35cf2fabdeb93fb0d',
    LOG_LEVEL: 'info'
  };

  const server = spawn('node', ['dist/index.js'], { 
    stdio: ['pipe', 'pipe', 'pipe'],
    env: env
  });

  let responses = [];

  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      try {
        const parsed = JSON.parse(output);
        responses.push(parsed);
        console.log(`📥 Response ${responses.length}:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('📤 Raw output:', output);
      }
    }
  });

  server.stderr.on('data', (data) => {
    console.log('⚠️ Error:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`\n🏁 Test completed with code ${code}`);
    process.exit(code);
  });

  // Send requests in sequence
  setTimeout(() => {
    console.log('🤝 1. Initializing...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };
    server.stdin.write(JSON.stringify(initRequest) + '\n');
  }, 500);

  setTimeout(() => {
    console.log('\n🏥 2. Testing health check...');
    const healthRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'health_check',
        arguments: { detailed: true }
      }
    };
    server.stdin.write(JSON.stringify(healthRequest) + '\n');
  }, 2000);

  setTimeout(() => {
    console.log('\n📊 3. Testing overall ranking...');
    const rankingRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get_overall_ranking',
        arguments: { page: 1 }
      }
    };
    server.stdin.write(JSON.stringify(rankingRequest) + '\n');
  }, 5000);

  // Timeout
  setTimeout(() => {
    console.log('\n⏰ Test timeout reached');
    server.kill();
  }, 15000);
}

testHealthCheck();