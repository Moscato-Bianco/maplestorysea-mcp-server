# Claude Desktop MCP Configuration Guide

## Test Results Summary

✅ **MapleStory SEA MCP Server v2.0.2 Optimization Complete**
- Test files and dependencies cleanup completed
- Optimized for MCP server-only configuration
- 15+ tools registered successfully
- Environment variable API key support

✅ **Claude Desktop MCP Compatibility**
- Direct execution via `npx -y maplestorysea-mcp-server` command
- Environment variable NEXON_API_KEY support
- JSON-RPC communication working properly

## Claude Desktop Configuration Method

### 1. Configuration File Location

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

### 2. Configuration File Format

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "YOUR_NEXON_API_KEY_HERE"
      }
    }
  }
}
```

### 3. API Key Setup

1. **Get NEXON API Key:**
   - Visit NEXON Developer Portal
   - Register for MapleStory SEA API access
   - Generate your API key

2. **Add API Key to Configuration:**
   - Replace `YOUR_NEXON_API_KEY_HERE` with your actual API key
   - Save the configuration file

### 4. Restart Claude Desktop

After making configuration changes:
1. Close Claude Desktop completely
2. Restart the application
3. Verify MCP connection is established

## Available Tools

Once configured, you'll have access to:

### Character Tools
- **Character Basic Info**: Get character level, job, guild information
- **Character Stats**: View detailed character statistics
- **Character Equipment**: Analyze equipped items and set effects
- **Character Skills**: View character skill information

### Guild Tools
- **Guild Information**: Get guild details and member information
- **Guild Basic Info**: View guild level, master, and member count

### Ranking Tools
- **Overall Ranking**: Search overall character rankings
- **Union Ranking**: View union power rankings
- **Guild Ranking**: Find guild rankings
- **Dojang Ranking**: Check Mu Lung Dojang rankings

### Utility Tools
- **Health Check**: Verify API connectivity and server status
- **Server Information**: Get MapleStory SEA server details

## Usage Examples

### Character Information
```
"Get basic information for character 'PlayerName' in world 'Aquila'"
```

### Rankings
```
"Show overall ranking for Arch Mage (Fire, Poison) in world Aquila"
```

### Guild Information
```
"Find guild information for 'GuildName' in world 'Aquila'"
```

## Troubleshooting

### Common Issues

1. **"MCP server not found"**
   - Ensure the package is installed: `npm install -g maplestorysea-mcp-server`
   - Check configuration file syntax

2. **"API Key Invalid"**
   - Verify your NEXON API key is correct
   - Ensure the key has MapleStory SEA API access permissions

3. **"Connection Failed"**
   - Check internet connectivity
   - Verify firewall settings allow the connection

4. **"No tools available"**
   - Restart Claude Desktop
   - Check configuration file format and location

### Debug Steps

1. **Verify Package Installation:**
   ```bash
   npx maplestorysea-mcp-server --version
   ```

2. **Test Direct Connection:**
   ```bash
   npx maplestorysea-mcp-server
   ```

3. **Check Configuration File:**
   - Verify JSON syntax is correct
   - Ensure file is in the correct location
   - Check API key format

4. **Review Logs:**
   - Check Claude Desktop logs for error messages
   - Look for MCP connection status messages

## Advanced Configuration

### Custom Timeout Settings
```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "YOUR_API_KEY",
        "REQUEST_TIMEOUT": "30000",
        "CACHE_TTL": "300000"
      }
    }
  }
}
```

### Multiple Server Configurations
```json
{
  "mcpServers": {
    "maplestory-sea-prod": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "PRODUCTION_API_KEY"
      }
    },
    "maplestory-sea-dev": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "DEVELOPMENT_API_KEY"
      }
    }
  }
}
```

## Support

For additional help:
1. Check the project GitHub repository for issues and documentation
2. Verify your MapleStory SEA API key permissions
3. Ensure you're using the latest version of the MCP server
4. Test with the provided example configurations