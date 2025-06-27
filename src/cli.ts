#!/usr/bin/env node
/**
 * CLI entry point for MCP Maple
 * Handles command-line arguments and starts the server
 */

import { Command } from 'commander';
import { createServer } from './index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const program = new Command();

program.name('mcp-maple').description('NEXON MapleStory Open API MCP Server').version('1.0.0');

program
  .command('start')
  .description('Start the MCP server')
  .action(async () => {
    try {
      const server = await createServer();
      const transport = new StdioServerTransport();
      await server.connect(transport);
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check server health')
  .action(() => {
    console.log('MCP Maple CLI is working!');
  });

// Default action is to start the server
if (process.argv.length === 2) {
  process.argv.push('start');
}

program.parse();
