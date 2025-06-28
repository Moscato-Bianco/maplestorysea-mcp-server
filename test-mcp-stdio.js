#!/usr/bin/env node

/**
 * Test MCP server in stdio mode (as Claude Desktop would use it)
 */

const { spawn } = require('child_process');
const readline = require('readline');

function testMcpStdio() {
  console.log('🧪 Testing MCP Server in STDIO mode...\n');

  // Set environment variable for API key
  const env = {
    ...process.env,
    NEXON_API_KEY: 'test_86bd7da053eab9a9328c1008c8c2c1a75b82a506727038e778a8ad5122dc6633efe8d04e6d233bd35cf2fabdeb93fb0d'
  };

  // Start the MCP server
  const server = spawn('node', ['dist/index.js'], { 
    stdio: ['pipe', 'pipe', 'pipe'],
    env: env
  });

  // Set up readline for input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let initialized = false;

  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📤 Server output:', output);

    // Look for initialization message
    if (output.includes('capabilities') || output.includes('tools')) {
      initialized = true;
      console.log('✅ Server appears to be initialized!');
      
      // Send a test request
      setTimeout(() => {
        console.log('\n📝 Sending test request...');
        const testRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        };
        server.stdin.write(JSON.stringify(testRequest) + '\n');
      }, 1000);
    }
  });

  server.stderr.on('data', (data) => {
    console.log('📤 Server error:', data.toString());
  });

  server.on('close', (code) => {
    console.log(`\n🏁 Server process exited with code ${code}`);
    rl.close();
    process.exit(code);
  });

  server.on('error', (err) => {
    console.error('💥 Failed to start server:', err);
    rl.close();
    process.exit(1);
  });

  // Send initial handshake
  setTimeout(() => {
    console.log('🤝 Sending initial handshake...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };
    server.stdin.write(JSON.stringify(initRequest) + '\n');
  }, 500);

  // Timeout after 10 seconds
  setTimeout(() => {
    if (!initialized) {
      console.log('⏰ Test timed out - server may not be responding properly');
      server.kill();
    }
  }, 10000);

  console.log('🚀 Starting MCP server...');
}

testMcpStdio();