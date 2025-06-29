# Claude Desktop Integration Guide

Complete guide for integrating MapleStory SEA MCP Server with Claude Desktop for seamless AI-powered MapleStory data access.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Detailed Configuration](#detailed-configuration)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)
- [Best Practices](#best-practices)

## Prerequisites

Before setting up the integration, ensure you have:

### 1. Claude Desktop Application
- Download from [claude.ai/download](https://claude.ai/download)
- Install and create an Anthropic account
- Verify Claude Desktop is running properly

### 2. NEXON API Key
1. Visit [NEXON Open API Portal](https://openapi.nexon.com/)
2. Sign in with your NEXON account (create one if needed)
3. Navigate to "Developer Center" → "Application Management"
4. Click "Register New Application"
5. Fill in application details:
   - **Application Name**: "MapleStory SEA MCP Client" (or your preferred name)
   - **Service**: Select "MapleStorySEA"
   - **Application Type**: Choose appropriate type
6. After registration, copy the generated API key

### 3. System Requirements
- **Node.js**: Version 18 or higher
- **Internet Connection**: For API access
- **Operating System**: Windows, macOS, or Linux

## Quick Setup

### Step 1: Locate Configuration File

Find your Claude Desktop configuration file based on your operating system:

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

### Step 2: Basic Configuration

Create or edit the configuration file with this basic setup:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop

1. Close Claude Desktop completely
2. Restart the application
3. Wait for the MCP server to initialize (may take 10-30 seconds)

### Step 4: Test Connection

In Claude Desktop, try this simple query:
```
Check the health of the MapleStory SEA MCP server
```

If successful, you should see a health status response.

## Detailed Configuration

### Advanced Configuration Options

For production use or specific requirements, use this enhanced configuration:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_actual_api_key_here",
        "LOG_LEVEL": "info",
        "NODE_ENV": "production",
        "CACHE_TTL_MULTIPLIER": "1.0",
        "MAX_CONCURRENT_REQUESTS": "10",
        "REQUEST_TIMEOUT": "15000"
      }
    }
  },
  "globalShortcuts": {
    "maplestory": "maplestory-sea"
  }
}
```

### Environment Variables Explained

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `NEXON_API_KEY` | Your NEXON API key (required) | None | Your API key |
| `LOG_LEVEL` | Logging verbosity | `info` | `debug`, `info`, `warn`, `error` |
| `NODE_ENV` | Environment mode | `development` | `development`, `production` |
| `CACHE_TTL_MULTIPLIER` | Cache duration multiplier | `1.0` | `0.5` - `2.0` |
| `MAX_CONCURRENT_REQUESTS` | Request concurrency limit | `8` | `1` - `15` |
| `REQUEST_TIMEOUT` | API timeout in milliseconds | `15000` | `5000` - `60000` |

### Multiple Server Configuration

If you need multiple configurations (e.g., different API keys):

```json
{
  "mcpServers": {
    "maplestory-sea-primary": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "primary_api_key_here",
        "LOG_LEVEL": "info"
      }
    },
    "maplestory-sea-backup": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "backup_api_key_here",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## Usage Examples

### Character Information Queries

```
1. Get basic information for character "AquilaHero"
2. Get detailed stats for character "BootesWarrior" 
3. Get full character information including equipment for "SamplePlayer"
4. Analyze character "TopPlayer" equipment and provide recommendations
```

### Job Class Information

```
1. Get detailed information about Hero job class
2. What are the primary stats for Arch Mage (Fire, Poison)?
3. Show me job advancement requirements for Explorer classes
4. Compare Demon Slayer and Dark Knight job classes
```

### Union and Guild Queries

```
1. Get union information for character "UnionLeader"
2. Show union raider configuration for "StrongPlayer"
3. Search for guilds containing "Elite" in Aquila world
4. Get guild ranking for world Bootes
```

### Rankings and Leaderboards

```
1. Show overall rankings for Aquila world
2. Find ranking position for character "TopWarrior"
3. Get overall rankings for Hero class characters
4. Show union power rankings for all worlds
```

### Troubleshooting Queries

```
1. Check the health status of MapleStory SEA API
2. Test connection to NEXON API servers
3. Verify my API key permissions
```

## Troubleshooting

### Common Issues and Solutions

#### 1. MCP Server Not Starting

**Symptoms:**
- Claude Desktop shows "MCP server not responding"
- No MapleStory tools available
- Connection timeout errors

**Solutions:**
```bash
# Test NPX installation
npx -y maplestorysea-mcp-server --version

# Check Node.js version
node --version  # Should be 18+

# Test API key manually
curl -H "x-nxopen-api-key: YOUR_API_KEY" \
  "https://open.api.nexon.com/maplestorysea/v1/id?character_name=TestCharacter"
```

#### 2. API Key Issues

**Symptoms:**
- "Invalid API key" errors
- "Insufficient permissions" errors
- 401 authentication failures

**Solutions:**
1. Verify API key is correctly copied (no extra spaces)
2. Check API key permissions in NEXON Developer Center
3. Ensure API key is for MapleStory SEA (not other games)
4. Test API key with a simple REST call

#### 3. Rate Limiting

**Symptoms:**
- "Rate limit exceeded" messages
- Slow responses
- Temporary API blocks

**Solutions:**
```json
{
  "env": {
    "NEXON_API_KEY": "your_key_here",
    "MAX_CONCURRENT_REQUESTS": "5",
    "REQUEST_TIMEOUT": "20000"
  }
}
```

#### 4. Character Not Found

**Symptoms:**
- "Character not found" errors for existing characters
- "Invalid character name" messages

**Solutions:**
1. Verify character name uses English letters/numbers only
2. Check character name length (2-13 characters)
3. Ensure character exists in specified world
4. Try with different world names

#### 5. Timeout Issues

**Symptoms:**
- "Request timeout" errors
- Very slow responses
- Connection drops

**Solutions:**
```json
{
  "env": {
    "REQUEST_TIMEOUT": "30000",
    "LOG_LEVEL": "debug"
  }
}
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_key_here",
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Advanced Configuration

### Performance Optimization

For high-usage scenarios:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_key_here",
        "MAX_CONCURRENT_REQUESTS": "12",
        "CACHE_TTL_MULTIPLIER": "1.5",
        "REQUEST_TIMEOUT": "25000",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

### Development Setup

For development and testing:

```json
{
  "mcpServers": {
    "maplestory-sea-dev": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_key_here",
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development",
        "CACHE_TTL_MULTIPLIER": "0.1",
        "MAX_CONCURRENT_REQUESTS": "3"
      }
    }
  }
}
```

### Local Development

For local package development:

```json
{
  "mcpServers": {
    "maplestory-sea-local": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/local/maplestorysea-mcp-server",
      "env": {
        "NEXON_API_KEY": "your_key_here",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Best Practices

### 1. API Key Security
```json
// ❌ Don't commit API keys to version control
{
  "NEXON_API_KEY": "NX-123456789abcdef..."
}

// ✅ Use environment variables or secure storage
{
  "NEXON_API_KEY": "${NEXON_API_KEY}"
}
```

### 2. Rate Limiting Respect
- Start with conservative settings
- Monitor for rate limit errors
- Increase limits gradually if needed
- Use caching effectively

### 3. Error Handling
- Always test configuration changes
- Monitor logs for issues
- Have backup API keys ready
- Implement proper retry logic

### 4. Performance Monitoring
```json
{
  "env": {
    "LOG_LEVEL": "info",
    "REQUEST_TIMEOUT": "15000"
  }
}
```

### 5. Regular Maintenance
- Update the package regularly: `npm update -g maplestorysea-mcp-server`
- Monitor NEXON API status
- Rotate API keys periodically
- Review logs for issues

## Integration Testing

Test your configuration with these queries:

### Basic Connectivity
```
1. Health check for MapleStory SEA MCP server
2. Test NEXON API connection
```

### Character Data
```
1. Get basic info for any known character
2. Search for a popular guild name
```

### Job Information
```
1. Get information about Hero job class
2. List all Explorer job classes
```

If all tests pass, your integration is working correctly!

## Support

### Getting Help
1. **Check Logs**: Enable debug logging first
2. **Test API Key**: Verify with direct API calls
3. **Update Package**: Ensure latest version
4. **Community Support**: Check GitHub issues

### Useful Resources
- [NEXON API Documentation](https://openapi.nexon.com/en/game/maplestorysea/)
- [Claude Desktop Documentation](https://claude.ai/help)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Project GitHub Repository](https://github.com/Moscato-Bianco/maplestorysea-mcp-server)

---

*This guide covers Claude Desktop integration specifically. For other MCP clients, adapt the configuration format as needed.*