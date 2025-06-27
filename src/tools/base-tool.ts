/**
 * Base tool interface and abstract classes for MCP Maple tools
 * Provides common structure and functionality for all MapleStory API tools
 */

import { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';
import { NexonApiClient } from '../api/nexon-client';
import { McpLogger } from '../utils/logger';

export interface ToolContext {
  nexonClient: NexonApiClient;
  logger: McpLogger;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    cacheHit?: boolean;
    apiCalls?: number;
    [key: string]: any;
  };
}

/**
 * Base interface for all MCP tools
 */
export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: JSONSchema7;

  execute(args: Record<string, any>, context: ToolContext): Promise<any>;
  validate(args: Record<string, any>): boolean;
}

/**
 * Abstract base class for all MCP tools
 * Provides common functionality and structure
 */
export abstract class BaseTool implements ITool {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly inputSchema: JSONSchema7;
  
  private static ajv = new Ajv({ allErrors: true });

  /**
   * Execute the tool with given arguments
   */
  public async execute(args: Record<string, any>, context: ToolContext): Promise<any> {
    const startTime = Date.now();

    try {
      // Validate input arguments
      if (!this.validate(args)) {
        throw new Error('Invalid arguments provided');
      }

      context.logger.info(`Executing tool: ${this.name}`, {
        toolName: this.name,
        arguments: args,
      });

      // Execute the tool-specific logic
      const result = await this.executeImpl(args, context);

      const executionTime = Date.now() - startTime;
      context.logger.info(`Tool execution completed: ${this.name}`, {
        toolName: this.name,
        executionTime,
        success: true,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      context.logger.error(`Tool execution failed: ${this.name}`, {
        toolName: this.name,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Validate input arguments against the schema
   */
  public validate(args: Record<string, any>): boolean {
    try {
      const validate = BaseTool.ajv.compile(this.inputSchema as any);
      const isValid = validate(args);
      
      if (!isValid) {
        return false;
      }

      return this.validateImpl(args);
    } catch (error) {
      return false;
    }
  }

  /**
   * Tool-specific implementation logic
   */
  protected abstract executeImpl(args: Record<string, any>, context: ToolContext): Promise<any>;

  /**
   * Tool-specific validation logic
   */
  protected validateImpl(_args: Record<string, any>): boolean {
    return true; // Override in subclasses for custom validation
  }

  /**
   * Helper method to format tool results consistently
   */
  protected formatResult(data: any, metadata?: Record<string, any>): ToolResult {
    return {
      success: true,
      data,
      ...(metadata && { metadata }),
    };
  }

  /**
   * Helper method to format error results consistently
   */
  protected formatError(error: string | Error, metadata?: Record<string, any>): ToolResult {
    return {
      success: false,
      error: error instanceof Error ? error.message : error,
      ...(metadata && { metadata }),
    };
  }

  /**
   * Helper method to safely get required string parameter
   */
  protected getRequiredString(args: Record<string, any>, key: string): string {
    const value = args[key];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Required parameter '${key}' must be a non-empty string`);
    }
    return value.trim();
  }

  /**
   * Helper method to safely get optional string parameter
   */
  protected getOptionalString(args: Record<string, any>, key: string, defaultValue?: string): string | undefined {
    const value = args[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value !== 'string') {
      throw new Error(`Parameter '${key}' must be a string`);
    }
    return value.trim();
  }

  /**
   * Helper method to safely get required number parameter
   */
  protected getRequiredNumber(args: Record<string, any>, key: string): number {
    const value = args[key];
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Required parameter '${key}' must be a valid number`);
    }
    return value;
  }

  /**
   * Helper method to safely get optional number parameter
   */
  protected getOptionalNumber(args: Record<string, any>, key: string, defaultValue = 0): number {
    const value = args[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Parameter '${key}' must be a valid number`);
    }
    return value;
  }

  /**
   * Helper method to get optional boolean parameter with default value
   */
  protected getOptionalBoolean(args: Record<string, any>, key: string, defaultValue = false): boolean {
    const value = args[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value !== 'boolean') {
      throw new Error(`Parameter '${key}' must be a boolean`);
    }
    return value;
  }

  /**
   * Helper method to validate date format (YYYY-MM-DD)
   */
  protected validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }

    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  /**
   * Helper method to format date to API format
   */
  protected formatApiDate(date?: Date): string {
    const targetDate = date || new Date();
    const isoString = targetDate.toISOString();
    const datePart = isoString.split('T')[0];
    if (!datePart) {
      throw new Error('Invalid date format');
    }
    return datePart;
  }

  /**
   * Helper method to handle API errors consistently
   */
  protected handleApiError(error: any, operation: string): never {
    if (error?.error) {
      throw new Error(`${operation} failed: ${error.error.message} (${error.error.name})`);
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${operation} failed: ${message}`);
  }
}

/**
 * Abstract base class for character-related tools
 */
export abstract class CharacterTool extends BaseTool {
  protected async getCharacterOcid(characterName: string, context: ToolContext): Promise<string> {
    try {
      const result = await context.nexonClient.getCharacterOcid(characterName);
      return result.ocid;
    } catch (error) {
      this.handleApiError(error, 'Character lookup');
    }
  }
}

/**
 * Abstract base class for guild-related tools
 */
export abstract class GuildTool extends BaseTool {
  protected async getGuildId(
    guildName: string,
    worldName: string,
    context: ToolContext
  ): Promise<string> {
    try {
      const result = await context.nexonClient.getGuildId(guildName, worldName);
      return result.oguild_id;
    } catch (error) {
      this.handleApiError(error, 'Guild lookup');
    }
  }
}

/**
 * Tool category enumeration
 */
export enum ToolCategory {
  CHARACTER = 'character',
  UNION = 'union',
  GUILD = 'guild',
  RANKING = 'ranking',
  UTILITY = 'utility',
}

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  category: ToolCategory;
  tags: string[];
  examples: Array<{
    description: string;
    arguments: Record<string, any>;
  }>;
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

/**
 * Enhanced tool interface with metadata
 */
export interface IEnhancedTool extends ITool {
  readonly metadata: ToolMetadata;
}

/**
 * Enhanced base tool class with metadata support
 */
export abstract class EnhancedBaseTool extends BaseTool implements IEnhancedTool {
  public abstract readonly metadata: ToolMetadata;
}
