# Troubleshooting Guide

Comprehensive troubleshooting guide for MapleStory SEA MCP Server.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Common Issues](#common-issues)
3. [API-Related Problems](#api-related-problems)
4. [Claude Desktop Integration](#claude-desktop-integration)
5. [Performance Issues](#performance-issues)
6. [Error Reference](#error-reference)
7. [Debug Mode](#debug-mode)
8. [Getting Help](#getting-help)

## Quick Diagnostics

### Health Check
First, verify the server is working:

```bash
# If running locally
npm run mcp

# If installed globally
maplestory-mcp-server --health
```

### Environment Check
Verify your environment setup:

```bash
# Check Node.js version (requires 18+)
node --version

# Check if MCP server is installed
npm list -g maplestory-mcp-server

# Verify API key is set
echo $NEXON_API_KEY | cut -c1-10
```

## Common Issues

### 1. "Command not found: maplestory-mcp-server"

**Symptoms:**
- Shell reports command not found
- NPX fails to find the package

**Solutions:**
```bash
# Solution 1: Install globally
npm install -g maplestory-mcp-server

# Solution 2: Use NPX directly
npx maplestory-mcp-server

# Solution 3: Check npm global path
npm config get prefix
export PATH="$(npm config get prefix)/bin:$PATH"
```

### 2. Claude Desktop Not Finding MCP Server

**Symptoms:**
- Claude Desktop shows no MCP servers
- Tools not available in Claude
- Connection errors in Claude

**Solutions:**

#### Step 1: Verify Config File Location
Find your Claude Desktop config file:

**Windows:**
```cmd
echo %APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```bash
echo ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
echo ~/.config/Claude/claude_desktop_config.json
```

#### Step 2: Verify Config Format
Your config should look like:
```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestory-mcp-server"],
      "env": {
        "NEXON_API_KEY": "your_key_here"
      }
    }
  }
}
```

#### Step 3: Common Config Fixes
```bash
# Test the command manually
npx -y maplestory-mcp-server

# Check if config file exists
ls -la "$(dirname "$(which claude)")/../Resources/claude_desktop_config.json"

# Restart Claude Desktop completely
pkill Claude  # or close via Task Manager on Windows
```

### 3. "Invalid API Key" Errors

**Symptoms:**
- Authentication failures
- 401/403 HTTP errors
- "API key not valid" messages

**Solutions:**

#### Verify API Key Format
```bash
# NEXON API keys should be 36-40 characters
echo $NEXON_API_KEY | wc -c

# Check for extra spaces or newlines
echo "$NEXON_API_KEY" | od -c
```

#### Test API Key
```bash
# Test API key directly
curl -H "x-nxopen-api-key: $NEXON_API_KEY" \
  "https://open.api.nexon.com/maplestorysea/v1/ranking/overall?page=1"
```

#### Get New API Key
1. Visit [NEXON Open API Portal](https://openapi.nexon.com/)
2. Log in with NEXON account
3. Go to Application Management
4. Create new application for MapleStory SEA
5. Copy the generated API key

### 4. Rate Limiting Issues

**Symptoms:**
- "Rate limit exceeded" errors
- 429 HTTP status codes
- Slow response times

**Solutions:**

#### Check Current Rate Limits
```bash
# Check SEA API limits (8 req/sec, 500 req/min)
export API_RATE_LIMIT_PER_SECOND=8
export API_RATE_LIMIT_PER_MINUTE=500
```

#### Monitor Usage
```bash
# Enable API logging to track requests
export ENABLE_API_LOGGING=true
export LOG_LEVEL=debug
```

#### Optimize Requests
- Use caching effectively
- Avoid rapid sequential requests
- Implement exponential backoff

## API-Related Problems

### Character Not Found Errors

**Symptoms:**
- "Character not found" messages
- Empty results for valid characters

**Debugging Steps:**

1. **Verify Character Name Format**
   ```bash
   # SEA characters use English names only
   # Valid: "TestCharacter123"
   # Invalid: "테스트캐릭터" (Korean characters)
   ```

2. **Check World Name**
   ```bash
   # Valid SEA worlds: Aquila, Bootes, Cassiopeia, Delphinus
   # Case-sensitive!
   ```

3. **Verify Character Existence**
   - Check if character exists in-game
   - New characters may take 24 hours to appear in API
   - Character must be level 30+ to appear in some endpoints

### Guild Search Issues

**Symptoms:**
- Guild not found despite existing
- Partial results

**Solutions:**

1. **Use Exact Guild Names**
   ```typescript
   // Prefer exact matches
   searchGuilds({ guildName: "ExactGuildName", worldName: "Aquila" })
   
   // Rather than partial matches
   searchGuilds({ guildName: "Guild", worldName: "Aquila" })
   ```

2. **Check World Specification**
   ```typescript
   // Always specify world for better results
   getGuildInfo({ guildName: "MyGuild", worldName: "Bootes" })
   ```

### Union Data Issues

**Symptoms:**
- Missing union information
- Incomplete raider data

**Common Causes:**
- Character's union must be unlocked (account level 60+)
- Union data updates daily, may be outdated
- Private profiles may hide union information

## Claude Desktop Integration

### Tools Not Appearing

**Symptoms:**
- MCP server connected but tools missing
- Partial tool availability

**Solutions:**

1. **Restart Claude Desktop**
   ```bash
   # Complete restart required after config changes
   pkill Claude
   # Restart Claude Desktop application
   ```

2. **Check MCP Server Status**
   ```bash
   # Test server directly
   maplestory-mcp-server --test
   ```

3. **Verify Tool Registration**
   - All tools should be available immediately
   - Check Claude's MCP settings panel

### Connection Timeouts

**Symptoms:**
- Long loading times
- Timeout errors in Claude

**Solutions:**

1. **Increase Timeout**
   ```json
   {
     "mcpServers": {
       "maplestory-sea": {
         "command": "npx",
         "args": ["-y", "maplestory-mcp-server"],
         "env": {
           "NEXON_API_KEY": "your_key_here"
         },
         "timeout": 30000
       }
     }
   }
   ```

2. **Check Network Connectivity**
   ```bash
   # Test NEXON API connectivity
   ping open.api.nexon.com
   ```

## Performance Issues

### Slow Response Times

**Symptoms:**
- Queries taking > 10 seconds
- Timeouts in Claude Desktop

**Debugging Steps:**

1. **Run Performance Benchmark**
   ```bash
   npm run benchmark:perf
   ```

2. **Check Cache Status**
   ```bash
   export ENABLE_DEBUG_LOGS=true
   # Look for cache hit/miss logs
   ```

3. **Monitor Network**
   ```bash
   # Check network latency to NEXON API
   curl -w "@curl-format.txt" -o /dev/null -s \
     "https://open.api.nexon.com/maplestorysea/v1/ranking/overall?page=1"
   ```

### Memory Issues

**Symptoms:**
- Out of memory errors
- Gradual performance degradation

**Solutions:**

1. **Monitor Memory Usage**
   ```bash
   # Check current memory usage
   node -e "console.log(process.memoryUsage())"
   ```

2. **Adjust Cache Settings**
   ```bash
   # Reduce cache TTL if memory is limited
   export CACHE_TTL_CHARACTER_BASIC=300000  # 5 minutes instead of 30
   ```

3. **Restart Periodically**
   ```bash
   # For long-running instances, periodic restart helps
   pkill -f maplestory-mcp-server
   ```

## Error Reference

### HTTP Status Codes

| Code | Meaning | Common Causes | Solutions |
|------|---------|---------------|-----------|
| 400 | Bad Request | Invalid parameters | Check request format |
| 401 | Unauthorized | Invalid API key | Verify NEXON_API_KEY |
| 403 | Forbidden | API key lacks permissions | Check API key scope |
| 404 | Not Found | Character/Guild doesn't exist | Verify names/existence |
| 429 | Too Many Requests | Rate limit exceeded | Slow down requests |
| 500 | Internal Server Error | NEXON API issues | Retry later |
| 503 | Service Unavailable | NEXON API maintenance | Check NEXON status |

### MCP Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `SEA_API_UNSUPPORTED_FEATURE` | Feature not available in SEA | Use supported features only |
| `SEA_WORLD_NOT_FOUND` | Invalid world name | Use: Aquila, Bootes, Cassiopeia, Delphinus |
| `SEA_CHARACTER_NAME_ERROR` | Invalid character name | Use English characters only |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Reduce request frequency |
| `CACHE_ERROR` | Cache operation failed | Restart or clear cache |

## Debug Mode

### Enable Debug Logging

```bash
# Environment variables
export LOG_LEVEL=debug
export ENABLE_DEBUG_LOGS=true
export ENABLE_API_LOGGING=true

# Run with debug output
maplestory-mcp-server --debug
```

### Debug Information

Debug logs include:
- API request/response details
- Cache hit/miss information
- Rate limiting status
- Performance metrics
- Error stack traces

### Log Analysis

```bash
# Filter logs by level
cat mcp-server.log | grep "ERROR"

# Check API calls
cat mcp-server.log | grep "api_call"

# Monitor cache performance
cat mcp-server.log | grep "cache_"
```

## Docker Troubleshooting

### Container Issues

**Symptoms:**
- Container fails to start
- Connection refused errors

**Solutions:**

1. **Check Environment Variables**
   ```bash
   docker run --env-file .env maplestory-sea-mcp env | grep NEXON
   ```

2. **Verify Port Mapping**
   ```bash
   docker run -p 3000:3000 maplestory-sea-mcp
   ```

3. **Check Container Logs**
   ```bash
   docker logs maplestory-sea-mcp-server
   ```

### Docker Compose Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up

# Check service status
docker-compose ps

# View logs
docker-compose logs maplestory-sea-mcp
```

## Network Troubleshooting

### Firewall Issues

**Symptoms:**
- Connection timeouts
- DNS resolution failures

**Solutions:**

1. **Allow Outbound HTTPS**
   ```bash
   # Ensure port 443 is open for HTTPS
   telnet open.api.nexon.com 443
   ```

2. **Check DNS Resolution**
   ```bash
   nslookup open.api.nexon.com
   dig open.api.nexon.com
   ```

3. **Test with Curl**
   ```bash
   curl -v https://open.api.nexon.com/maplestorysea/v1/ranking/overall?page=1
   ```

### Proxy Configuration

If behind a corporate proxy:

```bash
# Set proxy environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

# Run with proxy settings
maplestory-mcp-server
```

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing GitHub issues**
3. **Run diagnostics and collect logs**
4. **Try minimal reproduction steps**

### Information to Include

When reporting issues, include:

1. **Environment Information**
   ```bash
   node --version
   npm --version
   echo $NEXON_API_KEY | cut -c1-10
   uname -a  # or system info on Windows
   ```

2. **Error Messages**
   - Full error text
   - Stack traces
   - Log excerpts

3. **Reproduction Steps**
   - Exact commands run
   - Input data used
   - Expected vs actual behavior

4. **Configuration**
   - Claude Desktop config (sanitized)
   - Environment variables (sanitized)
   - Docker setup (if applicable)

### Where to Get Help

1. **GitHub Issues**
   - [Report bugs](https://github.com/ljy9303/maplestory-mcp-server/issues)
   - Search existing issues first

2. **Documentation**
   - [API Reference](API_REFERENCE.md)
   - [Examples](EXAMPLES.md)
   - [README](../README.md)

3. **Community**
   - Check NEXON Open API community
   - Model Context Protocol discussions

### Support Response Time

- **Bug reports**: Usually within 24-48 hours
- **Feature requests**: Response varies
- **Security issues**: Priority handling

## Prevention Tips

### Regular Maintenance

1. **Monitor API Key Status**
   - Check key expiration
   - Monitor usage limits
   - Rotate keys periodically

2. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

3. **Performance Monitoring**
   ```bash
   # Run benchmarks regularly
   npm run benchmark:perf
   ```

### Best Practices

1. **Error Handling**
   - Always handle API failures gracefully
   - Implement proper retry logic
   - Log errors for debugging

2. **Rate Limiting**
   - Respect API rate limits
   - Implement exponential backoff
   - Use caching effectively

3. **Security**
   - Never commit API keys
   - Use environment variables
   - Rotate keys regularly

4. **Monitoring**
   - Enable health checks
   - Monitor performance metrics
   - Set up alerting for failures

---

This troubleshooting guide covers the most common issues. If you encounter a problem not covered here, please report it on GitHub so we can improve this guide.