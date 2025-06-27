/**
 * MCP Server Foundation for MapleStory API
 * Implements the core Model Context Protocol server using MCP TypeScript SDK
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { McpLogger } from '../utils/logger';
import { McpMapleError } from '../utils/errors';
import { NexonApiClient } from '../api/nexon-client';
import { BaseTool } from '../tools/base-tool';

export interface McpServerConfig {
  name?: string;
  version?: string;
  nexonApiKey: string;
  debug?: boolean;
}

export interface ServerInfo {
  name: string;
  version: string;
  capabilities: {
    tools: Record<string, unknown>;
  };
}

export class McpServer {
  private server: Server;
  private transport: StdioServerTransport | null = null;
  private logger: McpLogger;
  private nexonClient: NexonApiClient;
  private tools: Map<string, BaseTool> = new Map();
  private config: McpServerConfig;
  private isRunning = false;

  constructor(config: McpServerConfig) {
    if (!config.nexonApiKey || config.nexonApiKey.trim() === '') {
      throw new Error('nexonApiKey is required');
    }

    this.config = {
      name: 'mcp-maple',
      version: '1.0.0',
      debug: false,
      ...config,
    };

    this.logger = new McpLogger('mcp-server');
    this.nexonClient = new NexonApiClient({
      apiKey: config.nexonApiKey,
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: this.config.name!,
        version: this.config.version!,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.logger.info('MCP server initialized', {
      name: this.config.name,
      version: this.config.version,
    });
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.logMcpOperation('list_tools', 'all', {
        toolCount: this.tools.size,
      });

      const tools: Tool[] = Array.from(this.tools.values()).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema as any, // MCP SDK type compatibility
      }));

      return { tools };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      this.logger.logMcpOperation('call_tool', name, {
        arguments: args,
      });

      try {
        const tool = this.tools.get(name);
        if (!tool) {
          throw new McpMapleError(`Tool '${name}' not found`, 'TOOL_NOT_FOUND', 404, {
            toolName: name,
            availableTools: Array.from(this.tools.keys()),
          });
        }

        // Execute the tool
        const result = await tool.execute(args || {}, {
          nexonClient: this.nexonClient,
          logger: this.logger,
        });

        this.logger.logMcpOperation('tool_executed', name, {
          success: true,
          resultType: typeof result,
        });

        // Format result as MCP response
        const content: TextContent[] = [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ];

        return { content } as CallToolResult;
      } catch (error) {
        this.logger.error('Tool execution failed', {
          operation: 'tool_execution_error',
          toolName: name,
          error: error instanceof Error ? error.message : String(error),
        });

        // Return error as text content
        const errorMessage =
          error instanceof McpMapleError
            ? `${error.message} (${error.code})`
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        } as CallToolResult;
      }
    });
  }

  /**
   * Register a tool with the server
   */
  public registerTool(tool: BaseTool): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn('Tool already registered, overwriting', {
        toolName: tool.name,
      });
    }

    this.tools.set(tool.name, tool);
    this.logger.info('Tool registered', {
      toolName: tool.name,
      description: tool.description,
    });
  }

  /**
   * Unregister a tool from the server
   */
  public unregisterTool(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      this.logger.info('Tool unregistered', { toolName });
    } else {
      this.logger.warn('Attempted to unregister non-existent tool', { toolName });
    }
    return removed;
  }

  /**
   * Get list of registered tools
   */
  public getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool by name
   */
  public getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get server information
   */
  public getServerInfo(): ServerInfo {
    return {
      name: this.config.name!,
      version: this.config.version!,
      capabilities: {
        tools: {},
      },
    };
  }

  /**
   * Check if server is running
   */
  public isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new McpMapleError('Server is already running', 'SERVER_ALREADY_RUNNING');
    }

    try {
      this.transport = new StdioServerTransport();
      await this.server.connect(this.transport);
      this.isRunning = true;

      this.logger.info('MCP server started successfully', {
        name: this.config.name,
        toolCount: this.tools.size,
        tools: Array.from(this.tools.keys()),
      });

      // Test NEXON API connection
      try {
        const healthCheck = await this.nexonClient.healthCheck();
        this.logger.info('NEXON API health check', healthCheck);
      } catch (error) {
        this.logger.warn('NEXON API health check failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } catch (error) {
      this.isRunning = false;
      this.logger.error('Failed to start MCP server', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new McpMapleError('Failed to start MCP server', 'SERVER_START_FAILED', undefined, {
        originalError: error,
      });
    }
  }

  /**
   * Stop the MCP server
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Attempted to stop server that is not running');
      return;
    }

    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }

      this.isRunning = false;
      this.logger.info('MCP server stopped successfully');
    } catch (error) {
      this.logger.error('Error stopping MCP server', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new McpMapleError('Failed to stop MCP server', 'SERVER_STOP_FAILED', undefined, {
        originalError: error,
      });
    }
  }

  /**
   * Graceful shutdown with cleanup
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Initiating graceful shutdown');

    try {
      await this.stop();
      this.tools.clear();
      this.logger.info('Graceful shutdown completed');
    } catch (error) {
      this.logger.error('Error during graceful shutdown', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Health check for the server
   */
  public async healthCheck(): Promise<{
    server: string;
    nexonApi: string;
    toolCount: number;
    uptime: string;
  }> {
    const serverStatus = this.isRunning ? 'healthy' : 'stopped';

    let nexonApiStatus = 'unknown';
    try {
      const healthCheck = await this.nexonClient.healthCheck();
      nexonApiStatus = healthCheck.status;
    } catch (error) {
      nexonApiStatus = 'unhealthy';
    }

    return {
      server: serverStatus,
      nexonApi: nexonApiStatus,
      toolCount: this.tools.size,
      uptime: process.uptime().toFixed(2) + 's',
    };
  }
}

