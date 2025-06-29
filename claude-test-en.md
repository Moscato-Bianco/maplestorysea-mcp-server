# Claude Desktop MCP Connection Verification Guide

## 1. Claude Desktop Configuration Check

Correct configuration example:

```json
{
  "mcpServers": {
    "maplestory-sea": {
      "command": "npx",
      "args": ["-y", "maplestorysea-mcp-server"],
      "env": {
        "NEXON_API_KEY": "test_86bd7da053eab9a9328c1008c8c2c1a75b82a506727038e778a8ad5122dc6633efe8d04e6d233bd35cf2fabdeb93fb0d"
      }
    }
  }
}
```

## 2. Connection Test

### Basic Connection Test
```bash
# Check if MCP server is working properly
npx maplestorysea-mcp-server
```

### Claude Desktop Test
1. Open Claude Desktop
2. Type: "Test MapleStory SEA connection"
3. Verify that MapleStory SEA tools are available

## 3. Troubleshooting

### Common Issues
- **API Key Error**: Verify your NEXON API key is valid
- **Connection Failed**: Check internet connection and firewall settings
- **Server Not Found**: Ensure the package is properly installed

### Debug Steps
1. Check Claude Desktop logs
2. Verify MCP server configuration
3. Test API key with direct API calls
4. Restart Claude Desktop if needed

## 4. Available Tools

After successful connection, the following tools should be available:
- Character information lookup
- Guild information retrieval  
- Ranking searches
- Union information access
- Equipment analysis

## 5. Example Usage

```
# Get character basic information
Get basic info for character "TestCharacter" in world "Aquila"

# Search overall rankings
Show overall ranking for Arch Mage in world Aquila

# Get guild information
Find guild information for "TestGuild" in world Aquila
```

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify your API key is valid for MapleStory SEA
3. Ensure all dependencies are properly installed
4. Restart Claude Desktop and try again