# MapleStory SEA MCP Server Usage Examples

This document provides comprehensive examples of how to use the MapleStory SEA MCP Server with Claude Desktop and other MCP-compatible clients.

## Table of Contents

1. [Basic Character Queries](#basic-character-queries)
2. [Advanced Character Analysis](#advanced-character-analysis)
3. [Union Management](#union-management)
4. [Guild Operations](#guild-operations)
5. [Ranking Analysis](#ranking-analysis)
6. [Error Handling Examples](#error-handling-examples)
7. [Performance Optimization](#performance-optimization)

## Basic Character Queries

### Simple Character Information

**Claude Desktop Query:**
```
Get basic info for character "AquilaHero"
```

**Expected Response:**
- Character level and job
- Current world (Aquila/Bootes/Cassiopeia/Delphinus)
- Guild information (if any)
- Experience points and progression

### Character Stats Analysis

**Claude Desktop Query:**
```
Analyze detailed stats for character "BootesWarrior"
```

**Expected Response:**
- Basic stats (STR, DEX, INT, LUK, HP, MP)
- Combat stats (damage, critical rate, etc.)
- Defense and movement stats
- Overall combat power rating

### Equipment Overview

**Claude Desktop Query:**
```
Show equipment information for character "CassiopeiaArcher" and analyze enhancement status
```

**Expected Response:**
- Complete equipment list
- Enhancement levels and starforce
- Potential options analysis
- Set effect summary
- Equipment value assessment

## Advanced Character Analysis

### Comprehensive Character Profile

**Claude Desktop Query:**
```
Provide comprehensive analysis of character "DelphiniusMage" including basic info, stats, equipment, and union
```

**Expected Response:**
- Complete character overview
- Strength and weakness analysis
- Equipment optimization suggestions
- Union contribution analysis
- Overall progression assessment

### Character Comparison

**Claude Desktop Query:**
```
Compare stats between "CharacterA" and "CharacterB"
```

**Expected Response:**
- Side-by-side stat comparison
- Combat power differences
- Equipment quality comparison
- Progression recommendations

### Character Progress Tracking

**Claude Desktop Query:**
```
Compare "MyCharacter" stats between 2024-01-15 and 2024-01-20
```

**Expected Response:**
- Stat changes over time
- Equipment upgrades
- Level progression
- Power increase analysis

## Union Management

### Union Analysis

**Claude Desktop Query:**
```
Analyze union information for character "AquilaHero" in detail
```

**Expected Response:**
- Union level and grade
- Artifact information
- Raider board configuration
- Block placement analysis
- Optimization suggestions

### Union Rankings

**Claude Desktop Query:**
```
Show union power rankings for Aquila world, top 50 players
```

**Expected Response:**
- Top 50 union power rankings
- Power level distribution
- Growth patterns
- Regional competition analysis

## Guild Operations

### Guild Overview

**Claude Desktop Query:**
```
Get information for guild "EliteGuild" in Bootes world
```

**Expected Response:**
- Guild basic information
- Member list and levels
- Guild skills and benefits
- Activity analysis
- Member job distribution

### Guild Search

**Claude Desktop Query:**
```
Search for guilds containing "Dragon" in Cassiopeia world
```

**Expected Response:**
- Matching guild list with fuzzy search
- Guild levels and member counts
- Guild master information
- Activity indicators

### Guild Rankings

**Claude Desktop Query:**
```
Show guild level rankings for all worlds, page 1
```

**Expected Response:**
- Top guild rankings
- Guild level distribution
- Member count analysis
- Regional guild patterns

## Ranking Analysis

### World Rankings

**Claude Desktop Query:**
```
Show top 20 Arch Mage (Ice, Lightning) job rankings for Delphinus world
```

**Expected Response:**
- Top 20 characters in specified job
- Level and experience information
- Guild affiliations
- Ranking trends

### Cross-World Comparison

**Claude Desktop Query:**
```
Compare top rankers between Aquila and Bootes worlds
```

**Expected Response:**
- World population comparison
- Average level differences
- Job distribution analysis
- Competitive landscape overview

### Character Ranking Position

**Claude Desktop Query:**
```
Find ranking position for character "TopPlayer" in overall rankings
```

**Expected Response:**
- Exact ranking position
- Surrounding players
- Ranking context
- Competitive analysis

## Error Handling Examples

### Character Not Found

**Query:**
```
Get character info for "NonExistentCharacter"
```

**Response:**
```
Character not found. Please check:
- Character name spelling (English letters and numbers only)
- Character exists in MapleStory SEA servers
- Recently created characters may need 24 hours to appear
```

### Invalid World Name

**Query:**
```
Get guild info for "TestGuild" in "InvalidWorld"
```

**Response:**
```
Invalid world name. MapleStory SEA supports only:
- Aquila
- Bootes  
- Cassiopeia
- Delphinus
```

### API Rate Limit

**Query during heavy usage:**
```
Multiple rapid character queries
```

**Response:**
```
API rate limit reached. Please:
- Reduce request frequency (max 8 per second)
- Wait before retrying
- Cached data will be used when available
```

### Network Issues

**Query during connectivity issues:**
```
Any character query during network problems
```

**Response:**
```
Network connection issue occurred:
- Check internet connection
- Retry after a moment
- Server status is being checked
```

## Performance Optimization

### Using Cache Effectively

**Claude Desktop Query:**
```
Get character info for "FrequentlyQueriedChar" (second request)
```

**Response includes:**
```
✅ Using cached data for faster response (response time: 50ms)
- Character basic info cached for 30 minutes
- Equipment info cached for 10 minutes
- For latest data, specify a recent date parameter
```

### Batch Query Optimization

**Claude Desktop Query:**
```
Efficiently get all member info for guild "LargeGuild"
```

**Response approach:**
```
Processing with batch optimization:
1. Get guild basic info (1 API call)
2. Check member list (cache utilized)
3. Individual member info if needed (batch processing)
4. Consolidate and analyze results
```

### Smart Caching Strategy

**Claude Desktop Query:**
```
Analyze weekly progress trends for character "RegularChar"
```

**Response includes:**
```
Cache optimization strategy:
- Basic info: Cache utilized (low change frequency)
- Experience: Real-time query (frequent changes)
- Equipment: Partial cache (medium frequency)
- Stats: Real-time query needed
```

## Advanced Use Cases

### Character Progression Monitoring

**Claude Desktop Query:**
```
Analyze growth patterns for character "GrowingChar" over the past month and suggest next goals
```

**Expected Analysis:**
- Level progression rate
- Equipment improvement timeline
- Stat growth patterns
- Recommended next steps

### Guild Management Dashboard

**Claude Desktop Query:**
```
Show comprehensive status dashboard for guild "ManagementGuild"
```

**Expected Dashboard:**
- Member activity summary
- Level distribution chart
- Recent achievements
- Guild goal progress

### Market Analysis

**Claude Desktop Query:**
```
Analyze equipment trends among top rankers in Aquila world
```

**Expected Analysis:**
- Popular equipment choices
- Enhancement level trends
- Potential option patterns
- Market insights

## Integration Examples

### Claude Desktop Workflows

1. **Daily Character Check**
   ```
   Summarize today's changes for my characters
   ```

2. **Guild Weekly Report**
   ```
   Create this week's activity report for our guild
   ```

3. **Competition Analysis**
   ```
   Analyze top rankers similar to my character level
   ```

### API Integration Patterns

```typescript
// Morning routine: Check character progress
async function dailyCharacterCheck(characters: string[]) {
  const results = await Promise.all(
    characters.map(name => getCharacterFullInfo({ characterName: name }))
  );
  return analyzeDailyProgress(results);
}

// Weekly guild report
async function weeklyGuildReport(guildName: string, worldName: string) {
  const guildInfo = await getGuildInfo({ guildName, worldName });
  const memberProgress = await analyzeGuildMemberProgress(guildInfo.data.guildMembers);
  return generateGuildReport(guildInfo, memberProgress);
}
```

## Tips for Better Results

### Query Optimization

1. **Be Specific**
   ```
   ❌ "Show character info"
   ✅ "Get basic info and stats for character 'AquilaHero'"
   ```

2. **Use Context**
   ```
   ❌ "Show rankings"
   ✅ "Show Arch Mage (Ice, Lightning) rankings for Bootes world, page 1"
   ```

3. **Specify Requirements**
   ```
   ❌ "Guild info"
   ✅ "Get member status and activity analysis for 'EliteGuild' in Cassiopeia world"
   ```

### Error Prevention

1. **Check Character Names**
   - Use exact character names (English letters and numbers only)
   - Verify character exists in specified SEA world
   - Character names are case-sensitive

2. **Manage Rate Limits**
   - Space out requests when doing bulk analysis
   - Use cached data when possible
   - Maximum 8 requests per second

3. **Handle Timeouts**
   - Break large requests into smaller chunks
   - Retry failed requests with exponential backoff
   - Use reasonable timeout values

### SEA-Specific Considerations

1. **World Names**
   - Only use: Aquila, Bootes, Cassiopeia, Delphinus
   - World names are case-sensitive

2. **Character Names**
   - English letters and numbers only (no Korean characters)
   - 2-13 characters in length
   - No special characters or spaces

3. **Available Features**
   - Character information ✅
   - Union system ✅
   - Guild operations ✅
   - Rankings ✅
   - Notices ❌ (not supported in SEA API)
   - Cube probabilities ❌ (not supported in SEA API)
   - Server status ❌ (not supported in SEA API)

## Troubleshooting

### Common Issues

1. **"Character not found" error**
   - Verify character name spelling
   - Ensure character is in SEA servers
   - Check if character name uses only English characters

2. **"Invalid world" error**
   - Use only SEA world names: Aquila, Bootes, Cassiopeia, Delphinus
   - Check capitalization

3. **"Feature not supported" error**
   - SEA API has limited features compared to Korean API
   - Use only supported operations

4. **Rate limiting**
   - Slow down request frequency
   - Implement proper retry logic
   - Use caching effectively

---

For technical API reference, see [API_REFERENCE.md](API_REFERENCE.md).
For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).