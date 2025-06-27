/**
 * Test suite for Base Tool classes
 * Tests the base tool functionality and helper methods
 */

import { BaseTool, CharacterTool, GuildTool, ToolContext, ToolCategory } from '../../src/tools/base-tool';
import { JSONSchema7 } from 'json-schema';

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

// Mock axios
jest.mock('axios');

class TestTool extends BaseTool {
  public readonly name = 'test_tool';
  public readonly description = 'A test tool for unit testing';
  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      requiredString: { type: 'string' },
      optionalNumber: { type: 'number' },
      testDate: { type: 'string', format: 'date' },
    },
    required: ['requiredString'],
    additionalProperties: false,
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<any> {
    return { message: 'Test executed successfully', args };
  }

  protected validateImpl(args: Record<string, any>): boolean {
    return true;
  }

  // Expose protected methods for testing
  public testGetRequiredString = this.getRequiredString.bind(this);
  public testGetOptionalString = this.getOptionalString.bind(this);
  public testGetRequiredNumber = this.getRequiredNumber.bind(this);
  public testGetOptionalNumber = this.getOptionalNumber.bind(this);
  public testValidateDateFormat = this.validateDateFormat.bind(this);
  public testFormatApiDate = this.formatApiDate.bind(this);
  public testFormatResult = this.formatResult.bind(this);
  public testFormatError = this.formatError.bind(this);
}

class TestCharacterTool extends CharacterTool {
  public readonly name = 'test_character_tool';
  public readonly description = 'A test character tool';
  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      characterName: { type: 'string' },
    },
    required: ['characterName'],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<any> {
    const characterName = this.getRequiredString(args, 'characterName');
    const ocid = await this.getCharacterOcid(characterName, context);
    return { characterName, ocid };
  }
}

class TestGuildTool extends GuildTool {
  public readonly name = 'test_guild_tool';
  public readonly description = 'A test guild tool';
  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      guildName: { type: 'string' },
      worldName: { type: 'string' },
    },
    required: ['guildName', 'worldName'],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<any> {
    const guildName = this.getRequiredString(args, 'guildName');
    const worldName = this.getRequiredString(args, 'worldName');
    const guildId = await this.getGuildId(guildName, worldName, context);
    return { guildName, worldName, guildId };
  }
}

