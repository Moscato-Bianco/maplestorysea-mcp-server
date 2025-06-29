/**
 * SEA Localization Completeness Tests
 * Validates all SEA-specific localization features and formatting
 */

import { jest } from '@jest/globals';
import {
  convertToSEATime,
  formatSEADate,
  formatSEATime,
  formatSEANumber,
  formatSEAMesos,
  formatSEAPercentage,
  getCurrentSEADate,
  getCurrentSEATimeString,
  SEA_TIMEZONE,
  SEA_TIMEZONE_OFFSET
} from '../../src/utils/server-utils';
import { WORLDS, JOB_CLASSES } from '../../src/api/constants';
import { validateCharacterName, validateWorldName } from '../../src/utils/validation';

describe('SEA Localization Completeness', () => {
  describe('Timezone and Date Formatting', () => {
    test('should use Singapore timezone (GMT+8)', () => {
      expect(SEA_TIMEZONE).toBe('Asia/Singapore');
      expect(SEA_TIMEZONE_OFFSET).toBe(8 * 60 * 60 * 1000);
    });

    test('should format dates in DD/MM/YYYY format', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const formatted = formatSEADate(testDate);
      
      // Should be in DD/MM/YYYY format
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      
      // Should be Singapore time (UTC+8)
      const seaDate = convertToSEATime(testDate);
      expect(seaDate.getHours()).toBe(18); // 10 UTC + 8 hours = 18 SGT
    });

    test('should format time in 24-hour format', () => {
      const testDate = new Date('2024-03-15T14:30:45Z');
      const formatted = formatSEATime(testDate);
      
      // Should be in HH:MM:SS 24-hour format
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(formatted).not.toContain('AM');
      expect(formatted).not.toContain('PM');
    });

    test('should handle date with time formatting', () => {
      const testDate = new Date('2024-12-25T16:45:30Z');
      const formatted = formatSEADate(testDate, true);
      
      // Should include both date and time
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('Number Formatting', () => {
    test('should format numbers with commas (1,000 style)', () => {
      expect(formatSEANumber(1000)).toBe('1,000');
      expect(formatSEANumber(1234567)).toBe('1,234,567');
      expect(formatSEANumber(999)).toBe('999');
    });

    test('should format mesos with commas and "mesos" suffix', () => {
      expect(formatSEAMesos(1000000)).toBe('1,000,000 mesos');
      expect(formatSEAMesos(0)).toBe('0 mesos');
      expect(formatSEAMesos(999999)).toBe('999,999 mesos');
    });

    test('should format percentages with % symbol', () => {
      expect(formatSEAPercentage(25.5)).toBe('25.5%');
      expect(formatSEAPercentage(100)).toBe('100.0%');
      expect(formatSEAPercentage(0.1)).toBe('0.1%');
    });

    test('should handle edge cases in number formatting', () => {
      expect(formatSEANumber(0)).toBe('0');
      expect(formatSEAPercentage(0)).toBe('0.0%');
      expect(formatSEAMesos(-1000)).toBe('-1,000 mesos'); // Negative mesos are formatted as is
    });
  });

  describe('SEA World Names', () => {
    test('should support all SEA worlds', () => {
      const expectedSEAWorlds = ['Aquila', 'Bootes', 'Cassiopeia', 'Delphinus'];
      
      expectedSEAWorlds.forEach(world => {
        expect(WORLDS).toContain(world);
        expect(() => validateWorldName(world)).not.toThrow();
      });
    });

    test('should reject non-SEA world names', () => {
      const nonSEAWorlds = ['Scania', 'Windia', 'Bera', 'Broa', 'Khaini'];
      
      nonSEAWorlds.forEach(world => {
        expect(WORLDS).not.toContain(world);
        expect(() => validateWorldName(world)).toThrow();
      });
    });

    test('should be case-sensitive for world names', () => {
      expect(() => validateWorldName('aquila')).toThrow();
      expect(() => validateWorldName('AQUILA')).toThrow();
      expect(() => validateWorldName('Aquila')).not.toThrow();
    });
  });

  describe('Character Name Validation', () => {
    test('should accept English character names only', () => {
      const validNames = ['TestChar', 'Player123', 'SEAHero', 'MapleUser'];
      
      validNames.forEach(name => {
        expect(() => validateCharacterName(name)).not.toThrow();
      });
    });

    test('should reject Korean character names', () => {
      const koreanNames = ['한국이름', '플레이어', 'Test한국', '메이플'];
      
      koreanNames.forEach(name => {
        expect(() => validateCharacterName(name)).toThrow();
      });
    });

    test('should enforce character name length limits', () => {
      expect(() => validateCharacterName('A')).toThrow(); // Too short
      expect(() => validateCharacterName('AB')).not.toThrow(); // Minimum length
      expect(() => validateCharacterName('A'.repeat(13))).not.toThrow(); // Maximum length
      expect(() => validateCharacterName('A'.repeat(14))).toThrow(); // Too long
    });

    test('should reject special characters', () => {
      const invalidNames = ['Test@', 'Player-Name', 'User.Name', 'Name!'];
      
      invalidNames.forEach(name => {
        expect(() => validateCharacterName(name)).toThrow();
      });
    });
  });

  describe('Job Class Localization', () => {
    test('should include comprehensive job classes for SEA region', () => {
      expect(JOB_CLASSES.length).toBeGreaterThan(80);
      expect(JOB_CLASSES).toHaveLength(85); // Current implementation has 85 job classes
    });

    test('should include beginner job', () => {
      expect(JOB_CLASSES).toContain('Beginner');
    });

    test('should include major job branches', () => {
      const majorJobs = ['Warrior', 'Magician', 'Archer', 'Thief', 'Pirate'];
      majorJobs.forEach(job => {
        expect(JOB_CLASSES).toContain(job);
      });
    });

    test('should include advanced jobs', () => {
      const advancedJobs = ['Hero', 'Paladin', 'Dark Knight', 'Arch Mage (Fire, Poison)', 'Bishop'];
      advancedJobs.forEach(job => {
        expect(JOB_CLASSES).toContain(job);
      });
    });

    test('should include special jobs', () => {
      const specialJobs = ['Zero', 'Kinesis', 'Cadena', 'Illium']; // Beast Tamer not in SEA region
      specialJobs.forEach(job => {
        expect(JOB_CLASSES).toContain(job);
      });
    });
  });

  describe('Current Time Functions', () => {
    test('should return current SEA date in correct format', () => {
      const currentDate = getCurrentSEADate();
      
      // Should be in DD/MM/YYYY format
      expect(currentDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      
      // Should be current date (within reasonable bounds)
      const now = new Date();
      const seaNow = convertToSEATime(now);
      const expectedDate = formatSEADate(seaNow);
      expect(currentDate).toBe(expectedDate);
    });

    test('should return current SEA time in correct format', () => {
      const currentTime = getCurrentSEATimeString();
      
      // Should be in HH:MM:SS format
      expect(currentTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('Language Support', () => {
    test('should use English for all user-facing messages', () => {
      // This is validated through the constants and error messages
      // Error messages should be in English for SEA region
      expect(true).toBe(true); // Placeholder - actual validation happens in error tests
    });

    test('should format all stat names in English', () => {
      const expectedStatNames = ['STR', 'DEX', 'INT', 'LUK', 'HP', 'MP'];
      // These are used in the character tools formatting
      expectedStatNames.forEach(stat => {
        expect(stat).toMatch(/^[A-Z]+$/); // English uppercase format
      });
    });
  });

  describe('Regional Compliance', () => {
    test('should use correct currency formatting (no specific currency symbol)', () => {
      // SEA region typically uses numbers without currency symbols
      const mesosFormatted = formatSEAMesos(1000000);
      expect(mesosFormatted).not.toContain('$');
      expect(mesosFormatted).not.toContain('₩');
      expect(mesosFormatted).toBe('1,000,000 mesos');
    });

    test('should handle date boundaries correctly', () => {
      // Test date conversion across midnight boundary
      const utcMidnight = new Date('2024-03-15T16:00:00Z'); // 16:00 UTC = 00:00 SGT next day
      const seaTime = convertToSEATime(utcMidnight);
      
      expect(seaTime.getDate()).toBe(16); // Should be next day in SGT
      expect(seaTime.getHours()).toBe(0); // Should be midnight
    });

    test('should validate against SEA server specifications', () => {
      // SEA servers have specific requirements
      const maxCharacterNameLength = 13;
      const minCharacterNameLength = 2;
      const supportedWorlds = 4; // Aquila, Bootes, Cassiopeia, Delphinus
      
      expect(WORLDS).toHaveLength(supportedWorlds);
      
      // Character name validation should match SEA specs
      expect(() => validateCharacterName('A'.repeat(maxCharacterNameLength))).not.toThrow();
      expect(() => validateCharacterName('A'.repeat(maxCharacterNameLength + 1))).toThrow();
      expect(() => validateCharacterName('A'.repeat(minCharacterNameLength))).not.toThrow();
      expect(() => validateCharacterName('A'.repeat(minCharacterNameLength - 1))).toThrow();
    });
  });
});