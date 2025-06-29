# MapleStory SEA MCP Server API Reference

## Overview

This document provides detailed API reference for all MCP tools available in the MapleStory SEA MCP Server. Each tool provides structured access to NEXON's MapleStory SEA Open API data.

## Authentication

All API calls require a valid NEXON API key. Set it in your MCP configuration:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Rate Limits

- **Per Second**: 8 requests per second (optimized for SEA API stability)
- **Per Minute**: 500 requests per minute
- **Burst Limit**: 12 concurrent requests
- **Retry Strategy**: Exponential backoff with jitter (1.5s base delay, max 45s)
- **Data Updates**: Character data is updated daily around 8 AM SGT (Singapore Time)

## Error Handling

All tools return consistent error responses:

```typescript
{
  success: false,
  error: "Error description",
  code?: "ERROR_CODE",
  metadata?: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

## Character Tools

### get_character_basic_info

Retrieves basic character information including level, job, world, and guild.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    characterName: string,
    level: number,
    job: string,
    world: string,
    guildName: string | null,
    exp: number,
    expRate: string,
    ocid: string,
    accessFlag: boolean,
    liberationQuestClearFlag: boolean
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

**Example Usage:**
```typescript
// Claude Desktop query
"Get basic info for character 'AquilaHero'"

// Direct API call
{
  characterName: "AquilaHero"
}
```

### get_character_stats

Retrieves detailed character statistics including combat stats, damage, and critical stats.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    basicStats: {
      str: number,
      dex: number,
      int: number,
      luk: number,
      hp: number,
      mp: number
    },
    combatStats: {
      damage: number,
      bossDamage: number,
      ignoreDefense: number,
      criticalRate: number,
      criticalDamage: number,
      statusResistance: number
    },
    defenseStats: {
      defense: number,
      speed: number,
      jump: number
    },
    allStats: StatDetail[],
    combatPower: number
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

**Example Usage:**
```typescript
// Claude Desktop query
"Get detailed stats for character 'BootesWarrior'"

// Direct API call
{
  characterName: "BootesWarrior",
  date: "2024-01-15"
}
```

### get_character_equipment

Retrieves character equipment and item details with enhancement analysis.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    equipment: EquipmentItem[],
    cashEquipment: CashItem[],
    analysis: {
      totalEnhancementScore: number,
      setEffects: SetEffect[],
      combatPowerContribution: number,
      equipmentSummary: {
        totalItems: number,
        enhancedItems: number,
        starforceItems: number,
        uniqueItems: number,
        legendaryItems: number
      }
    }
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

**Example Usage:**
```typescript
// Claude Desktop query
"Show equipment list for character 'CassiopeiaMage'"

