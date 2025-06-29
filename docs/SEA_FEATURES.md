# MapleStory SEA Specific Features

This document outlines the features and differences specific to MapleStory SEA (Southeast Asia) region supported by this MCP server.

## Table of Contents
- [Overview](#overview)
- [Supported SEA Worlds](#supported-sea-worlds)
- [Job Class System](#job-class-system)
- [Character Name Requirements](#character-name-requirements)
- [API Limitations](#api-limitations)
- [Regional Differences](#regional-differences)
- [Time Zone Handling](#time-zone-handling)
- [Error Messages](#error-messages)

## Overview

MapleStory SEA operates as a separate region from other MapleStory versions (KMS, GMS, etc.) with its own API endpoints, content schedule, and regional customizations. This MCP server is specifically designed to work with the NEXON MapleStory SEA Open API.

## Supported SEA Worlds

The MapleStory SEA region consists of 4 worlds:

| World Name | Type | Population | Notes |
|------------|------|------------|--------|
| **Aquila** | Main | High | Most popular world |
| **Bootes** | Main | Medium | Balanced population |
| **Cassiopeia** | Main | Medium | Active community |
| **Delphinus** | Main | Low | Newest world |

### World Selection
- All API calls support world filtering
- Rankings are world-specific
- Guild searches are world-scoped
- Character transfers between worlds are not tracked by API

## Job Class System

MapleStory SEA supports **241 distinct job classes** organized into 9 main categories:

### 1. Explorer (15 jobs)
The original MapleStory classes with traditional advancement paths:
- **Warriors**: Hero, Paladin, Dark Knight
- **Magicians**: Arch Mage (Fire, Poison), Arch Mage (Ice, Lightning), Bishop
- **Archers**: Bowmaster, Marksman, Pathfinder
- **Thieves**: Night Lord, Shadower, Dual Blade
- **Pirates**: Buccaneer, Corsair, Cannoneer

### 2. Cygnus Knights (6 jobs)
Elite knights serving Empress Cygnus:
- Dawn Warrior, Blaze Wizard, Wind Archer, Night Walker, Thunder Breaker, Mihile

### 3. Heroes (6 jobs)
Legendary characters awakened to fight the Black Mage:
- Aran, Evan, Mercedes, Phantom, Luminous, Shade

### 4. Resistance (7 jobs)
Rebellion group fighting against oppression:
- Battle Mage, Wild Hunter, Mechanic, Blaster, Demon Slayer, Demon Avenger, Xenon

### 5. Nova (4 jobs)
Interdimensional beings from planet Nova:
- Kaiser, Angelic Buster, Cadena, Kain

### 6. Sengoku (2 jobs)
Classes from Japanese Sengoku period:
- Kanna, Hayato

### 7. Flora (4 jobs)
Classes connected to the Flora world:
- Adele, Ark, Illium, Khali

### 8. Anima (2 jobs)
Classes with spiritual and mystical abilities:
- Hoyoung, Lara

### 9. Jianghu (2 jobs)
Classes from martial arts world:
- Lynn, Mo Xuan

### Job Class Features
- **Primary Stat Tracking**: Each job has defined primary stats (STR, DEX, INT, LUK, or hybrid)
- **Advancement Requirements**: Level requirements for job advancement (10, 30, 60, 100, 200, 260)
- **Build Recommendations**: Optimized stat distribution suggestions per job
- **Availability Validation**: All listed jobs are confirmed available in SEA region

## Character Name Requirements

SEA character names have specific requirements due to regional policies:

### Allowed Characters
- **English letters**: A-Z, a-z
- **Numbers**: 0-9
- **No special characters**: No spaces, punctuation, or symbols
- **No Korean characters**: Unlike KMS, Korean characters are not allowed

### Length Requirements
- **Minimum**: 2 characters
- **Maximum**: 13 characters
- **Guild names**: 2-12 characters

### Examples
```
✅ Valid Names:
- "HeroPlayer123"
- "AquilaWarrior"
- "SampleUser99"

❌ Invalid Names:
- "Hero Player" (contains space)
- "영웅플레이어" (Korean characters)
- "Hero!" (special character)
- "H" (too short)
```

## API Limitations

The SEA API has specific limitations compared to other regions:

### Not Supported
- **Cube Probability**: Cube rates are not exposed via API
- **Notice System**: Korean-style notices are not available
- **Server Status**: Real-time server status is not provided
- **Cash Shop**: Cash item information is limited
- **Events**: Event-specific APIs are not available

### Data Update Schedule
- **Character Data**: Updated daily around 8:00 AM SGT (Singapore Time)
- **Rankings**: Updated multiple times per day
- **Union Data**: Updated daily
- **Guild Data**: Updated every few hours

## Regional Differences

### Language Support
- **API Response**: English only
- **Error Messages**: Localized to English for SEA users
- **Item Names**: English translations
- **Skill Names**: English translations

### Content Differences
- **Release Schedule**: SEA follows its own content release timeline
- **Job Balance**: May differ from KMS/GMS versions
- **Event Content**: Region-specific events and content
- **Cash Items**: SEA-specific cash shop items

### Cultural Adaptations
- **Time Format**: 24-hour format with SGT timezone
- **Date Format**: DD/MM/YYYY (SEA standard)
- **Number Format**: English locale formatting
- **Currency**: Mesos displayed in standard format

## Time Zone Handling

All time-related data uses **Singapore Time (SGT/UTC+8)**:

### Date Formats
```typescript
// API Input Format
"2024-01-15"  // YYYY-MM-DD

// Display Format
"15/01/2024"  // DD/MM/YYYY

// Timestamp Format
"2024-01-15T14:30:00+08:00"  // ISO with SGT timezone
```

### Daily Reset
- **Reset Time**: 12:00 AM SGT (midnight)
- **Data Updates**: 8:00 AM SGT
- **Rankings**: Multiple updates throughout the day

## Error Messages

All error messages are provided in English with SEA-specific context:

### Common Error Types
```typescript
// Authentication Errors
"Invalid NEXON API key provided for MapleStory SEA"
"Your API key does not have sufficient permissions for this operation"

// Validation Errors
"Character name must use English letters and numbers only"
"Invalid world name. SEA supports: Aquila, Bootes, Cassiopeia, Delphinus"

// Data Errors
"Character not found in MapleStory SEA servers"
"Guild data is temporarily unavailable. Please try again later"

// Rate Limiting
"MapleStory SEA API rate limit exceeded. Please try again later"
```

### Error Handling Best Practices
1. **Check API Key**: Ensure your NEXON API key is valid for SEA region
2. **Validate Input**: Use English characters only for names
3. **Respect Rate Limits**: Follow the conservative rate limiting guidelines
4. **Handle Timeouts**: SEA API can be slower than other regions
5. **Cache Appropriately**: Use the optimized cache TTL settings

## Performance Optimizations

### Rate Limiting (SEA-Optimized)
```typescript
{
  requestsPerSecond: 10,    // Conservative for stability
  requestsPerMinute: 500,   // Daily quota management
  burstLimit: 15,           // Handle traffic spikes
  retryDelay: 1500,         // Higher base delay
  maxRetryDelay: 45000,     // Extended retry window
  circuitBreakerThreshold: 10
}
```

### Caching Strategy (SEA-Specific TTL)
```typescript
{
  characterOCID: '2 hours',     // OCIDs rarely change
  characterBasic: '30 minutes', // Moderate update frequency
  characterStats: '15 minutes', // Stats change with equipment
  equipment: '10 minutes',      // Equipment changes during gameplay
  unionInfo: '30 minutes',      // Union updates moderately
  guildInfo: '1 hour',          // Guild info is stable
  rankings: '15 minutes'        // Rankings update frequently
}
```

### Connection Timeouts
```typescript
{
  characterBasic: 10000,    // 10s for basic data
  characterDetailed: 15000, // 15s for detailed data
  characterComplex: 20000,  // 20s for complex operations
  rankings: 25000,          // 25s for ranking queries
  maxTimeout: 60000         // 1 minute maximum
}
```

## Migration from Other Regions

If migrating from KMS or GMS MCP servers:

### Key Changes Required
1. **API Endpoints**: Use SEA-specific endpoints
2. **Character Names**: Remove Korean character support
3. **World Names**: Update to SEA world list
4. **Job Classes**: Use SEA job class mappings
5. **Error Handling**: Update error message expectations
6. **Rate Limits**: Apply SEA-optimized limits
7. **Timezone**: Convert to SGT/UTC+8

### Compatibility Notes
- **MCP Protocol**: Fully compatible with standard MCP
- **Claude Desktop**: Direct integration supported
- **Tool Structure**: Compatible with existing MCP tools
- **Response Format**: Standard MCP response structure

## Support and Resources

### Official Documentation
- [NEXON Open API Portal](https://openapi.nexon.com/en/game/maplestorysea/)
- [MapleStory SEA Official Website](https://maplestory.nexon.com/SEA/)

### Community Resources
- [MapleStory SEA Reddit](https://www.reddit.com/r/MapleStorySEA/)
- [Official Discord Servers](https://discord.gg/maplestorysea)

### Technical Support
- Check API key validity and permissions
- Verify character/guild names use English only
- Monitor rate limiting and implement appropriate delays
- Use the built-in health check tool for diagnostics

---

*This document is specific to MapleStory SEA region. For other regions (KMS, GMS, JMS, etc.), please refer to their respective documentation.*