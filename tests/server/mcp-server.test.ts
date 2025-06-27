/**
 * Test suite for MCP Server
 * Tests MCP server functionality, tool registration, and lifecycle management
 */

import { McpServer } from '../../src/server/mcp-server';
import { HealthCheckTool } from '../../src/tools/health-check-tool';
import { BaseTool, ToolContext } from '../../src/tools/base-tool';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
}));

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn(() => jest.fn()),
    timestamp: jest.fn(() => jest.fn()),
    json: jest.fn(() => jest.fn()),
    printf: jest.fn(() => jest.fn()),
    colorize: jest.fn(() => jest.fn()),
    simple: jest.fn(() => jest.fn()),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock axios for NexonApiClient
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('McpServer', () => {
  let server: McpServer;
  const mockConfig = {
    nexonApiKey: 'test-api-key',
    debug: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    server = new McpServer(mockConfig);
  });

  describe('Constructor', () => {
    test('should initialize server with correct configuration', () => {
      expect(server).toBeInstanceOf(McpServer);
      expect(server.isServerRunning()).toBe(false);
    });

    test('should use default configuration values', () => {
      const serverInfo = server.getServerInfo();
      expect(serverInfo.name).toBe('mcp-maple');
      expect(serverInfo.version).toBe('1.0.0');
    });

    test('should allow custom configuration', () => {
      const customServer = new McpServer({
        name: 'custom-server',
        version: '2.0.0',
        nexonApiKey: 'test-key',
      });

      const serverInfo = customServer.getServerInfo();
      expect(serverInfo.name).toBe('custom-server');
      expect(serverInfo.version).toBe('2.0.0');
    });
  });

  describe('Tool Registration', () => {
    let testTool: HealthCheckTool;

    beforeEach(() => {
      testTool = new HealthCheckTool();
    });

    test('should register tool successfully', () => {
      server.registerTool(testTool);
      
      const registeredTools = server.getRegisteredTools();
      expect(registeredTools).toContain('health_check');
      expect(server.getTool('health_check')).toBe(testTool);
    });

    test('should unregister tool successfully', () => {
      server.registerTool(testTool);
      expect(server.getRegisteredTools()).toContain('health_check');

      const removed = server.unregisterTool('health_check');
      expect(removed).toBe(true);
      expect(server.getRegisteredTools()).not.toContain('health_check');
      expect(server.getTool('health_check')).toBeUndefined();
    });

    test('should return false when unregistering non-existent tool', () => {
      const removed = server.unregisterTool('non-existent-tool');
      expect(removed).toBe(false);
    });

    test('should allow overwriting existing tool', () => {
      const firstTool = new HealthCheckTool();
      const secondTool = new HealthCheckTool();

      server.registerTool(firstTool);
      server.registerTool(secondTool);

      expect(server.getTool('health_check')).toBe(secondTool);
      expect(server.getRegisteredTools().length).toBe(1);
    });

    test('should get list of registered tools', () => {
      expect(server.getRegisteredTools()).toEqual([]);

      server.registerTool(testTool);
      expect(server.getRegisteredTools()).toEqual(['health_check']);
    });
  });

  describe('Server Lifecycle', () => {
    test('should start server successfully', async () => {
      expect(server.isServerRunning()).toBe(false);

      await server.start();
      expect(server.isServerRunning()).toBe(true);
    });

    test('should throw error when starting already running server', async () => {
      await server.start();
      
      await expect(server.start()).rejects.toThrow('Server is already running');
    });

    test('should stop server successfully', async () => {
      await server.start();
      expect(server.isServerRunning()).toBe(true);

      await server.stop();
      expect(server.isServerRunning()).toBe(false);
    });

    test('should handle stopping non-running server gracefully', async () => {
      expect(server.isServerRunning()).toBe(false);
      
      await expect(server.stop()).resolves.not.toThrow();
    });

    test('should shutdown gracefully', async () => {
      const testTool = new HealthCheckTool();
      server.registerTool(testTool);
      await server.start();

      expect(server.isServerRunning()).toBe(true);
      expect(server.getRegisteredTools().length).toBe(1);

      await server.shutdown();

      expect(server.isServerRunning()).toBe(false);
      expect(server.getRegisteredTools().length).toBe(0);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const health = await server.healthCheck();

      expect(health).toMatchObject({
        server: expect.any(String),
        nexonApi: expect.any(String),
        toolCount: expect.any(Number),
        uptime: expect.any(String),
      });

      expect(health.server).toBe('stopped');
      expect(health.toolCount).toBe(0);
    });

    test('should report running status when server is started', async () => {
      await server.start();
      const health = await server.healthCheck();

      expect(health.server).toBe('healthy');
    });

    test('should include tool count in health check', async () => {
      const testTool = new HealthCheckTool();
      server.registerTool(testTool);

      const health = await server.healthCheck();
      expect(health.toolCount).toBe(1);
    });
  });

  describe('Server Info', () => {
    test('should return correct server information', () => {
      const info = server.getServerInfo();

      expect(info).toMatchObject({
        name: 'mcp-maple',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error for empty API key', () => {
      expect(() => {
        new McpServer({
          nexonApiKey: '',
        });
      }).toThrow('nexonApiKey is required');
    });

    test('should handle missing required configuration', () => {
      expect(() => {
        new McpServer({} as any);
      }).toThrow();
    });
  });
});