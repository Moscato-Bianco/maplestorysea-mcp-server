/**
 * Test suite for Health Check Tool
 * Tests the health check tool functionality
 */

import { HealthCheckTool } from '../../src/tools/health-check-tool';
import { ToolContext } from '../../src/tools/base-tool';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));

describe('HealthCheckTool', () => {
  let tool: HealthCheckTool;
  let mockContext: ToolContext;

  beforeEach(() => {
    tool = new HealthCheckTool();
    mockContext = {
      nexonClient: {
        healthCheck: jest.fn(),
      } as any,
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      } as any,
    };
  });

  describe('Tool Properties', () => {
    test('should have correct properties', () => {
      expect(tool.name).toBe('health_check');
      expect(tool.description).toContain('health status');
      expect(tool.inputSchema).toBeDefined();
      expect(tool.metadata.category).toBe('utility');
      expect(tool.metadata.tags).toContain('health');
    });

    test('should have valid input schema', () => {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toHaveProperty('includeDetails');
      expect(tool.inputSchema.additionalProperties).toBe(false);
    });

    test('should have examples in metadata', () => {
      expect(tool.metadata.examples).toHaveLength(2);
      expect(tool.metadata.examples[0].description).toContain('Basic health check');
      expect(tool.metadata.examples[1].description).toContain('Detailed health check');
    });
  });

  describe('Validation', () => {
    test('should validate empty arguments', () => {
      expect(tool.validate({})).toBe(true);
    });

    test('should validate includeDetails boolean', () => {
      expect(tool.validate({ includeDetails: true })).toBe(true);
      expect(tool.validate({ includeDetails: false })).toBe(true);
    });

    test('should reject invalid includeDetails type', () => {
      expect(tool.validate({ includeDetails: 'true' })).toBe(false);
      expect(tool.validate({ includeDetails: 1 })).toBe(false);
      expect(tool.validate({ includeDetails: null })).toBe(false);
    });
  });

  describe('Execution', () => {
    beforeEach(() => {
      (mockContext.nexonClient.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    test('should execute basic health check', async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        server: {
          name: 'mcp-maple',
          version: '1.0.0',
          uptime: expect.any(String),
        },
        nexonApi: {
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        responseTime: expect.any(String),
      });

      expect(result.metadata).toMatchObject({
        executionTime: expect.any(Number),
        cacheHit: false,
        apiCalls: 1,
      });
    });

    test('should execute detailed health check', async () => {
      const result = await tool.execute({ includeDetails: true }, mockContext);

      expect(result.success).toBe(true);
      expect(result.data.systemInfo).toBeDefined();
      expect(result.data.systemInfo.node).toMatchObject({
        version: expect.any(String),
        platform: expect.any(String),
        arch: expect.any(String),
      });
      expect(result.data.systemInfo.memory).toMatchObject({
        rss: expect.any(String),
        heapTotal: expect.any(String),
        heapUsed: expect.any(String),
        external: expect.any(String),
      });
      expect(result.data.systemInfo.process).toMatchObject({
        pid: expect.any(Number),
        cwd: expect.any(String),
      });
    });

    test('should handle NEXON API failure gracefully', async () => {
      (mockContext.nexonClient.healthCheck as jest.Mock).mockRejectedValue(
        new Error('API connection failed')
      );

      const result = await tool.execute({}, mockContext);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('degraded');
      expect(result.data.nexonApi.status).toBe('unhealthy');
      expect(result.data.nexonApi.error).toBe('API connection failed');
    });

    test('should measure execution time', async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.metadata?.executionTime).toBeGreaterThanOrEqual(0);
    });

    test('should throw error for invalid includeDetails parameter', async () => {
      await expect(tool.execute({ includeDetails: 'invalid' }, mockContext)).rejects.toThrow(
        'Invalid arguments provided'
      );
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      (mockContext.nexonClient.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    test('should format timestamp correctly', async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should format uptime correctly', async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.data.server.uptime).toMatch(/^\d+(\.\d+)?s$/);
    });

    test('should format response time correctly', async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.data.responseTime).toMatch(/^\d+ms$/);
    });

    test('should format memory usage correctly when includeDetails is true', async () => {
      const result = await tool.execute({ includeDetails: true }, mockContext);

      const memory = result.data.systemInfo.memory;
      expect(memory.rss).toMatch(/^\d+MB$/);
      expect(memory.heapTotal).toMatch(/^\d+MB$/);
      expect(memory.heapUsed).toMatch(/^\d+MB$/);
      expect(memory.external).toMatch(/^\d+MB$/);
    });
  });
});