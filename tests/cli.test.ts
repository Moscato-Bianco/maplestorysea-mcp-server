/**
 * Test suite for CLI functionality
 * Tests command-line interface argument parsing and server startup
 */

import { CliApp } from '../src/index';

// Mock the MCP server and tools
jest.mock('../src/server/mcp-server');
jest.mock('../src/tools');

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

// Mock axios
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

// Mock commander
const mockParse = jest.fn();
const mockOpts = jest.fn();
const mockCommand = {
  name: jest.fn().mockReturnThis(),
  description: jest.fn().mockReturnThis(),
  version: jest.fn().mockReturnThis(),
  option: jest.fn().mockReturnThis(),
  helpOption: jest.fn().mockReturnThis(),
  addHelpText: jest.fn().mockReturnThis(),
  parse: mockParse,
  opts: mockOpts,
};

jest.mock('commander', () => ({
  Command: jest.fn(() => mockCommand),
}));

describe('CliApp', () => {
  let cliApp: CliApp;
  let mockExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    cliApp = new CliApp();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('Constructor', () => {
    test('should create CLI app instance', () => {
      expect(cliApp).toBeInstanceOf(CliApp);
    });
  });

  describe('Argument Parsing', () => {
    test('should parse basic command line arguments', () => {
      mockOpts.mockReturnValue({
        apiKey: 'test-api-key',
        debug: false,
        port: undefined,
        name: undefined,
        versionOverride: undefined,
      });

      // Access private method for testing
      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      const result = parseArguments();

      expect(result).toEqual({
        apiKey: 'test-api-key',
        debug: false,
        port: undefined,
        name: undefined,
        version: undefined,
      });
    });

    test('should parse debug flag', () => {
      mockOpts.mockReturnValue({
        debug: true,
        apiKey: 'test-key',
      });

      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      const result = parseArguments();

      expect(result.debug).toBe(true);
    });

    test('should parse port number', () => {
      mockOpts.mockReturnValue({
        port: 3000,
        apiKey: 'test-key',
      });

      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      const result = parseArguments();

      expect(result.port).toBe(3000);
    });

    test('should parse custom name and version', () => {
      mockOpts.mockReturnValue({
        name: 'custom-server',
        versionOverride: '2.0.0',
        apiKey: 'test-key',
      });

      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      const result = parseArguments();

      expect(result.name).toBe('custom-server');
      expect(result.version).toBe('2.0.0');
    });
  });

  describe('Configuration Resolution', () => {
    test('should resolve API key from CLI argument', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      const config = resolveConfig({
        apiKey: 'cli-api-key',
        debug: false,
      });

      expect(config.nexonApiKey).toBe('cli-api-key');
    });

    test('should resolve API key from environment variable', () => {
      process.env.NEXON_API_KEY = 'env-api-key';

      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      const config = resolveConfig({
        debug: false,
      });

      expect(config.nexonApiKey).toBe('env-api-key');

      delete process.env.NEXON_API_KEY;
    });

    test('should prefer CLI argument over environment variable', () => {
      process.env.NEXON_API_KEY = 'env-api-key';

      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      const config = resolveConfig({
        apiKey: 'cli-api-key',
        debug: false,
      });

      expect(config.nexonApiKey).toBe('cli-api-key');

      delete process.env.NEXON_API_KEY;
    });

    test('should exit when no API key is provided', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);

      expect(() => {
        resolveConfig({
          debug: false,
        });
      }).toThrow('process.exit called');

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith('\n❌ Error: NEXON API key is required');
    });

    test('should exit when API key is empty string', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);

      expect(() => {
        resolveConfig({
          apiKey: '   ',
          debug: false,
        });
      }).toThrow('process.exit called');

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should set debug mode in environment', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      
      resolveConfig({
        apiKey: 'test-key',
        debug: true,
      });

      expect(process.env.LOG_LEVEL).toBe('debug');
    });

    test('should use default values for optional fields', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      const config = resolveConfig({
        apiKey: 'test-key',
        debug: false,
      });

      expect(config.name).toBe('mcp-maple');
      expect(config.version).toBe('1.0.0');
      expect(config.debug).toBe(false);
    });

    test('should use custom values when provided', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);
      const config = resolveConfig({
        apiKey: 'test-key',
        debug: true,
        name: 'custom-name',
        version: '2.0.0',
        port: 3000,
      });

      expect(config.name).toBe('custom-name');
      expect(config.version).toBe('2.0.0');
      expect(config.debug).toBe(true);
      expect(config.port).toBe(3000);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing API key gracefully', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);

      expect(() => {
        resolveConfig({
          debug: false,
        });
      }).toThrow('process.exit called');

      expect(mockConsoleError).toHaveBeenCalledWith('\n❌ Error: NEXON API key is required');
      expect(mockConsoleError).toHaveBeenCalledWith('\nProvide it via:');
      expect(mockConsoleError).toHaveBeenCalledWith('  • CLI argument: --api-key YOUR_API_KEY');
      expect(mockConsoleError).toHaveBeenCalledWith('  • Environment variable: NEXON_API_KEY=YOUR_KEY');
    });

    test('should provide help information when API key is missing', () => {
      const resolveConfig = (cliApp as any).resolveConfig.bind(cliApp);

      expect(() => {
        resolveConfig({
          debug: false,
        });
      }).toThrow('process.exit called');

      expect(mockConsoleError).toHaveBeenCalledWith('\nFor help: npx mcp-maple --help');
    });
  });

  describe('Command Setup', () => {
    test('should configure commander with correct options', () => {
      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      parseArguments();

      expect(mockCommand.name).toHaveBeenCalledWith('mcp-maple');
      expect(mockCommand.description).toHaveBeenCalledWith('MapleStory API Model Context Protocol Server');
      expect(mockCommand.version).toHaveBeenCalledWith('1.0.0');

      // Check that all expected options are configured
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--api-key <key>',
        'NEXON API key (can also be set via NEXON_API_KEY environment variable)'
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--port <number>',
        'Port number for the server (MCP uses stdio by default)',
        parseInt
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--debug',
        'Enable debug mode with verbose logging'
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--name <name>',
        'Custom server name (default: mcp-maple)'
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        '--version-override <version>',
        'Custom server version (default: 1.0.0)'
      );
    });

    test('should configure help option', () => {
      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      parseArguments();

      expect(mockCommand.helpOption).toHaveBeenCalledWith('-h, --help', 'Display help for command');
    });

    test('should add help text with examples', () => {
      const parseArguments = (cliApp as any).parseArguments.bind(cliApp);
      parseArguments();

      expect(mockCommand.addHelpText).toHaveBeenCalledWith('after', expect.stringContaining('Examples:'));
      expect(mockCommand.addHelpText).toHaveBeenCalledWith('after', expect.stringContaining('npx mcp-maple --api-key YOUR_API_KEY'));
      expect(mockCommand.addHelpText).toHaveBeenCalledWith('after', expect.stringContaining('Environment Variables:'));
    });
  });
});