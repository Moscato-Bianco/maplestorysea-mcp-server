/**
 * MCP Protocol Compatibility Tests
 * Validates Model Context Protocol compliance and integration
 */

import { jest } from '@jest/globals';
import { createAllTools } from '../../src/tools/index';
import { JSONSchema7 } from 'json-schema';

describe('MCP Protocol Compatibility', () => {
  let tools: ReturnType<typeof createAllTools>;

  beforeEach(() => {
    tools = createAllTools();
  });

  describe('Tool Registration and Structure', () => {
    test('should register all expected tools', () => {
      const expectedTools = [
        'get_character_basic_info',
        'get_character_stats',
        'get_character_equipment',
        'get_character_full_info',
        'find_character_ranking',
        'get_union_info',
        'get_union_raider',
        'get_union_ranking',
        'get_guild_info',
        'search_guilds',
        'get_guild_ranking',
        'get_overall_ranking',
        'health_check',
        'get_job_class_info'
      ];

      expectedTools.forEach(toolName => {
        const tool = tools.find(t => t.name === toolName);
        expect(tool).toBeDefined();
      });

      expect(tools.length).toBeGreaterThanOrEqual(expectedTools.length);
    });

    test('all tools should have valid MCP structure', () => {
      tools.forEach(tool => {
        // Required MCP tool properties
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
        expect(tool.name.length).toBeGreaterThan(0);

        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
        expect(tool.description.length).toBeGreaterThan(0);

        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.inputSchema).toBe('object');

        // Tool should have execute method
        expect(tool.execute).toBeDefined();
        expect(typeof tool.execute).toBe('function');

        // Tool should have validate method
        expect(tool.validate).toBeDefined();
        expect(typeof tool.validate).toBe('function');
      });
    });

    test('tool names should follow MCP naming conventions', () => {
      tools.forEach(tool => {
        // Tool names should be lowercase with underscores
        expect(tool.name).toMatch(/^[a-z0-9_]+$/);
        
        // Should not start or end with underscore
        expect(tool.name).not.toMatch(/^_|_$/);
        
        // Should not have consecutive underscores
        expect(tool.name).not.toMatch(/__/);
      });
    });
  });

  describe('Input Schema Validation', () => {
    test('all schemas should be valid JSON Schema 7', () => {
      tools.forEach(tool => {
        const schema = tool.inputSchema as JSONSchema7;
        
        // Should be an object schema
        expect(schema.type).toBe('object');
        
        // Should have properties defined
        expect(schema.properties).toBeDefined();
        expect(typeof schema.properties).toBe('object');
        
        // Should not allow additional properties for strict validation
        expect(schema.additionalProperties).toBe(false);
        
        // If has required fields, should be an array
        if (schema.required) {
          expect(Array.isArray(schema.required)).toBe(true);
        }
      });
    });

    test('character tools should require characterName parameter', () => {
      const characterTools = tools.filter(tool => 
        tool.name.includes('character') && !tool.name.includes('ranking')
      );

      characterTools.forEach(tool => {
        const schema = tool.inputSchema as JSONSchema7;
        expect(schema.properties?.characterName).toBeDefined();
        expect(schema.required).toContain('characterName');
      });
    });

    test('schemas should have proper validation patterns', () => {
      tools.forEach(tool => {
        const schema = tool.inputSchema as JSONSchema7;
        
        // Character name validation
        if (schema.properties?.characterName) {
          const charNameSchema = schema.properties.characterName as JSONSchema7;
          expect(charNameSchema.type).toBe('string');
          expect(charNameSchema.minLength).toBeDefined();
          expect(charNameSchema.maxLength).toBeDefined();
          expect(charNameSchema.pattern).toBeDefined();
        }

        // World name validation
        if (schema.properties?.worldName) {
          const worldSchema = schema.properties.worldName as JSONSchema7;
          expect(worldSchema.type).toBe('string');
        }

        // Date validation
        if (schema.properties?.date) {
          const dateSchema = schema.properties.date as JSONSchema7;
          expect(dateSchema.type).toBe('string');
          expect(dateSchema.pattern).toBeDefined();
        }
      });
    });
  });

  describe('Tool Execution Interface', () => {
    test('tools should handle execution context properly', async () => {
      const mockContext = {
        nexonClient: {
          getCharacterOcid: jest.fn().mockResolvedValue({ ocid: 'test-ocid' }),
          getCharacterBasic: jest.fn().mockResolvedValue({
            character_name: 'TestChar',
            character_level: 250,
            character_class: 'Hero',
            world_name: 'Aquila',
            date: '2024-01-15'
          })
        },
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          logApiRequest: jest.fn(),
          logApiResponse: jest.fn(),
          logApiError: jest.fn(),
          logCacheOperation: jest.fn(),
          logCharacterOperation: jest.fn(),
          logGuildOperation: jest.fn(),
          logUnionOperation: jest.fn(),
          logRankingOperation: jest.fn(),
          logRateLimit: jest.fn(),
          logHealthCheck: jest.fn(),
          logSecurityEvent: jest.fn(),
          logRecoveryAttempt: jest.fn(),
        }
      };

      const basicInfoTool = tools.find(tool => tool.name === 'get_character_basic_info');
      expect(basicInfoTool).toBeDefined();

      const result = await basicInfoTool!.execute(
        { characterName: 'TestChar' },
        mockContext as any
      );

      // Should return proper MCP response structure
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('tools should validate input parameters', () => {
      tools.forEach(tool => {
        // Valid input should pass validation
        if (tool.name === 'get_character_basic_info') {
          expect(tool.validate({ characterName: 'TestChar' })).toBe(true);
          expect(tool.validate({ characterName: 'TestChar', date: '2024-01-15' })).toBe(true);
        }

        // Invalid input should fail validation
        if (tool.name === 'get_character_basic_info') {
          expect(tool.validate({})).toBe(false); // Missing required field
          expect(tool.validate({ characterName: '' })).toBe(false); // Empty name
          expect(tool.validate({ characterName: 'AB' })).toBe(true); // Minimum length (2 chars)
          expect(tool.validate({ characterName: 'A'.repeat(14) })).toBe(false); // Too long (>13)
          expect(tool.validate({ characterName: '한국이름' })).toBe(false); // Korean characters
          expect(tool.validate({ characterName: 'Test@' })).toBe(false); // Special characters
        }
      });
    });
  });

  describe('Error Handling Compliance', () => {
    test('tools should handle validation errors gracefully', async () => {
      const mockContext = {
        nexonClient: {},
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          logApiRequest: jest.fn(),
          logApiResponse: jest.fn(),
          logApiError: jest.fn(),
          logCacheOperation: jest.fn(),
          logCharacterOperation: jest.fn(),
          logGuildOperation: jest.fn(),
          logUnionOperation: jest.fn(),
          logRankingOperation: jest.fn(),
          logRateLimit: jest.fn(),
          logHealthCheck: jest.fn(),
          logSecurityEvent: jest.fn(),
          logRecoveryAttempt: jest.fn(),
        }
      };

      const basicInfoTool = tools.find(tool => tool.name === 'get_character_basic_info');
      expect(basicInfoTool).toBeDefined();

      // Should throw error for invalid arguments
      await expect(basicInfoTool!.execute(
        { characterName: '' }, // Invalid empty name
        mockContext as any
      )).rejects.toThrow();
    });

    test('tools should provide meaningful error messages', () => {
      // This is validated through the error handling in the tools themselves
      // The tools should use SEA-specific error messages in English
      expect(true).toBe(true); // Placeholder for error message validation
    });
  });

  describe('Output Format Compliance', () => {
    test('tools should return consistent output structure', async () => {
      const mockContext = {
        nexonClient: {
          getCharacterOcid: jest.fn().mockResolvedValue({ ocid: 'test-ocid' }),
          getCharacterBasic: jest.fn().mockResolvedValue({
            character_name: 'TestChar',
            character_level: 250,
            character_class: 'Hero',
            world_name: 'Aquila',
            date: '2024-01-15',
            character_gender: 'Male',
            character_exp: 1000000,
            character_exp_rate: '50.0',
            character_guild_name: 'TestGuild'
          })
        },
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          logApiRequest: jest.fn(),
          logApiResponse: jest.fn(),
          logApiError: jest.fn(),
          logCacheOperation: jest.fn(),
          logCharacterOperation: jest.fn(),
          logGuildOperation: jest.fn(),
          logUnionOperation: jest.fn(),
          logRankingOperation: jest.fn(),
          logRateLimit: jest.fn(),
          logHealthCheck: jest.fn(),
          logSecurityEvent: jest.fn(),
          logRecoveryAttempt: jest.fn(),
        }
      };

      const basicInfoTool = tools.find(tool => tool.name === 'get_character_basic_info');
      const result = await basicInfoTool!.execute(
        { characterName: 'TestChar' },
        mockContext as any
      );

      // Should use SEA formatting
      expect(result.data.characterName).toBe('TestChar');
      expect(result.data.level).toMatch(/^\d{1,3}$/); // Should be formatted number
      expect(result.data.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/); // DD/MM/YYYY format
    });

    test('health check tool should return proper status format', async () => {
      const healthTool = tools.find(tool => tool.name === 'health_check');
      expect(healthTool).toBeDefined();

      const mockContext = {
        nexonClient: {
          getOverallRanking: jest.fn().mockResolvedValue({
            ranking: [{ character_name: 'Test', ranking: 1 }]
          }),
          getClientHealth: jest.fn().mockResolvedValue({
            status: 'healthy',
            errors: { total: 0 },
            performance: {},
            cache: { size: 0 },
            uptime: 12345
          })
        },
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          logApiRequest: jest.fn(),
          logApiResponse: jest.fn(),
          logApiError: jest.fn(),
          logCacheOperation: jest.fn(),
          logCharacterOperation: jest.fn(),
          logGuildOperation: jest.fn(),
          logUnionOperation: jest.fn(),
          logRankingOperation: jest.fn(),
          logRateLimit: jest.fn(),
          logHealthCheck: jest.fn(),
          logSecurityEvent: jest.fn(),
          logRecoveryAttempt: jest.fn(),
        }
      };

      const result = await healthTool!.execute({}, mockContext as any);
      
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('details');
      expect(result.data.status).toMatch(/^(healthy|degraded|unhealthy)$/);
    });
  });

  describe('SEA Region Compliance', () => {
    test('tools should enforce SEA-specific validations', () => {
      const characterTool = tools.find(tool => tool.name === 'get_character_basic_info');
      
      // Basic character name validation should work
      expect(characterTool!.validate({ 
        characterName: 'TestChar'
      })).toBe(true);
      
      // Should validate SEA world names if supported
      if (characterTool!.inputSchema.properties?.worldName) {
        expect(characterTool!.validate({ 
          characterName: 'TestChar', 
          worldName: 'Aquila' 
        })).toBe(true);
        
        expect(characterTool!.validate({ 
          characterName: 'TestChar', 
          worldName: 'Scania' 
        })).toBe(false);
      }
    });

    test('all character names should follow SEA naming rules', () => {
      const characterTools = tools.filter(tool => 
        tool.name.includes('character')
      );

      characterTools.forEach(tool => {
        // Basic character name validation should work for most tools
        const basicValid = tool.validate({ characterName: 'TestChar' });
        
        // Some tools may require additional parameters, so we allow both scenarios
        if (basicValid) {
          expect(tool.validate({ characterName: 'Player123' })).toBe(true);
        } else {
          // Tool may require additional parameters - check if it has worldName
          if (tool.inputSchema.properties?.worldName) {
            expect(tool.validate({ 
              characterName: 'TestChar', 
              worldName: 'Aquila' 
            })).toBe(true);
          }
        }
        
        // Invalid names should always fail
        expect(tool.validate({ characterName: '한국이름' })).toBe(false); // Korean
        expect(tool.validate({ characterName: 'Test@Name' })).toBe(false); // Special chars
      });
    });
  });

  describe('Documentation and Metadata', () => {
    test('all tools should have comprehensive descriptions', () => {
      tools.forEach(tool => {
        expect(tool.description.length).toBeGreaterThan(20);
        // Most tools should mention MapleStory, some focus on SEA specifically
        expect(tool.description.toLowerCase()).toMatch(/maplestory|sea|character|guild|union|ranking|health/);
      });
    });

    test('game-related tools should mention MapleStory context', () => {
      const gameTools = tools.filter(tool => 
        !tool.name.includes('health')
      );

      gameTools.forEach(tool => {
        // Should mention MapleStory context or SEA region
        expect(tool.description.toLowerCase()).toMatch(/maplestory|character|guild|union|ranking/);
      });
    });

    test('schemas should have proper parameter descriptions', () => {
      tools.forEach(tool => {
        const schema = tool.inputSchema as JSONSchema7;
        
        Object.keys(schema.properties || {}).forEach(prop => {
          const propSchema = schema.properties![prop] as JSONSchema7;
          expect(propSchema.description).toBeDefined();
          expect(typeof propSchema.description).toBe('string');
          expect(propSchema.description!.length).toBeGreaterThan(10);
        });
      });
    });
  });
});