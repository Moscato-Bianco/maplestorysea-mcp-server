/**
 * Job class utilities for MapleStory SEA
 * Provides functions for job validation, categorization, and advancement logic
 */

import {
  JOB_CLASSES,
  JOB_CATEGORIES,
  JOB_ADVANCEMENT_LEVELS,
  JOB_PRIMARY_STATS,
} from '../api/constants';

export type JobClass = (typeof JOB_CLASSES)[number];
export type JobCategory = keyof typeof JOB_CATEGORIES;

/**
 * Validate if a job class name is valid for SEA region
 */
export function validateJobClass(jobClass: string): boolean {
  return JOB_CLASSES.includes(jobClass as JobClass);
}

/**
 * Get job category for a given job class
 */
export function getJobCategory(jobClass: string): JobCategory | null {
  for (const [categoryKey, category] of Object.entries(JOB_CATEGORIES)) {
    // Handle array-type jobs
    if (Array.isArray(category.jobs) && category.jobs.includes(jobClass)) {
      return categoryKey as JobCategory;
    }

    // Handle nested job structure (like Explorers)
    if (typeof category.jobs === 'object' && !Array.isArray(category.jobs)) {
      for (const jobList of Object.values(category.jobs)) {
        if (Array.isArray(jobList) && jobList.includes(jobClass)) {
          return categoryKey as JobCategory;
        }
      }
    }
  }
  return null;
}

/**
 * Get all jobs in a specific category
 */
export function getJobsInCategory(category: JobCategory): string[] {
  const categoryData = JOB_CATEGORIES[category];

  if (Array.isArray(categoryData.jobs)) {
    return [...categoryData.jobs];
  }

  // Handle nested structure for Explorers
  if (typeof categoryData.jobs === 'object') {
    return Object.values(categoryData.jobs).flat();
  }

  return [];
}

/**
 * Check if a job class is available in SEA region
 */
export function isJobAvailableInSEA(jobClass: string): boolean {
  // Some jobs might not be available in SEA region
  const seaUnavailableJobs: string[] = [
    // Add any jobs that are not available in SEA
    // Based on research, most jobs are available in SEA
  ];

  return validateJobClass(jobClass) && !seaUnavailableJobs.includes(jobClass);
}

/**
 * Get job advancement path for Explorer classes
 */
export function getJobAdvancementPath(baseJob: string): string[] | null {
  const advancementPaths: Record<string, string[]> = {
    // Warrior paths
    Warrior: ['Fighter', 'Crusader', 'Hero'],
    Fighter: ['Crusader', 'Hero'],
    Crusader: ['Hero'],

    Page: ['White Knight', 'Paladin'],
    'White Knight': ['Paladin'],

    Spearman: ['Dragon Knight', 'Dark Knight'],
    'Dragon Knight': ['Dark Knight'],

    // Magician paths
    Magician: [
      'Wizard (Fire, Poison)',
      'Mage (Fire, Poison)',
      'Arch Mage (Fire, Poison)',
      'Wizard (Ice, Lightning)',
      'Mage (Ice, Lightning)',
      'Arch Mage (Ice, Lightning)',
      'Cleric',
      'Priest',
      'Bishop',
    ],
    'Wizard (Fire, Poison)': ['Mage (Fire, Poison)', 'Arch Mage (Fire, Poison)'],
    'Mage (Fire, Poison)': ['Arch Mage (Fire, Poison)'],
    'Wizard (Ice, Lightning)': ['Mage (Ice, Lightning)', 'Arch Mage (Ice, Lightning)'],
    'Mage (Ice, Lightning)': ['Arch Mage (Ice, Lightning)'],
    Cleric: ['Priest', 'Bishop'],
    Priest: ['Bishop'],

    // Archer paths
    Archer: ['Hunter', 'Ranger', 'Bowmaster', 'Crossbow Man', 'Sniper', 'Marksman'],
    Hunter: ['Ranger', 'Bowmaster'],
    Ranger: ['Bowmaster'],
    'Crossbow Man': ['Sniper', 'Marksman'],
    Sniper: ['Marksman'],

    // Thief paths
    Thief: ['Assassin', 'Hermit', 'Night Lord', 'Bandit', 'Chief Bandit', 'Shadower'],
    Assassin: ['Hermit', 'Night Lord'],
    Hermit: ['Night Lord'],
    Bandit: ['Chief Bandit', 'Shadower'],
    'Chief Bandit': ['Shadower'],

    // Pirate paths
    Pirate: ['Brawler', 'Marauder', 'Buccaneer', 'Gunslinger', 'Outlaw', 'Corsair'],
    Brawler: ['Marauder', 'Buccaneer'],
    Marauder: ['Buccaneer'],
    Gunslinger: ['Outlaw', 'Corsair'],
    Outlaw: ['Corsair'],
  };

  return advancementPaths[baseJob] || null;
}

