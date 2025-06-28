#!/usr/bin/env node

/**
 * Simple test script to check MCP server functionality
 */

const { NexonApiClient } = require('./dist/api/nexon-client');
const { createAllTools } = require('./dist/tools');
const { McpLogger } = require('./dist/utils/logger');

async function testBasicFunctionality() {
  console.log('🧪 Testing MapleStory SEA MCP Server...\n');

  // Test 1: Check if tools can be created
  console.log('1. Testing tool creation...');
  try {
    const tools = createAllTools();
    console.log(`✅ Successfully created ${tools.length} tools`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.log(`❌ Tool creation failed: ${error.message}`);
    return;
  }

  // Test 2: Test API client with and without API key
  console.log('\n2. Testing API client initialization...');
  
  // Test without API key
  try {
    console.log('   Testing without API key...');
    const clientNoKey = new NexonApiClient({ apiKey: '' });
    console.log('   ⚠️ Client created without API key (this should work for testing)');
  } catch (error) {
    console.log(`   ❌ Client creation failed without API key: ${error.message}`);
  }

  // Test with fake API key
  try {
    console.log('   Testing with fake API key...');
    const clientFakeKey = new NexonApiClient({ apiKey: 'test-key-12345' });
    console.log('   ✅ Client created with fake API key');
    
    // Try a health check call
    console.log('   Testing health check call...');
    const result = await clientFakeKey.getOverallRanking(undefined, undefined, undefined, undefined, 1);
    console.log('   ⚠️ Unexpected success with fake API key');
  } catch (error) {
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('apikey is not valid') || errorMsg.includes('unauthorized')) {
      console.log('   ✅ Correctly rejected fake API key');
    } else {
      console.log(`   ❌ Unexpected error: ${errorMsg}`);
    }
  }

  console.log('\n🏁 Basic functionality test completed!');
}

// Test with environment variable if available
async function testWithRealApiKey() {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) {
    console.log('\n💡 To test with real API key, set NEXON_API_KEY environment variable');
    return;
  }

  console.log('\n🔑 Testing with real API key...');
  try {
    const client = new NexonApiClient({ apiKey });
    
    // Test ranking call
    console.log('   Testing ranking API call...');
    const ranking = await client.getOverallRanking(undefined, undefined, undefined, undefined, 1);
    
    if (ranking && ranking.ranking && ranking.ranking.length > 0) {
      console.log(`   ✅ Successfully retrieved ${ranking.ranking.length} ranking entries`);
      console.log(`   📊 Sample: ${ranking.ranking[0]?.character_name} (Level ${ranking.ranking[0]?.character_level})`);
    } else {
      console.log('   ⚠️ API call succeeded but returned empty data');
    }
  } catch (error) {
    console.log(`   ❌ Real API test failed: ${error.message}`);
  }
}

// Run tests
testBasicFunctionality()
  .then(() => testWithRealApiKey())
  .then(() => {
    console.log('\n✨ All tests completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });