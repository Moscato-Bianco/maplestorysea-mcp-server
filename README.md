# MCP Maple 🍁

A comprehensive Model Context Protocol (MCP) server for accessing NEXON MapleStory Open API data. This tool provides structured access to character information, union details, guild data, rankings, and game mechanics through Claude and other MCP-compatible AI assistants.

## ✨ Features

- **Character Information**: Get detailed character stats, equipment, and basic info
- **Union System**: Access union raider configurations and rankings
- **Guild Management**: Retrieve guild information and member details
- **Rankings**: Access various leaderboards and competitive data
- **Game Mechanics**: Probability information for cubes and starforce enhancement
- **Game Updates**: Latest notices and announcements
- **TypeScript Support**: Full type safety and IntelliSense support
- **Comprehensive Logging**: Detailed operation logging for debugging
- **Error Handling**: Robust error handling with detailed error messages

## 🚀 Quick Start

### NPX Usage (Recommended)
```bash
npx mcp-maple --api-key YOUR_NEXON_API_KEY
```

### Installation
```bash
npm install -g mcp-maple
```

### Usage with Claude Desktop

Add to your Claude Desktop MCP configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-maple": {
      "command": "npx",
      "args": ["-y", "mcp-maple", "--api-key", "YOUR_NEXON_API_KEY"],
      "env": {
        "NEXON_API_KEY": "YOUR_NEXON_API_KEY"
      }
    }
  }
}
```

## 🛠️ Available MCP Tools

### Character Tools
- `get_character_basic_info` - Get basic character information (level, job, world, guild)
- `get_character_stats` - Get detailed character statistics and combat stats
- `get_character_equipment` - Get character equipment and item details
- `get_character_full_info` - Get comprehensive character information in one call

### Union Tools
- `get_union_info` - Get union level, grade, and artifact information
- `get_union_raider` - Get union raider board configuration and blocks
- `get_union_ranking` - Get union power rankings

### Guild Tools
- `get_guild_info` - Get guild information, members, and skills
- `get_guild_ranking` - Get guild level rankings

### Ranking Tools
- `get_overall_ranking` - Get overall level rankings with filtering options

### Utility Tools
- `get_notice_list` - Get game notices and announcements
- `get_notice_detail` - Get detailed notice information
- `get_cube_probability` - Get cube enhancement probability information
- `get_starforce_probability` - Get starforce enhancement probability information
- `health_check` - Check API connectivity and status

## 📖 Usage Examples

### Getting Character Information
```typescript
// Get basic character info
const basicInfo = await getCharacterBasicInfo({
  characterName: "스카니아용사"
});

// Get detailed character stats
const stats = await getCharacterStats({
  characterName: "스카니아용사",
  date: "2024-01-15"
});

// Get character equipment
const equipment = await getCharacterEquipment({
  characterName: "스카니아용사"
});
```

### Union and Guild Data
```typescript
// Get union information
const unionInfo = await getUnionInfo({
  characterName: "스카니아용사"
});

// Get guild information
const guildInfo = await getGuildInfo({
  guildName: "길드명",
  worldName: "스카니아"
});
```

### Rankings and Leaderboards
```typescript
// Get overall rankings
const rankings = await getOverallRanking({
  worldName: "스카니아",
  className: "아크메이지(불,독)",
  page: 1
});

// Get union rankings
const unionRankings = await getUnionRanking({
  worldName: "스카니아",
  page: 1
});
```

## 🔧 Configuration

### Environment Variables
- `NEXON_API_KEY` - Your NEXON Open API key (required)
- `LOG_LEVEL` - Logging level (default: "info")
- `NODE_ENV` - Environment (development/production)

### CLI Options
- `--api-key` - NEXON API key
- `--port` - Server port (default: 3000)
- `--debug` - Enable debug logging
- `--name` - Server name (default: "mcp-maple")
- `--version` - Server version

## 🔑 Getting NEXON API Key

1. Visit [NEXON Open API Portal](https://openapi.nexon.com/)
2. Sign up and verify your account
3. Create a new application
4. Copy your API key
5. Use it with the `--api-key` parameter or `NEXON_API_KEY` environment variable

## 🎮 Supported Games & Worlds

### MapleStory Worlds
- 스카니아 (Scania)
- 베라 (Bera)
- 루나 (Luna)
- 제니스 (Zenith)
- 크로아 (Croa)
- 유니온 (Union)
- 엘리시움 (Elysium)
- 이노시스 (Enosis)
- 레드 (Red)
- 오로라 (Aurora)
- 아케인 (Arcane)
- 노바 (Nova)
- 리부트 (Reboot)
- 리부트2 (Reboot2)

## 🚦 Rate Limits & Best Practices

- **Rate Limit**: 500 requests per day per API key
- **Request Frequency**: Maximum 1 request per second
- **Data Freshness**: Character data is updated daily
- **Cache**: Results are cached for better performance
- **Error Handling**: Automatic retry for transient failures

## 🧪 Development

### Prerequisites
- Node.js 18+ 
- TypeScript 5.4+
- NEXON API key

### Setup
```bash
git clone https://github.com/ljy9303/mcp-maple.git
cd mcp-maple
npm install
npm run build
```

### Testing
```bash
npm test                # Run tests
npm run test:coverage   # Run tests with coverage
npm run test:watch      # Run tests in watch mode
```

### Building
```bash
npm run build          # Build TypeScript
npm run dev            # Development with watch
```

## 📚 API Reference

### Character Information Tools

#### `get_character_basic_info`
Get basic character information including level, job, world, and guild.

**Parameters:**
- `characterName` (string, required): Character name to look up
- `date` (string, optional): Date in YYYY-MM-DD format

**Returns:**
- `characterName`: Character name
- `level`: Character level
- `job`: Character job/class
- `world`: World/server name
- `guildName`: Guild name (if any)
- `exp`: Current experience points
- `expRate`: Experience rate percentage

#### `get_character_stats`
Get detailed character statistics including damage, critical rate, and all combat stats.

**Parameters:**
- `characterName` (string, required): Character name to look up
- `date` (string, optional): Date in YYYY-MM-DD format

**Returns:**
- `basicStats`: STR, DEX, INT, LUK, HP, MP
- `combatStats`: Attack power, magic power, critical stats
- `defenseStats`: Physical/magical defense stats
- `allStats`: Complete stat breakdown

### Union Tools

#### `get_union_info`
Get union level, grade, and artifact information.

**Parameters:**
- `characterName` (string, required): Character name to look up
- `date` (string, optional): Date in YYYY-MM-DD format

**Returns:**
- `unionLevel`: Current union level
- `unionGrade`: Union grade/rank
- `unionArtifact`: Artifact level and points

### Error Handling

All tools return consistent error information:
```typescript
{
  success: false,
  error: "Error description",
  metadata?: {
    executionTime: number,
    apiCalls: number
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NEXON](https://www.nexon.com/) for providing the MapleStory Open API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [Anthropic](https://www.anthropic.com/) for Claude and MCP tooling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ljy9303/mcp-maple/issues)
- **Documentation**: [API Reference](docs/API_REFERENCE.md)
- **Examples**: [Usage Examples](docs/EXAMPLES.md)

## 🔗 Related Projects

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/desktop)
- [NEXON Open API](https://openapi.nexon.com/)

---

Made with ❤️ for the MapleStory community