describe('BaseTool', () => {
  let tool: TestTool;
  let mockContext: ToolContext;

  beforeEach(() => {
    tool = new TestTool();
    mockContext = {
      nexonClient: {
        getCharacterOcid: jest.fn(),
        getGuildId: jest.fn(),
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

  describe('Basic Properties', () => {
    test('should have correct properties', () => {
      expect(tool.name).toBe('test_tool');
      expect(tool.description).toBe('A test tool for unit testing');
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    });
  });

  describe('Validation', () => {
    test('should validate required fields', () => {
      expect(tool.validate({ requiredString: 'test' })).toBe(true);
      expect(tool.validate({})).toBe(false);
      expect(tool.validate({ requiredString: null })).toBe(false);
      expect(tool.validate({ requiredString: undefined })).toBe(false);
    });

    test('should validate with optional fields', () => {
      expect(tool.validate({ requiredString: 'test', optionalNumber: 42 })).toBe(true);
    });
  });

  describe('Execution', () => {
    test('should execute successfully with valid arguments', async () => {
      const args = { requiredString: 'test', optionalNumber: 42 };
      const result = await tool.execute(args, mockContext);

      expect(result).toEqual({
        message: 'Test executed successfully',
        args,
      });

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        'Executing tool: test_tool',
        expect.objectContaining({
          toolName: 'test_tool',
          arguments: args,
        })
      );
    });

    test('should throw error for invalid arguments', async () => {
      const args = {}; // Missing required field

      await expect(tool.execute(args, mockContext)).rejects.toThrow('Invalid arguments provided');
    });
  });

  describe('Helper Methods', () => {
    describe('getRequiredString', () => {
      test('should return valid string', () => {
        expect(tool.testGetRequiredString({ key: 'value' }, 'key')).toBe('value');
        expect(tool.testGetRequiredString({ key: '  value  ' }, 'key')).toBe('value');
      });

      test('should throw for invalid values', () => {
        expect(() => tool.testGetRequiredString({}, 'key')).toThrow();
        expect(() => tool.testGetRequiredString({ key: '' }, 'key')).toThrow();
        expect(() => tool.testGetRequiredString({ key: null }, 'key')).toThrow();
        expect(() => tool.testGetRequiredString({ key: 123 }, 'key')).toThrow();
      });
    });

    describe('getOptionalString', () => {
      test('should return valid string or default', () => {
        expect(tool.testGetOptionalString({ key: 'value' }, 'key')).toBe('value');
        expect(tool.testGetOptionalString({}, 'key')).toBe('');
        expect(tool.testGetOptionalString({}, 'key', 'default')).toBe('default');
        expect(tool.testGetOptionalString({ key: null }, 'key', 'default')).toBe('default');
      });

      test('should throw for invalid type', () => {
        expect(() => tool.testGetOptionalString({ key: 123 }, 'key')).toThrow();
      });
    });

    describe('getRequiredNumber', () => {
      test('should return valid number', () => {
        expect(tool.testGetRequiredNumber({ key: 42 }, 'key')).toBe(42);
        expect(tool.testGetRequiredNumber({ key: 0 }, 'key')).toBe(0);
        expect(tool.testGetRequiredNumber({ key: -1 }, 'key')).toBe(-1);
      });

      test('should throw for invalid values', () => {
        expect(() => tool.testGetRequiredNumber({}, 'key')).toThrow();
        expect(() => tool.testGetRequiredNumber({ key: 'string' }, 'key')).toThrow();
        expect(() => tool.testGetRequiredNumber({ key: NaN }, 'key')).toThrow();
        expect(() => tool.testGetRequiredNumber({ key: null }, 'key')).toThrow();
      });
    });

    describe('getOptionalNumber', () => {
      test('should return valid number or default', () => {
        expect(tool.testGetOptionalNumber({ key: 42 }, 'key')).toBe(42);
        expect(tool.testGetOptionalNumber({}, 'key')).toBe(0);
        expect(tool.testGetOptionalNumber({}, 'key', 100)).toBe(100);
        expect(tool.testGetOptionalNumber({ key: null }, 'key', 100)).toBe(100);
      });

      test('should throw for invalid type', () => {
        expect(() => tool.testGetOptionalNumber({ key: 'string' }, 'key')).toThrow();
        expect(() => tool.testGetOptionalNumber({ key: NaN }, 'key')).toThrow();
      });
    });

    describe('validateDateFormat', () => {
      test('should validate correct date formats', () => {
        expect(tool.testValidateDateFormat('2024-01-01')).toBe(true);
        expect(tool.testValidateDateFormat('2024-12-31')).toBe(true);
      });

      test('should reject invalid date formats', () => {
        expect(tool.testValidateDateFormat('2024-1-1')).toBe(false);
        expect(tool.testValidateDateFormat('24-01-01')).toBe(false);
        expect(tool.testValidateDateFormat('2024/01/01')).toBe(false);
        expect(tool.testValidateDateFormat('invalid')).toBe(false);
        expect(tool.testValidateDateFormat('2024-13-01')).toBe(false);
      });
    });

    describe('formatApiDate', () => {
      test('should format date correctly', () => {
        const date = new Date('2024-01-01T10:30:00Z');
        expect(tool.testFormatApiDate(date)).toBe('2024-01-01');
      });

      test('should use current date when no date provided', () => {
        const result = tool.testFormatApiDate();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    describe('formatResult', () => {
      test('should format result correctly', () => {
        const data = { test: 'data' };
        const metadata = { key: 'value' };
        const result = tool.testFormatResult(data, metadata);

        expect(result).toEqual({
          success: true,
          data,
          metadata,
        });
      });
    });

    describe('formatError', () => {
      test('should format error correctly', () => {
        const error = new Error('Test error');
        const metadata = { key: 'value' };
        const result = tool.testFormatError(error, metadata);

        expect(result).toEqual({
          success: false,
          error: 'Test error',
          metadata,
        });
      });

      test('should handle string errors', () => {
        const result = tool.testFormatError('String error');
        expect(result.error).toBe('String error');
      });
    });
  });
});

describe('CharacterTool', () => {
  let tool: TestCharacterTool;
  let mockContext: ToolContext;

  beforeEach(() => {
    tool = new TestCharacterTool();
    mockContext = {
      nexonClient: {
        getCharacterOcid: jest.fn().mockResolvedValue({ ocid: 'test-ocid' }),
      } as any,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      } as any,
    };
  });

  test('should get character OCID successfully', async () => {
    const args = { characterName: 'TestCharacter' };
    const result = await tool.execute(args, mockContext);

    expect(result).toEqual({
      characterName: 'TestCharacter',
      ocid: 'test-ocid',
    });

    expect(mockContext.nexonClient.getCharacterOcid).toHaveBeenCalledWith('TestCharacter');
  });

  test('should handle API errors gracefully', async () => {
    const apiError = { error: { message: 'Character not found', name: 'NOT_FOUND' } };
    (mockContext.nexonClient.getCharacterOcid as jest.Mock).mockRejectedValue(apiError);

    const args = { characterName: 'NonExistentCharacter' };

    await expect(tool.execute(args, mockContext)).rejects.toThrow(
      'Character lookup failed: Character not found (NOT_FOUND)'
    );
  });
});

describe('GuildTool', () => {
  let tool: TestGuildTool;
  let mockContext: ToolContext;

  beforeEach(() => {
    tool = new TestGuildTool();
    mockContext = {
      nexonClient: {
        getGuildId: jest.fn().mockResolvedValue({ oguild_id: 'test-guild-id' }),
      } as any,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      } as any,
    };
  });

  test('should get guild ID successfully', async () => {
    const args = { guildName: 'TestGuild', worldName: '스카니아' };
    const result = await tool.execute(args, mockContext);

    expect(result).toEqual({
      guildName: 'TestGuild',
      worldName: '스카니아',
      guildId: 'test-guild-id',
    });

    expect(mockContext.nexonClient.getGuildId).toHaveBeenCalledWith('TestGuild', '스카니아');
  });

  test('should handle API errors gracefully', async () => {
    const apiError = { error: { message: 'Guild not found', name: 'NOT_FOUND' } };
    (mockContext.nexonClient.getGuildId as jest.Mock).mockRejectedValue(apiError);

    const args = { guildName: 'NonExistentGuild', worldName: '스카니아' };

    await expect(tool.execute(args, mockContext)).rejects.toThrow(
      'Guild lookup failed: Guild not found (NOT_FOUND)'
    );
  });
});