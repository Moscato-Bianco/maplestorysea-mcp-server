/**
 * Equipment analysis utilities for MapleStory items
 */

export interface EquipmentEnhancement {
  starforceLevel: number;
  scrollUpgrades: number;
  potentialGrade: string;
  additionalPotentialGrade: string;
}

export interface SetEffect {
  setName: string;
  activeCount: number;
  totalCount: number;
  effects: Array<{
    requiredCount: number;
    description: string;
    stats: Record<string, number>;
  }>;
}

/**
 * Parse starforce level from item data
 */
export function parseStarforceLevel(item: any): number {
  if (!item) return 0;

  // Check starforce field
  if (item.starforce && typeof item.starforce === 'string') {
    const starforce = parseInt(item.starforce, 10);
    return isNaN(starforce) ? 0 : starforce;
  }

  // Check item name for star indicators
  if (item.item_name && typeof item.item_name === 'string') {
    const starMatch = item.item_name.match(/\((\d+)성\)/);
    if (starMatch) {
      return parseInt(starMatch[1], 10);
    }
  }

  return 0;
}

/**
 * Parse scroll upgrade count from item data
 */
export function parseScrollUpgrades(item: any): number {
  if (!item) return 0;

  // Check upgrade slots used vs available
  const upgradeCount = item.scroll_upgrade || 0;
  const maxUpgrade = item.scroll_upgradeable_count || 0;

  return Math.min(upgradeCount, maxUpgrade);
}

/**
 * Parse potential grade from item data
 */
export function parsePotentialGrade(item: any): string {
  if (!item || !item.potential_option_grade) return 'None';

  const grade = item.potential_option_grade.toLowerCase();

  switch (grade) {
    case 'rare':
    case '레어':
      return 'Rare';
    case 'epic':
    case '에픽':
      return 'Epic';
    case 'unique':
    case '유니크':
      return 'Unique';
    case 'legendary':
    case '레전드리':
      return 'Legendary';
    default:
      return 'None';
  }
}

/**
 * Calculate total combat power from stats
 */
export function calculateCombatPower(stats: Record<string, number>): number {
  // Simplified combat power calculation (actual formula is more complex)
  const str = stats.str || 0;
  const dex = stats.dex || 0;
  const int = stats.int || 0;
  const luk = stats.luk || 0;
  const attackPower = stats.attack_power || 0;
  const magicPower = stats.magic_power || 0;

  // Basic stat contribution (simplified)
  const primaryStat = Math.max(str, dex, int, luk);
  const weaponPower = Math.max(attackPower, magicPower);

  return Math.floor(primaryStat * 1.5 + weaponPower * 2);
}

/**
 * Analyze equipment for set effects
 */
export function analyzeSetEffects(equipment: any[]): SetEffect[] {
  if (!equipment || !Array.isArray(equipment)) return [];

  const setMap = new Map<string, number>();

  // Count items by set name
  equipment.forEach((item) => {
    if (item?.item_equipment_part && item?.item_name) {
      const setName = extractSetName(item.item_name);
      if (setName) {
        setMap.set(setName, (setMap.get(setName) || 0) + 1);
      }
    }
  });

  // Convert to set effects array
  const setEffects: SetEffect[] = [];

  setMap.forEach((count, setName) => {
    const setEffect: SetEffect = {
      setName,
      activeCount: count,
      totalCount: getSetTotalCount(setName),
      effects: getSetEffectDetails(setName, count),
    };
    setEffects.push(setEffect);
  });

  return setEffects.filter((set) => set.activeCount >= 2); // Only show sets with 2+ items
}

/**
 * Extract set name from item name
 */
function extractSetName(itemName: string): string | null {
  if (!itemName) return null;

  // Common MapleStory set patterns
  const setPatterns = [
    /(.+)\s세트/, // Korean set pattern
    /(.+)\sSet/i, // English set pattern
    /(펜살리르|루타비스|넥슨|CRA|아케인|압솔|에테르넬|제네시스)/i, // Known set names
  ];

  for (const pattern of setPatterns) {
    const match = itemName.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Get total count for a set
 */
function getSetTotalCount(setName: string): number {
  // Common set sizes (simplified)
  const knownSets: Record<string, number> = {
    펜살리르: 7,
    루타비스: 8,
    CRA: 4,
    아케인: 6,
    압솔: 6,
    에테르넬: 6,
    제네시스: 6,
  };

  return knownSets[setName] || 8; // Default to 8 pieces
}

/**
 * Get set effect details
 */
function getSetEffectDetails(
  setName: string,
  activeCount: number
): Array<{
  requiredCount: number;
  description: string;
  stats: Record<string, number>;
}> {
  // Simplified set effects (actual effects are much more complex)
  const effects = [];

  for (let i = 2; i <= activeCount; i++) {
    effects.push({
      requiredCount: i,
      description: `${setName} ${i}세트 효과`,
      stats: {
        str: i * 10,
        dex: i * 10,
        int: i * 10,
        luk: i * 10,
        attack_power: i * 5,
        magic_power: i * 5,
      },
    });
  }

  return effects;
}

/**
 * Calculate enhancement level score
 */
export function calculateEnhancementScore(enhancement: EquipmentEnhancement): number {
  let score = 0;

  // Starforce contributes most to enhancement score
  score += enhancement.starforceLevel * 10;

  // Scroll upgrades contribute moderately
  score += enhancement.scrollUpgrades * 5;

  // Potential grade contributes significantly
  switch (enhancement.potentialGrade) {
    case 'Legendary':
      score += 100;
      break;
    case 'Unique':
      score += 50;
      break;
    case 'Epic':
      score += 25;
      break;
    case 'Rare':
      score += 10;
      break;
  }

  // Additional potential grade bonus
  switch (enhancement.additionalPotentialGrade) {
    case 'Legendary':
      score += 50;
      break;
    case 'Unique':
      score += 25;
      break;
    case 'Epic':
      score += 15;
      break;
    case 'Rare':
      score += 5;
      break;
  }

  return score;
}

/**
 * Analyze individual equipment piece
 */
export function analyzeEquipmentPiece(item: any): EquipmentEnhancement {
  return {
    starforceLevel: parseStarforceLevel(item),
    scrollUpgrades: parseScrollUpgrades(item),
    potentialGrade: parsePotentialGrade(item),
    additionalPotentialGrade: parsePotentialGradeAdditional(item), // For additional potential
  };
}

/**
 * Parse additional potential grade
 */
function parsePotentialGradeAdditional(item: any): string {
  if (!item || !item.additional_potential_option_grade) return 'None';

  const grade = item.additional_potential_option_grade.toLowerCase();

  switch (grade) {
    case 'rare':
    case '레어':
      return 'Rare';
    case 'epic':
    case '에픽':
      return 'Epic';
    case 'unique':
    case '유니크':
      return 'Unique';
    case 'legendary':
    case '레전드리':
      return 'Legendary';
    default:
      return 'None';
  }
}
