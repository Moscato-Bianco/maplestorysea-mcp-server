#!/usr/bin/env node

/**
 * MCP Maple CLI Entry Point
 * NPX executable for running the MapleStory API MCP server
 */

import { Command } from 'commander';
import { McpServer } from './server/mcp-server';
import { createAllTools } from './tools';
import { McpLogger } from './utils/logger';

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
      .version('1.0.1')
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
      console.error('\n❌ Error: NEXON API key is required');
      console.error('\nProvide it via:');
      console.error('  • CLI argument: --api-key YOUR_API_KEY');
      console.error('  • Environment variable: NEXON_API_KEY=YOUR_KEY');
      console.error('\nFor help: npx mcp-maple --help');
      process.exit(1);
    }

    // Set debug mode
    if (options.debug) {
      process.env.LOG_LEVEL = 'debug';
    }

    const config = {
      nexonApiKey: apiKey.trim(),
      name: options.name || 'mcp-maple',
      version: options.version || '1.0.1',
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

      console.log('✅ MCP Maple server started successfully!');
      console.log(`📊 Server: ${config.name} v${config.version}`);
      console.log(`🔧 Tools: ${tools.length} available`);
      console.log(`🐛 Debug: ${config.debug ? 'enabled' : 'disabled'}`);

      if (config.debug) {
        console.log('\n🔍 Debug mode enabled - verbose logging active');
      }

      console.log('\n📖 Server is ready for MCP connections');
      console.log('💡 Use Ctrl+C to gracefully shutdown');
    } catch (error) {
      this.logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : String(error),
      });

      console.error('\n❌ Failed to start MCP server:');
      console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handling
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, initiating graceful shutdown...`);
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

      try {
        if (this.server) {
          await this.server.shutdown();
          console.log('✅ Server shutdown completed');
        }
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : String(error),
        });
        console.error('❌ Error during shutdown:', error);
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
      console.error('❌ Uncaught exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      this.logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
      });
      console.error('❌ Unhandled promise rejection:', reason);
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

      console.error('\n❌ Application startup failed:');
      console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Run the CLI app if this file is executed directly
if (require.main === module) {
  const app = new CliApp();
  app.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { CliApp };
