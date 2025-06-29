/**
 * Tools index file
 * Exports all available MCP tools for MapleStory SEA API
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
  GetCharacterAnalysisTool,
  FindCharacterRankingTool,
  GetJobClassInfoTool,
} from './character-tools';

// Union tools
export { GetUnionInfoTool, GetUnionRaiderTool, GetUnionRankingTool } from './union-tools';

// Guild tools
export { GetGuildInfoTool, GetGuildRankingTool, SearchGuildsTool } from './guild-tools';

// Ranking tools (SEA API compatible only)
export { GetOverallRankingTool } from './ranking-tools';

// Import all tools
import { HealthCheckTool } from './health-check-tool';
import {
  GetCharacterBasicInfoTool,
  GetCharacterStatsTool,
  GetCharacterEquipmentTool,
  GetCharacterFullInfoTool,
  GetCharacterAnalysisTool,
  FindCharacterRankingTool,
  GetJobClassInfoTool,
} from './character-tools';
import { GetUnionInfoTool, GetUnionRaiderTool, GetUnionRankingTool } from './union-tools';
import { GetGuildInfoTool, GetGuildRankingTool, SearchGuildsTool } from './guild-tools';
import { GetOverallRankingTool } from './ranking-tools';

// Tool factory for creating all available tools (SEA API compatible only)
export function createAllTools() {
  return [
    new HealthCheckTool(),
    new GetCharacterBasicInfoTool(),
    new GetCharacterStatsTool(),
    new GetCharacterEquipmentTool(),
    new GetCharacterFullInfoTool(),
    new GetCharacterAnalysisTool(),
    new FindCharacterRankingTool(),
    new GetJobClassInfoTool(),
    new GetUnionInfoTool(),
    new GetUnionRaiderTool(),
    new GetUnionRankingTool(),
    new GetGuildInfoTool(),
    new GetGuildRankingTool(),
    new SearchGuildsTool(),
    new GetOverallRankingTool(),
  ];
}
