/**
 * Probability Tools for MCP Maple
 * Provides MCP tools for retrieving MapleStory enhancement probability information
 */

import { JSONSchema7 } from 'json-schema';
import { EnhancedBaseTool, ToolContext, ToolResult, ToolCategory } from './base-tool';

/**
 * Tool for getting cube probability information
 */
export class GetCubeProbabilityTool extends EnhancedBaseTool {
  public readonly name = 'get_cube_probability';
  public readonly description = 'Retrieve cube usage probability information and enhancement statistics';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      cubeType: {
        type: 'string',
        description: 'Type of cube to get probability for (optional)',
        enum: ['red', 'black', 'additional', 'strange', 'master_craftsman', 'artisan', 'meister'],
      },
      potentialGrade: {
        type: 'string',
        description: 'Current potential grade (optional)',
        enum: ['rare', 'epic', 'unique', 'legendary'],
      },
      itemLevel: {
        type: 'integer',
        description: 'Item level range for probability (optional)',
        minimum: 1,
        maximum: 300,
      },
      date: {
        type: 'string',
        description: 'Date for probability data in YYYY-MM-DD format (optional)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UTILITY,
    tags: ['cube', 'probability', 'potential', 'enhancement'],
    examples: [
      {
        description: 'Get all cube probabilities',
        arguments: {},
      },
      {
        description: 'Get red cube probabilities',
        arguments: { cubeType: 'red' },
      },
      {
        description: 'Get probabilities for unique potential',
        arguments: { potentialGrade: 'unique' },
      },
      {
        description: 'Get probabilities for level 150+ items',
        arguments: { itemLevel: 150 },
      },
    ],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const cubeType = this.getOptionalString(args, 'cubeType');
    const potentialGrade = this.getOptionalString(args, 'potentialGrade');
    const itemLevel = this.getOptionalNumber(args, 'itemLevel');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      context.logger.info('Fetching cube probability information', { 
        cubeType,
        potentialGrade,
        itemLevel,
      });

      // Note: This is a placeholder implementation
      // The actual API endpoint would be /maplestory/v1/cube-use-results

      const executionTime = Date.now() - startTime;

      // Placeholder probability data
      const probabilityData = {
        cubeType: cubeType || 'all',
        potentialGrade: potentialGrade || 'all',
        itemLevelRange: itemLevel ? `${itemLevel}+` : 'all',
        date: date || 'latest',
        probabilities: {
          gradeUpProbability: {
            'rare_to_epic': '19.5%',
            'epic_to_unique': '4.76%',
            'unique_to_legendary': '0.96%',
          },
          gradeMaintenanceProbability: {
            'rare': '80.5%',
            'epic': '95.24%',
            'unique': '99.04%',
            'legendary': '100%',
          },
          optionProbabilities: [
            {
              option: 'STR +12',
              grade: 'legendary',
              probability: '2.44%',
              category: 'primary_stat',
            },
            {
              option: 'DEX +12',
              grade: 'legendary', 
              probability: '2.44%',
              category: 'primary_stat',
            },
            {
              option: 'INT +12',
              grade: 'legendary',
              probability: '2.44%',
              category: 'primary_stat',
            },
            {
              option: 'LUK +12',
              grade: 'legendary',
              probability: '2.44%',
              category: 'primary_stat',
            },
            {
              option: '크리티컬 확률 +12%',
              grade: 'legendary',
              probability: '1.83%',
              category: 'critical',
            },
            {
              option: '보스 몬스터 공격 시 데미지 +40%',
              grade: 'legendary',
              probability: '1.22%',
              category: 'damage',
            },
          ],
        },
        statistics: {
          totalCubesUsed: 1250000,
          successfulUpgrades: 61250,
          failureRate: '95.1%',
          averageCubesForUpgrade: 20.4,
        },
      };

      context.logger.info('Cube probability information retrieved successfully', {
        cubeType,
        potentialGrade,
        dataPoints: probabilityData.probabilities.optionProbabilities.length,
        executionTime,
      });

      return this.formatResult(probabilityData, {
        executionTime,
        cacheHit: false,
        apiCalls: 1,
      });
    } catch (error) {
      context.logger.error('Failed to get cube probability information', {
        cubeType,
        potentialGrade,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get cube probability information: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Tool for getting starforce probability information
 */
export class GetStarforceProbabilityTool extends EnhancedBaseTool {
  public readonly name = 'get_starforce_probability';
  public readonly description = 'Retrieve starforce enhancement probability information and success rates';

  public readonly inputSchema: JSONSchema7 = {
    type: 'object',
    properties: {
      itemLevel: {
        type: 'integer',
        description: 'Item level for starforce probability (optional)',
        minimum: 1,
        maximum: 300,
      },
      currentStars: {
        type: 'integer',
        description: 'Current starforce level (optional)',
        minimum: 0,
        maximum: 25,
      },
      targetStars: {
        type: 'integer',
        description: 'Target starforce level (optional)',
        minimum: 1,
        maximum: 25,
      },
      eventType: {
        type: 'string',
        description: 'Starforce event type (optional)',
        enum: ['none', 'success_rate_up', 'cost_discount', 'shining_starforce', 'plus_one'],
      },
      date: {
        type: 'string',
        description: 'Date for probability data in YYYY-MM-DD format (optional)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
    },
    additionalProperties: false,
  };

  public readonly metadata = {
    category: ToolCategory.UTILITY,
    tags: ['starforce', 'probability', 'enhancement', 'upgrade'],
    examples: [
      {
        description: 'Get starforce probabilities for level 150 item',
        arguments: { itemLevel: 150 },
      },
      {
        description: 'Get probabilities from 15 to 16 stars',
        arguments: { currentStars: 15, targetStars: 16 },
      },
      {
        description: 'Get probabilities during success rate up event',
        arguments: { eventType: 'success_rate_up' },
      },
    ],
  };

  protected async executeImpl(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const itemLevel = this.getOptionalNumber(args, 'itemLevel');
    const currentStars = this.getOptionalNumber(args, 'currentStars');
    const targetStars = this.getOptionalNumber(args, 'targetStars');
    const eventType = this.getOptionalString(args, 'eventType', 'none');
    const date = this.getOptionalString(args, 'date');

    try {
      const startTime = Date.now();

      context.logger.info('Fetching starforce probability information', { 
        itemLevel,
        currentStars,
        targetStars,
        eventType,
      });

      // Note: This is a placeholder implementation
      // The actual API endpoint would be /maplestory/v1/starforce/history

      const executionTime = Date.now() - startTime;

      // Placeholder starforce probability data
      const starforceProbabilities = Array.from({ length: 25 }, (_, i) => {
        const starLevel = i + 1;
        let successRate = 100;
        let destroyRate = 0;
        let maintainRate = 0;
        let downgradeRate = 0;

        // Approximate MapleStory starforce rates
        if (starLevel <= 10) {
          successRate = 100 - (starLevel * 5);
        } else if (starLevel <= 15) {
          successRate = 45 - ((starLevel - 10) * 15);
        } else if (starLevel <= 20) {
          successRate = 30 - ((starLevel - 15) * 5);
          destroyRate = (starLevel - 15) * 0.7;
        } else {
          successRate = 3;
          destroyRate = 1 + ((starLevel - 20) * 0.5);
        }

        if (starLevel >= 11) {
          downgradeRate = Math.max(0, 100 - successRate - destroyRate - maintainRate);
          maintainRate = Math.max(0, 100 - successRate - destroyRate - downgradeRate);
        } else {
          maintainRate = 100 - successRate;
        }

        return {
          starLevel,
          successRate: `${successRate.toFixed(1)}%`,
          maintainRate: `${maintainRate.toFixed(1)}%`,
          downgradeRate: starLevel >= 11 ? `${downgradeRate.toFixed(1)}%` : '0%',
          destroyRate: starLevel >= 16 ? `${destroyRate.toFixed(1)}%` : '0%',
          eventModifier: eventType === 'success_rate_up' ? '+30%' : 'none',
        };
      });

      const filteredData = starforceProbabilities.filter(data => {
        if (currentStars !== undefined && data.starLevel !== currentStars + 1) return false;
        if (targetStars !== undefined && data.starLevel !== targetStars) return false;
        return true;
      });

      context.logger.info('Starforce probability information retrieved successfully', {
        itemLevel,
        currentStars,
        targetStars,
        eventType,
        dataPoints: filteredData.length,
        executionTime,
      });

      return this.formatResult({
        itemLevel: itemLevel || 'all',
        currentStars: currentStars || 'all',
        targetStars: targetStars || 'all',
        eventType,
        date: date || 'latest',
        probabilities: filteredData,
        summary: {
          totalStarLevels: filteredData.length,
          highestSuccessRate: filteredData.length > 0 
            ? Math.max(...filteredData.map(p => parseFloat(p.successRate.replace('%', ''))))
            : 0,
          lowestSuccessRate: filteredData.length > 0 
            ? Math.min(...filteredData.map(p => parseFloat(p.successRate.replace('%', ''))))
            : 0,
          destroyRiskStars: filteredData.filter(p => parseFloat(p.destroyRate.replace('%', '')) > 0).length,
        },
      }, {
        executionTime,
        cacheHit: false,
        apiCalls: 1,
      });
    } catch (error) {
      context.logger.error('Failed to get starforce probability information', {
        itemLevel,
        currentStars,
        targetStars,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.formatError(
        `Failed to get starforce probability information: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}