/**
 * MCP Maple - NEXON MapleStory Open API MCP Server
 * Main entry point for the MCP server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Create and configure the MCP server
 */
export async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'mcp-maple',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'health_check',
          description: 'Check if the MCP server is running',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;

    switch (name) {
      case 'health_check':
        return {
          content: [
            {
              type: 'text',
              text: 'MCP Maple server is running successfully!',
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

/**
 * Start the MCP server if this file is run directly
 */
async function main(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Maple server started successfully');
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
