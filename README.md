# MapleStory SEA MCP Server 🍁

Comprehensive MCP (Model Context Protocol) server for accessing NEXON MapleStory SEA Open API data. Provides structured access to character information, union details, guild data, rankings, and game mechanics through Claude Desktop and other MCP-compatible AI assistants.

## ✨ Features

- **Character Information**: Detailed character stats, equipment, and basic info retrieval
- **Union System**: Union raider configurations and ranking access
- **Guild Management**: Guild information and member details lookup
- **Rankings**: Various leaderboards and competitive data access
- **TypeScript Support**: Full type safety and IntelliSense support
- **Comprehensive Logging**: Detailed operation logging for debugging
- **Error Handling**: Robust error handling with descriptive error messages
- **SEA Specific**: Optimized for MapleStory SEA servers (Aquila, Bootes, Cassiopeia, Delphinus, Draco)

## 🚀 Quick Start

### Using NPX (Recommended)
```bash
npx maplestorysea-mcp-server --api-key YOUR_NEXON_API_KEY
```

### Installation
```bash
npm install -g maplestorysea-mcp-server
```

### 🖥️ Using with Claude Desktop

#### 1. Get NEXON API Key
First, obtain an API key from the [NEXON Open API Portal](https://openapi.nexon.com/):
1. Log in with your NEXON account
2. Go to "Developer Center" → "Application Management"
3. Click "Register New Application"
4. Fill in application details and register
5. Copy the generated API key

#### 2. Locate Claude Desktop Configuration File
Configuration file locations by OS:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

#### 3. Add MCP Server Configuration
Add the following to your `claude_desktop_config.json`:

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

#### 4. Restart Claude Desktop
Close and restart Claude Desktop to load the new MCP server.

## 📖 Available Tools

### Character Tools
- `get_character_basic_info` - Get basic character information
- `get_character_stats` - Get detailed character statistics
- `get_character_equipment` - Get character equipment details
- `get_character_full_info` - Get comprehensive character data
- `get_character_analysis` - Get character analysis with recommendations
- `find_character_ranking` - Find character's ranking position
- `get_job_class_info` - Get detailed job class information and stats

### Union Tools
- `get_union_info` - Get union information
- `get_union_raider` - Get union raider board details
- `get_union_ranking` - Get union power rankings

### Guild Tools
- `get_guild_info` - Get guild basic information
- `search_guilds` - Search for guilds with fuzzy matching
- `get_guild_ranking` - Get guild rankings

### Ranking Tools
- `get_overall_ranking` - Get overall level rankings

### Health Check
- `health_check` - Check server and API status

## 🌏 SEA Server Support

This server is specifically designed for MapleStory SEA and supports:

**Worlds:**
- Aquila
- Bootes
- Cassiopeia
- Delphinus

**Job Classes:**
- Complete support for all 241 SEA job classes
- Organized into 9 categories: Explorer, Cygnus Knights, Heroes, Resistance, Nova, Sengoku, Flora, Anima, Jianghu
- Job advancement tracking and primary stat recommendations
- SEA-specific job features and descriptions

**Character Names:**
- English letters and numbers only (no Korean characters)
- 2-13 characters in length

## 🔧 Configuration

### Environment Variables
- `NEXON_API_KEY` - Your NEXON API key (required)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `NODE_ENV` - Environment (development, production)

### Rate Limiting
The server implements intelligent rate limiting optimized for SEA API:
- 8 requests per second
- 500 requests per minute
- 12 concurrent requests (burst limit)
- Exponential backoff for retries with jitter
- Automatic queue management

### Caching
Smart caching system with SEA-optimized TTL:
- Character OCID: 2 hours (rarely changes)
- Character basic info: 30 minutes
- Character stats: 15 minutes
- Equipment: 10 minutes
- Union info: 30 minutes
- Guild info: 1 hour
- Rankings: 30 minutes (15 minutes for searches)

## 📊 Usage Examples

### Get Character Information
```
Get basic info for character "SamplePlayer"
```

### Search for Guilds
```
Search for guilds with name containing "Elite" in Aquila world
```

### Check Rankings
```
Get overall rankings for Aquila world, Arch Mage class
```

### Get Job Class Information
```
Get detailed information about Hero job class including primary stats and build recommendations
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- NPM or Yarn
- NEXON API key

### Setup
```bash
git clone https://github.com/Moscato-Bianco/maplestorysea-mcp-server.git
cd maplestorysea-mcp-server
npm install
npm run build
```

### Testing
```bash
npm test
npm run test:integration
```

### Development Mode
```bash
npm run dev
```

## 📝 Documentation

### Comprehensive Guides
- **[API Reference](docs/API_REFERENCE.md)** - Complete tool documentation with examples
- **[Claude Desktop Integration](docs/CLAUDE_DESKTOP_GUIDE.md)** - Step-by-step setup guide  
- **[SEA Features Guide](docs/SEA_FEATURES.md)** - SEA-specific features and differences
- **[Best Practices](docs/BEST_PRACTICES.md)** - Rate limiting and optimization guide
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Examples](docs/EXAMPLES.md)** - Usage examples and patterns

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Links

- [NEXON Open API Documentation](https://openapi.nexon.com/en/game/maplestorysea/)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## ⚠️ Important Notes

- This server only supports MapleStory SEA API features
- Korean-specific features (notices, probabilities, server status) are not available
- Character names must use English characters only
- API rate limits are strictly enforced

## 🆘 Support

If you encounter issues:
1. Check your NEXON API key is valid
2. Ensure you're using supported world names
3. Verify character names use English characters only
4. Check the logs for detailed error information

For bugs and feature requests, please open an issue on GitHub.