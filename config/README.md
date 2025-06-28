# Configuration Templates

This directory contains environment configuration templates for different deployment scenarios of the MapleStory SEA MCP Server.

## Files Overview

### Environment Templates
- **`.env.mcp.example`** - General environment configuration template
- **`production.env.example`** - Production-optimized configuration
- **`development.env.example`** - Development-optimized configuration

### Claude Desktop Integration
- **`claude-desktop-config.example.json`** - Claude Desktop MCP server configuration

## Quick Setup

### 1. Basic Setup
```bash
# Copy the general template
cp .env.mcp.example .env

# Edit the .env file with your API key
nano .env  # or your preferred editor
```

### 2. Environment-Specific Setup

#### Development
```bash
cp config/development.env.example .env
# Edit with your development API key and preferences
```

#### Production
```bash
cp config/production.env.example .env
# Edit with your production API key and security settings
```

### 3. Claude Desktop Configuration

#### Step 1: Locate Claude Desktop Config
Find your Claude Desktop configuration file:

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

#### Step 2: Add MCP Server
Copy the contents of `claude-desktop-config.example.json` and merge it with your existing configuration:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_actual_nexon_api_key_here"
      }
    }
  }
}
```

#### Step 3: Restart Claude Desktop
Close and restart Claude Desktop to load the new MCP server.

## Configuration Options

### Required Settings
- **`NEXON_API_KEY`** - Your NEXON Open API key (get from https://openapi.nexon.com/)

### Performance Settings
- **`API_RATE_LIMIT_PER_SECOND`** - Requests per second (SEA optimal: 8)
- **`API_RATE_LIMIT_PER_MINUTE`** - Requests per minute (SEA optimal: 500)
- **`CACHE_TTL_*`** - Cache time-to-live for different data types

### Logging Settings
- **`LOG_LEVEL`** - Logging level (error, warn, info, debug)
- **`ENABLE_DEBUG_LOGS`** - Enable detailed debug information
- **`ENABLE_API_LOGGING`** - Log API requests and responses

### Security Settings
- **`ENABLE_REQUEST_VALIDATION`** - Validate all incoming requests
- **`ENABLE_API_KEY_VALIDATION`** - Validate NEXON API key format

## Environment-Specific Recommendations

### Development
- Use shorter cache TTL for testing changes
- Enable verbose logging for debugging
- Use separate API keys from production
- Enable API request/response logging

### Production
- Use longer cache TTL for performance
- Reduce logging verbosity
- Enable all security validations
- Set up external monitoring
- Configure Redis for distributed caching

## Docker Configuration

When using Docker, you can pass environment variables through:

### Docker Compose
```yaml
environment:
  - NEXON_API_KEY=${NEXON_API_KEY}
  - NODE_ENV=production
  - LOG_LEVEL=info
```

### Docker Run
```bash
docker run -e NEXON_API_KEY=your_key_here -e NODE_ENV=production maplestory-sea-mcp
```

## Security Best Practices

1. **Never commit .env files** - Keep environment files in .gitignore
2. **Use environment-specific API keys** - Separate keys for dev/prod
3. **Validate all inputs** - Keep request validation enabled
4. **Monitor API usage** - Track rate limits and performance
5. **Rotate API keys regularly** - Update keys periodically for security

## Troubleshooting

### Common Issues

#### "Invalid API Key" Error
- Verify your NEXON_API_KEY is correct
- Check if the API key has proper permissions
- Ensure the key is for MapleStory SEA (not KMS)

#### Rate Limiting Issues
- Reduce API_RATE_LIMIT_PER_SECOND if hitting limits
- Check your API key's rate limit quotas
- Monitor actual usage vs configured limits

#### Cache Issues
- Verify cache TTL settings are appropriate
- Check if Redis is properly configured (if using)
- Clear cache if experiencing stale data

#### Connection Issues
- Verify internet connectivity
- Check if NEXON API is accessible
- Validate firewall settings for outbound requests

## Support

For additional configuration help:
1. Check the main README.md for basic setup
2. Review the API documentation in docs/
3. Check GitHub issues for common problems
4. Contact support through GitHub issues