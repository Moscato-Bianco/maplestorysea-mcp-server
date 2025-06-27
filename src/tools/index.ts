/**
 * Tools index file
 * Exports all available MCP tools for MapleStory API
 */

export { BaseTool, CharacterTool, GuildTool, EnhancedBaseTool } from './base-tool';
export type { ITool, IEnhancedTool, ToolContext, ToolResult, ToolMetadata } from './base-tool';
export { ToolCategory } from './base-tool';

// Utility tools
export { HealthCheckTool } from './health-check-tool';

// Character tools
export {
  GetCharacterBasicInfoTool,
  GetCharacterStatsTool,
  GetCharacterEquipmentTool,
  GetCharacterFullInfoTool,
} from './character-tools';

// Import all tools
import { HealthCheckTool } from './health-check-tool';
import {
  GetCharacterBasicInfoTool,
  GetCharacterStatsTool,
  GetCharacterEquipmentTool,
  GetCharacterFullInfoTool,
} from './character-tools';

// Tool factory for creating all available tools
export function createAllTools() {
  return [
    new HealthCheckTool(),
    new GetCharacterBasicInfoTool(),
    new GetCharacterStatsTool(),
    new GetCharacterEquipmentTool(),
    new GetCharacterFullInfoTool(),
  ];
}