/**
 * Get primary stat for a job class
 */
export function getJobPrimaryStat(jobClass: string): string | string[] {
  // Special cases
  if (jobClass === 'Xenon') {
    return [...JOB_PRIMARY_STATS.HYBRID];
  }

  const category = getJobCategory(jobClass);

  if (!category) {
    return 'STR'; // Default fallback
  }

  // Determine primary stat based on job category and specific job
  switch (category) {
    case 'EXPLORER':
      if (['Hero', 'Paladin', 'Dark Knight'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.WARRIOR;
      }
      if (['Arch Mage (Fire, Poison)', 'Arch Mage (Ice, Lightning)', 'Bishop'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.MAGICIAN;
      }
      if (['Bowmaster', 'Marksman', 'Pathfinder'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.ARCHER;
      }
      if (['Night Lord', 'Shadower', 'Dual Blade'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.THIEF;
      }
      if (['Buccaneer'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.PIRATE_STR;
      }
      if (['Corsair', 'Cannoneer'].includes(jobClass)) {
        return JOB_PRIMARY_STATS.PIRATE_DEX;
      }
      break;

    case 'CYGNUS_KNIGHTS':
      if (jobClass === 'Dawn Warrior' || jobClass === 'Mihile') {
        return JOB_PRIMARY_STATS.WARRIOR;
      }
      if (jobClass === 'Blaze Wizard') {
        return JOB_PRIMARY_STATS.MAGICIAN;
      }
      if (jobClass === 'Wind Archer') {
        return JOB_PRIMARY_STATS.ARCHER;
      }
      if (jobClass === 'Night Walker') {
        return JOB_PRIMARY_STATS.THIEF;
      }
      if (jobClass === 'Thunder Breaker') {
        return JOB_PRIMARY_STATS.PIRATE_STR;
      }
      break;

    case 'HEROES':
      if (jobClass === 'Aran') {
        return JOB_PRIMARY_STATS.WARRIOR;
      }
      if (jobClass === 'Evan' || jobClass === 'Luminous') {
        return JOB_PRIMARY_STATS.MAGICIAN;
      }
      if (jobClass === 'Mercedes') {
        return JOB_PRIMARY_STATS.ARCHER;
      }
      if (jobClass === 'Phantom' || jobClass === 'Shade') {
        return JOB_PRIMARY_STATS.THIEF;
      }
      break;

    case 'RESISTANCE':
      if (jobClass === 'Demon Slayer' || jobClass === 'Blaster') {
        return JOB_PRIMARY_STATS.WARRIOR;
      }
      if (jobClass === 'Battle Mage') {
        return JOB_PRIMARY_STATS.MAGICIAN;
      }
      if (jobClass === 'Wild Hunter' || jobClass === 'Mechanic') {
        return JOB_PRIMARY_STATS.ARCHER;
      }
      if (jobClass === 'Demon Avenger') {
        return 'HP'; // Special case for Demon Avenger
      }
      break;

    default:
      // For other categories, use intelligent defaults
      if (
        jobClass.toLowerCase().includes('warrior') ||
        jobClass.toLowerCase().includes('fighter')
      ) {
        return JOB_PRIMARY_STATS.WARRIOR;
      }
      if (jobClass.toLowerCase().includes('mage') || jobClass.toLowerCase().includes('wizard')) {
        return JOB_PRIMARY_STATS.MAGICIAN;
      }
      if (jobClass.toLowerCase().includes('archer') || jobClass.toLowerCase().includes('bow')) {
        return JOB_PRIMARY_STATS.ARCHER;
      }
      if (jobClass.toLowerCase().includes('thief') || jobClass.toLowerCase().includes('assassin')) {
        return JOB_PRIMARY_STATS.THIEF;
      }
  }

  return JOB_PRIMARY_STATS.WARRIOR; // Default fallback
}

/**
 * Check if a character can advance to a specific job at their current level
 */
export function canAdvanceToJob(
  currentLevel: number,
  targetJob: string,
  currentJob?: string
): boolean {
  // Special advancement requirements
  const jobLevelRequirements: Record<string, number> = {
    // 1st Job advancements
    Fighter: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Page: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Spearman: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    'Wizard (Fire, Poison)': JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    'Wizard (Ice, Lightning)': JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Cleric: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Hunter: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    'Crossbow Man': JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Assassin: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Bandit: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Brawler: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,
    Gunslinger: JOB_ADVANCEMENT_LEVELS.FIRST_JOB,

    // 2nd Job advancements
    Crusader: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    'White Knight': JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    'Dragon Knight': JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    'Mage (Fire, Poison)': JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    'Mage (Ice, Lightning)': JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Priest: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Ranger: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Sniper: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Hermit: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    'Chief Bandit': JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Marauder: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,
    Outlaw: JOB_ADVANCEMENT_LEVELS.SECOND_JOB,

    // 3rd Job advancements
    Hero: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Paladin: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    'Dark Knight': JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    'Arch Mage (Fire, Poison)': JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    'Arch Mage (Ice, Lightning)': JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Bishop: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Bowmaster: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Marksman: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    'Night Lord': JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Shadower: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Buccaneer: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
    Corsair: JOB_ADVANCEMENT_LEVELS.THIRD_JOB,
  };

  const requiredLevel = jobLevelRequirements[targetJob];
  if (requiredLevel === undefined) {
    // For special classes, they start at level 1 or have different requirements
    return true;
  }

  return currentLevel >= requiredLevel;
}

/**
 * Get job description for display
 */
export function getJobDescription(jobClass: string): string {
  const descriptions: Record<string, string> = {
    // Explorer descriptions
    Hero: 'A master swordsman with powerful melee attacks and high defense.',
    Paladin: 'A holy warrior with healing abilities and strong defensive skills.',
    'Dark Knight': 'A spear-wielding warrior who sacrifices HP for powerful attacks.',
    'Arch Mage (Fire, Poison)': 'A master of fire and poison magic with area-of-effect spells.',
    'Arch Mage (Ice, Lightning)': 'A master of ice and lightning magic with stunning abilities.',
    Bishop: 'A holy magician with powerful healing and support abilities.',
    Bowmaster: 'An archer specialized in bow attacks with nature-based skills.',
    Marksman: 'A crossbow expert with precise long-range attacks.',
    Pathfinder: 'A versatile archer with unique relic-based abilities.',
    'Night Lord': 'A swift assassin with critical hit mastery and throwing stars.',
    Shadower: 'A melee thief with stealth abilities and powerful close combat skills.',
    'Dual Blade': 'A thief wielding two blades with swift combo attacks.',
    Buccaneer: 'A fist-fighting pirate with powerful energy-based attacks.',
    Corsair: 'A gun-wielding pirate with explosive battleship skills.',
    Cannoneer: 'A pirate specialized in cannon attacks with high damage output.',

    // Cygnus Knights descriptions
    'Dawn Warrior': 'A Cygnus Knight warrior with sun and moon stance abilities.',
    'Blaze Wizard': 'A Cygnus Knight magician with powerful flame magic.',
    'Wind Archer': 'A Cygnus Knight archer with wind-based attacks.',
    'Night Walker': 'A Cygnus Knight thief with darkness-based abilities.',
    'Thunder Breaker': 'A Cygnus Knight pirate with lightning-powered attacks.',
    Mihile: 'A shield-bearing Cygnus Knight with defensive mastery.',

    // Heroes descriptions
    Aran: 'A legendary warrior awakened from ice with powerful polearm skills.',
    Evan: 'A magician bonded with a dragon, using elemental magic.',
    Mercedes: 'An elven archer with graceful dual-bow techniques.',
    Phantom: "A gentleman thief who can steal and use other classes' skills.",
    Luminous: 'A magician wielding both light and dark magic.',
    Shade: 'A forgotten hero with spirit-based attacks and supportive abilities.',
  };

  return descriptions[jobClass] || 'A skilled adventurer with unique abilities.';
}

/**
 * Format job class name for display (handle special characters)
 */
export function formatJobClassName(jobClass: string): string {
  return jobClass.replace(/\(/g, '(').replace(/\)/g, ')');
}

/**
 * Check if job is a beginner class
 */
export function isBeginnerJob(jobClass: string): boolean {
  const beginnerJobs = ['Beginner', 'Warrior', 'Magician', 'Archer', 'Thief', 'Pirate'];
  return beginnerJobs.includes(jobClass);
}

/**
 * Get recommended build type for a job class
 */
export function getRecommendedBuild(jobClass: string): string {
  const builds: Record<string, string> = {
    Hero: 'STR focused with combat mastery',
    Paladin: 'STR/HP hybrid with defensive skills',
    'Dark Knight': 'STR/HP with sacrifice skills',
    'Arch Mage (Fire, Poison)': 'INT focused with poison mastery',
    'Arch Mage (Ice, Lightning)': 'INT focused with teleport mastery',
    Bishop: 'INT/MP with healing and buff skills',
    Bowmaster: 'DEX focused with hurricane build',
    Marksman: 'DEX focused with snipe build',
    'Night Lord': 'LUK focused with critical hit build',
    Shadower: 'LUK focused with meso explosion build',
    Buccaneer: 'STR focused with transformation skills',
    Corsair: 'DEX focused with battleship build',
  };

  return builds[jobClass] || 'Balanced stat distribution recommended';
}