// Direct API call
{
  characterName: "CassiopeiaMage"
}
```

### get_character_full_info

Retrieves comprehensive character information combining basic info, stats, and equipment.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    basic: CharacterBasic,
    stats: CharacterStats,
    equipment: CharacterEquipment,
    summary: {
      overallPower: number,
      mainJob: string,
      totalLevel: number,
      guildInfo: string | null
    }
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

### get_job_class_info

Get detailed information about a specific job class in MapleStory SEA including category, primary stats, and advancement paths.

**Parameters:**
- `jobClass` (string, required): Job class name (e.g., "Hero", "Arch Mage (Fire, Poison)", "Aran")

**Returns:**
```typescript
{
  success: true,
  data: {
    jobClass: string,
    category: string,
    primaryStat: string | string[],
    description: string,
    isBeginner: boolean,
    recommendedBuild: string,
    availableInSEA: boolean
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

**Example Usage:**
```typescript
// Claude Desktop query
"Get detailed information about Hero job class"

// Direct API call
{
  jobClass: "Hero"
}
```

**Supported Job Classes:**
All 241 SEA job classes are supported, organized into 9 categories:
- **Explorer**: Hero, Paladin, Dark Knight, Arch Mage (Fire, Poison), Arch Mage (Ice, Lightning), Bishop, Bowmaster, Marksman, Pathfinder, Night Lord, Shadower, Dual Blade, Buccaneer, Corsair, Cannoneer
- **Cygnus Knights**: Dawn Warrior, Blaze Wizard, Wind Archer, Night Walker, Thunder Breaker, Mihile
- **Heroes**: Aran, Evan, Mercedes, Phantom, Luminous, Shade
- **Resistance**: Battle Mage, Wild Hunter, Mechanic, Blaster, Demon Slayer, Demon Avenger, Xenon
- **Nova**: Kaiser, Angelic Buster, Cadena, Kain
- **Sengoku**: Kanna, Hayato
- **Flora**: Adele, Ark, Illium, Khali
- **Anima**: Hoyoung, Lara
- **Jianghu**: Lynn, Mo Xuan

## Union Tools

### get_union_info

Retrieves union level, grade, and artifact information.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    unionLevel: number,
    unionGrade: string,
    unionArtifactLevel: number,
    unionArtifactExp: number,
    unionArtifactPoint: number
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

### get_union_raider

Retrieves union raider board configuration and block details.

**Parameters:**
- `characterName` (string, required): Name of the character to query
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to latest)

**Returns:**
```typescript
{
  success: true,
  data: {
    raiderStat: string[],
    raiderOccupiedStat: string[],
    raiderBlocks: RaiderBlock[],
    analysis: {
      totalBlocks: number,
      activeBlocks: number,
      statDistribution: Record<string, number>
    }
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

### get_union_ranking

Retrieves union power rankings for a specific world.

**Parameters:**
- `worldName` (string, optional): World name (e.g., "Aquila", "Bootes")
- `page` (number, optional): Page number (default: 1)

**Returns:**
```typescript
{
  success: true,
  data: {
    ranking: UnionRankingEntry[],
    currentPage: number,
    totalPages: number,
    worldName: string
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

## Guild Tools

### get_guild_info

Retrieves guild information, members, and skill details.

**Parameters:**
- `guildName` (string, required): Name of the guild to query
- `worldName` (string, optional): World name for more accurate search

**Returns:**
```typescript
{
  success: true,
  data: {
    guildId: string,
    guildName: string,
    worldName: string,
    guildLevel: number,
    guildFame: number,
    guildPoint: number,
    guildMaster: string,
    guildMemberCount: number,
    guildMembers: GuildMember[],
    guildSkills: GuildSkill[],
    noblesseSkills: NoblesseSkill[],
    analysis: {
      averageLevel: number,
      jobDistribution: Record<string, number>,
      memberActivity: {
        activeMembers: number,
        inactiveMembers: number
      }
    }
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

### get_guild_ranking

Retrieves guild level rankings for a specific world.

**Parameters:**
- `worldName` (string, optional): World name (e.g., "Aquila", "Bootes")
- `rankingType` (string, optional): "level" or "fame" (default: "level")
- `page` (number, optional): Page number (default: 1)

**Returns:**
```typescript
{
  success: true,
  data: {
    ranking: GuildRankingEntry[],
    currentPage: number,
    totalPages: number,
    worldName: string,
    rankingType: string
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

## Ranking Tools

### get_overall_ranking

Retrieves overall level rankings with filtering options.

**Parameters:**
- `worldName` (string, optional): World name filter
- `worldType` (string, optional): "normal" or "reboot"
- `className` (string, optional): Job class filter
- `ocid` (string, optional): Specific character OCID
- `page` (number, optional): Page number (default: 1)

**Returns:**
```typescript
{
  success: true,
  data: {
    ranking: OverallRankingEntry[],
    currentPage: number,
    totalPages: number,
    filters: {
      worldName: string | null,
      className: string | null,
      worldType: string | null
    },
    statistics: {
      totalCharacters: number,
      averageLevel: number,
      topJob: string,
      levelDistribution: Record<string, number>
    }
  },
  metadata: {
    executionTime: number,
    apiCalls: number,
    cacheHit: boolean
  }
}
```

## SEA API Limitations

**Important:** The following tools are NOT available in MapleStory SEA API:

### Unsupported Features
- **Notices and Announcements**: SEA API does not provide game notices
- **Cube Probabilities**: Enhancement probability data not available
- **Starforce Probabilities**: Enhancement probability data not available
- **Server Status**: Real-time server status not provided

### Alternative Solutions
- For notices: Check official MapleStory SEA website or social media
- For probabilities: Refer to community databases or official documentation
- For server status: Use the `health_check` tool to verify API connectivity

## System Tools

### health_check

Checks the comprehensive health status of the MCP server and all components.

**Parameters:**
- `detailed` (boolean, optional): Include detailed health information (default: true)
- `component` (string, optional): Check specific component only ("nexon-api", "cache", "memory", "process")
- `timeout` (number, optional): Timeout for health checks in milliseconds (default: 5000)

**Returns:**
```typescript
{
  success: true,
  data: {
    status: "healthy" | "degraded" | "unhealthy",
    uptime: number,
    timestamp: string,
    version?: string,
    details: {
      "nexon-api": ComponentHealth,
      "cache": ComponentHealth,
      "memory": ComponentHealth,
      "process": ComponentHealth
    },
    mode: "quick" | "full" | "component"
  },
  metadata: {
    executionTime: number,
    cacheHit: boolean,
    apiCalls: number
  }
}
```

## Data Types

### Core Types

#### CharacterBasic
```typescript
interface CharacterBasic {
  date: string;
  character_name: string;
  world_name: string;
  character_gender: string;
  character_class: string;
  character_class_level: string;
  character_level: number;
  character_exp: number;
  character_exp_rate: string;
  character_guild_name?: string;
  character_image: string;
  character_date_create: string;
  access_flag: string;
  liberation_quest_clear_flag: string;
}
```

#### CharacterStat
```typescript
interface CharacterStat {
  date: string;
  character_class: string;
  final_stat: StatDetail[];
  remain_ap: number;
}

interface StatDetail {
  stat_name: string;
  stat_value: string;
}
```

#### EquipmentItem
```typescript
interface EquipmentItem {
  item_equipment_part: string;
  equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description?: string;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender?: string;
  item_total_option: ItemOption;
  item_base_option: ItemOption;
  potential_option_grade?: string;
  additional_potential_option_grade?: string;
  potential_option_1?: string;
  potential_option_2?: string;
  potential_option_3?: string;
  additional_potential_option_1?: string;
  additional_potential_option_2?: string;
  additional_potential_option_3?: string;
  equipment_level_increase: number;
  item_exceptional_option: ItemOption;
  item_add_option: ItemOption;
  growth_exp: number;
  growth_level: number;
  scroll_upgrade: string;
  cuttable_count: string;
  golden_hammer_flag: string;
  scroll_resilience_count: string;
  scroll_upgradeable_count: string;
  soul_name?: string;
  soul_option?: string;
  item_etc_option: ItemOption;
  starforce: string;
  starforce_scroll_flag: string;
  item_starforce_option: ItemOption;
  special_ring_level: number;
  date_expire?: string;
}
```

### World Names

Supported world names for MapleStory SEA:
- Aquila
- Bootes
- Cassiopeia
- Delphinus

**Note:** SEA API only supports these four worlds, unlike the Korean API which supports more worlds.

### Job Classes

Major job categories supported in SEA:
- Warrior classes (Hero, Paladin, Dark Knight, etc.)
- Magician classes (Arch Mage (Ice, Lightning), Arch Mage (Fire, Poison), Bishop, etc.)
- Archer classes (Bow Master, Marksman, Wind Archer, etc.)
- Thief classes (Night Lord, Shadower, Dual Blade, etc.)
- Pirate classes (Buccaneer, Corsair, Cannoneer, etc.)
- Cygnus Knights classes (Dawn Warrior, Blaze Wizard, etc.)
- Resistance classes (Battle Mage, Wild Hunter, etc.)
- Nova classes (Kaiser, Angelic Buster, Cadena, etc.)
- Other specialized classes (Zero, Kinesis, Illium, etc.)

## Best Practices

### Caching (SEA Optimized)
- Character OCID: 1 hour (rarely changes)
- Character basic info: 30 minutes
- Character stats: 15 minutes
- Character equipment: 10 minutes
- Union info: 30 minutes
- Union raider: 30 minutes
- Guild info: 1 hour
- Rankings: 30 minutes

### Error Handling
- All tools implement automatic retry for transient failures
- Rate limiting is handled automatically with exponential backoff
- Network timeouts are set to reasonable defaults (5-10 seconds)

### Performance
- Use batch queries when possible
- Leverage caching for repeated requests
- Monitor rate limits to avoid hitting daily quotas

### Date Formats
- Always use YYYY-MM-DD format for date parameters
- Dates should be in SGT (Singapore Standard Time)
- Data is typically available for the previous day and earlier
- Character data updates daily around 8 AM SGT

## Rate Limiting Details

The server implements sophisticated rate limiting:
- **Request Queue**: Automatic queuing with FIFO processing
- **Exponential Backoff**: Smart retry logic for rate limit errors
- **Error Recovery**: Automatic fallback strategies
- **Performance Monitoring**: Built-in metrics and health checking

## Security

- API keys are automatically sanitized in logs
- Sensitive data is redacted from error messages
- All requests are logged for audit purposes
- Health checks monitor security events

---

For more examples and detailed usage patterns, see [EXAMPLES.md](EXAMPLES.md).