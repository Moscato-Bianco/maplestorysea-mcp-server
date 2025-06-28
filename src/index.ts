#!/usr/bin/env node

/**
 * MCP Maple CLI Entry Point
 * NPX executable for running the MapleStory API MCP server
 */

import { Command } from 'commander';
import { McpServer } from './server/mcp-server';
import { createAllTools } from './tools';
import { McpLogger } from './utils/logger';

const packageJson = require('../package.json');

interface CliOptions {
  port?: number;
  debug?: boolean;
  apiKey?: string;
  name?: string;
  version?: string;
}

class CliApp {
  private logger: McpLogger;
  private server: McpServer | null = null;

  constructor() {
    this.logger = new McpLogger('cli');
  }

  /**
   * Parse and validate CLI arguments
   */
  private parseArguments(): CliOptions {
    const program = new Command();

    program
      .name('mcp-maple')
      .description('MapleStory API Model Context Protocol Server')
      .version(packageJson.version)
      .option(
        '--api-key <key>',
        'NEXON API key (can also be set via NEXON_API_KEY environment variable)'
      )
      .option('--port <number>', 'Port number for the server (MCP uses stdio by default)', parseInt)
      .option('--debug', 'Enable debug mode with verbose logging')
      .option('--name <name>', 'Custom server name (default: mcp-maple)')
      .option('--version-override <version>', 'Custom server version (default: 1.0.0)')
      .helpOption('-h, --help', 'Display help for command')
      .addHelpText(
        'after',
        `
Examples:
  $ npx mcp-maple --api-key YOUR_API_KEY
  $ NEXON_API_KEY=YOUR_KEY npx mcp-maple --debug
  $ npx mcp-maple --help

Environment Variables:
  NEXON_API_KEY    Your NEXON Open API key (required)
  LOG_LEVEL        Logging level (debug, info, warn, error)
  NODE_ENV         Environment (development, production)

For more information, visit: https://github.com/ljy9303/mcp-maple
        `
      );

    program.parse();
    const options = program.opts();

    return {
      port: options.port,
      debug: options.debug || false,
      apiKey: options.apiKey,
      name: options.name,
      version: options.versionOverride,
    };
  }

  /**
   * Validate and resolve configuration
   */
  private resolveConfig(options: CliOptions): {
    nexonApiKey: string;
    name: string;
    version: string;
    debug: boolean;
    port?: number;
  } {
    // Resolve API key from CLI arg or environment
    const apiKey = options.apiKey || process.env.NEXON_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      this.logger.error('NEXON API key is required');
      process.stderr.write('\n❌ Error: NEXON API key is required\n');
      process.stderr.write('\nProvide it via:\n');
      process.stderr.write('  • CLI argument: --api-key YOUR_API_KEY\n');
      process.stderr.write('  • Environment variable: NEXON_API_KEY=YOUR_KEY\n');
      process.stderr.write('\nFor help: npx mcp-maple --help\n');
      process.exit(1);
    }

    // Set debug mode
    if (options.debug) {
      process.env.LOG_LEVEL = 'debug';
    }

    const config = {
      nexonApiKey: apiKey.trim(),
      name: options.name || 'mcp-maple',
      version: options.version || '1.0.2',
      debug: options.debug || false,
    } as {
      nexonApiKey: string;
      name: string;
      version: string;
      debug: boolean;
      port?: number;
    };

    if (options.port !== undefined) {
      config.port = options.port;
    }

    return config;
  }

  /**
   * Initialize and start the MCP server
   */
  private async startServer(config: ReturnType<typeof CliApp.prototype.resolveConfig>): Promise<void> {
    try {
      this.logger.info('Starting MCP Maple server...', {
        name: config.name,
        version: config.version,
        debug: config.debug,
      });

      // Create server instance
      this.server = new McpServer({
        name: config.name,
        version: config.version,
        nexonApiKey: config.nexonApiKey,
        debug: config.debug,
      });

      // Register all available tools
      const tools = createAllTools();
      tools.forEach((tool) => {
        this.server!.registerTool(tool);
      });

      this.logger.info(`Registered ${tools.length} tools`, {
        tools: tools.map((tool) => tool.name),
      });

      // Start the server
      await this.server.start();

      // Only output startup messages to stderr when not in MCP mode
      if (config.port !== undefined) {
        process.stderr.write('✅ MCP Maple server started successfully!\n');
        process.stderr.write(`📊 Server: ${config.name} v${config.version}\n`);
        process.stderr.write(`🔧 Tools: ${tools.length} available\n`);
        process.stderr.write(`🐛 Debug: ${config.debug ? 'enabled' : 'disabled'}\n`);

        if (config.debug) {
          process.stderr.write('\n🔍 Debug mode enabled - verbose logging active\n');
        }

        process.stderr.write('\n📖 Server is ready for MCP connections\n');
        process.stderr.write('💡 Use Ctrl+C to gracefully shutdown\n');
      }
    } catch (error) {
      this.logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : String(error),
      });

      process.stderr.write('\n❌ Failed to start MCP server:\n');
      process.stderr.write(`   ${error instanceof Error ? error.message : String(error)}\n`);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handling
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, initiating graceful shutdown...`);
      process.stderr.write(`\n🛑 Received ${signal}, shutting down gracefully...\n`);

      try {
        if (this.server) {
          await this.server.shutdown();
          process.stderr.write('✅ Server shutdown completed\n');
        }
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : String(error),
        });
        process.stderr.write(`❌ Error during shutdown: ${error}\n`);
        process.exit(1);
      }
    };

    // Handle various termination signals
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception', { error: error.message });
      process.stderr.write(`❌ Uncaught exception: ${error}\n`);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      this.logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
      });
      process.stderr.write(`❌ Unhandled promise rejection: ${reason}\n`);
      process.exit(1);
    });
  }

  /**
   * Main application entry point
   */
  public async run(): Promise<void> {
    try {
      // Setup shutdown handlers first
      this.setupShutdownHandlers();

      // Parse CLI arguments
      const options = this.parseArguments();

      // Resolve and validate configuration
      const config = this.resolveConfig(options);

      // Start the server
      await this.startServer(config);
    } catch (error) {
      this.logger.error('Application startup failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      process.stderr.write('\n❌ Application startup failed:\n');
      process.stderr.write(`   ${error instanceof Error ? error.message : String(error)}\n`);
      process.exit(1);
    }
  }
}

// Run the CLI app if this file is executed directly
if (require.main === module) {
  const app = new CliApp();
  app.run().catch((error) => {
    process.stderr.write(`Fatal error: ${error}\n`);
    process.exit(1);
  });
}

export { CliApp };
