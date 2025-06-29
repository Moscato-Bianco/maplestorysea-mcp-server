/**
 * Jest setup file for MapleStory MCP Server tests
 */

import { jest } from '@jest/globals';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock NEXON API key if not provided
if (!process.env.NEXON_API_KEY) {
  process.env.NEXON_API_KEY = 'test-api-key-for-mocking';
}

// Global test utilities
global.testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockApiKey: 'test-api-key-for-mocking',
  testCharacterName: 'TestChar',
  testGuildName: 'TestGuild',
  testWorldName: 'Aquila'
};

// Console override for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Suppress console.log during tests unless explicitly enabled
  log: process.env.ENABLE_TEST_LOGS ? originalConsole.log : jest.fn(),
  debug: jest.fn(),
  info: process.env.ENABLE_TEST_LOGS ? originalConsole.info : jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
});

declare global {
  var testUtils: {
    delay: (ms: number) => Promise<void>;
    mockApiKey: string;
    testCharacterName: string;
    testGuildName: string;
    testWorldName: string;
  };
}