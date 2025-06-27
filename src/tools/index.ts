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

// Union tools
export { GetUnionInfoTool, GetUnionRaiderTool, GetUnionRankingTool } from './union-tools';

// Guild tools
export { GetGuildInfoTool, GetGuildRankingTool } from './guild-tools';

// Ranking tools
export { GetOverallRankingTool } from './ranking-tools';

// Notice tools
export { GetNoticeListTool, GetNoticeDetailTool } from './notice-tools';

// Probability tools
export { GetCubeProbabilityTool, GetStarforceProbabilityTool } from './probability-tools';

// Import all tools
import { HealthCheckTool } from './health-check-tool';
import {
  GetCharacterBasicInfoTool,
  GetCharacterStatsTool,
  GetCharacterEquipmentTool,
  GetCharacterFullInfoTool,
} from './character-tools';
import { GetUnionInfoTool, GetUnionRaiderTool, GetUnionRankingTool } from './union-tools';
import { GetGuildInfoTool, GetGuildRankingTool } from './guild-tools';
import { GetOverallRankingTool } from './ranking-tools';
import { GetNoticeListTool, GetNoticeDetailTool } from './notice-tools';
import { GetCubeProbabilityTool, GetStarforceProbabilityTool } from './probability-tools';

// Tool factory for creating all available tools
export function createAllTools() {
  return [
    new HealthCheckTool(),
    new GetCharacterBasicInfoTool(),
    new GetCharacterStatsTool(),
    new GetCharacterEquipmentTool(),
    new GetCharacterFullInfoTool(),
    new GetUnionInfoTool(),
    new GetUnionRaiderTool(),
    new GetUnionRankingTool(),
    new GetGuildInfoTool(),
    new GetGuildRankingTool(),
    new GetOverallRankingTool(),
    new GetNoticeListTool(),
    new GetNoticeDetailTool(),
    new GetCubeProbabilityTool(),
    new GetStarforceProbabilityTool(),
  ];
}
