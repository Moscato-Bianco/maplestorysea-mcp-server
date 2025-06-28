# Contributing to MapleStory MCP Server

We welcome contributions to the MapleStory MCP Server! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- TypeScript 5.4+
- NEXON API key (for testing)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/maplestory-mcp-server.git
   cd maplestory-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add your NEXON API key
   echo "NEXON_API_KEY=your_api_key_here" >> .env
   ```

4. **Build and test**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   ```

5. **Run the server**
   ```bash
   npm run dev
   ```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

1. **🐛 Bug Fixes**
   - Fix existing functionality issues
   - Improve error handling
   - Performance optimizations

2. **✨ New Features**
   - New MCP tools
   - Enhanced API functionality
   - Improved caching strategies

3. **📚 Documentation**
   - API documentation improvements
   - Usage examples
   - Setup guides

4. **🧪 Testing**
   - Unit tests
   - Integration tests
   - Performance tests

5. **🔧 Infrastructure**
   - CI/CD improvements
   - Docker configurations
   - Development tooling

### What We're Looking For

**High Priority:**
- Integration tests for MCP tools
- Performance optimizations
- Error handling improvements
- Docker deployment setup
- CI/CD pipeline enhancements

**Medium Priority:**
- Additional utility tools
- Enhanced caching mechanisms
- Monitoring and metrics
- Documentation improvements

**Low Priority:**
- Code style improvements
- Minor feature enhancements
- Example additions

## Pull Request Process

### Before You Start

1. **Check existing issues and PRs**
   - Look for related work in progress
   - Comment on relevant issues
   - Avoid duplicate efforts

2. **Create an issue first**
   - For significant changes, create an issue
   - Discuss the approach before implementation
   - Get feedback from maintainers

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**
   - Follow existing code patterns
   - Add appropriate tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   npm run lint:fix  # Fix auto-fixable issues
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add character equipment analysis tool"
   # or
   git commit -m "fix: handle rate limit errors in union tools"
   ```

### Submitting Your PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Add screenshots/examples if applicable

3. **PR Requirements**
   - ✅ All tests pass
   - ✅ TypeScript compilation successful
   - ✅ Lint checks pass
   - ✅ Documentation updated
   - ✅ Backward compatibility maintained

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Documentation
- [ ] API documentation updated
- [ ] Usage examples added
- [ ] README updated if needed

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented

## Related Issues
Fixes #123
Related to #456
```

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10, macOS 12, Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- Package version: [e.g., 1.0.2]

**API Key Status**
- [ ] Valid NEXON API key
- [ ] Rate limits not exceeded
- [ ] Network connectivity confirmed

**Additional Context**
Any other context about the problem
```

### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
What other approaches were considered?

**Additional Context**
Any other context or screenshots
```

## Development Workflow

### Project Structure

```
src/
├── api/           # NEXON API client
├── tools/         # MCP tools implementation
├── utils/         # Utility functions
├── server/        # MCP server setup
└── index.ts       # Entry point

docs/              # Documentation
test/              # Test files (to be added)
```

### Key Files

- `src/tools/base-tool.ts` - Base class for all MCP tools
- `src/api/nexon-client.ts` - NEXON API client with caching
- `src/utils/errors.ts` - Error handling utilities
- `src/utils/logger.ts` - Logging infrastructure

### Adding New Tools

1. **Create tool class**
   ```typescript
   // src/tools/my-new-tool.ts
   import { EnhancedBaseTool, ToolContext, ToolResult } from './base-tool';
   
   export class MyNewTool extends EnhancedBaseTool {
     public readonly name = 'my_new_tool';
     public readonly description = 'Description of what this tool does';
     
     public readonly inputSchema = {
       type: 'object',
       properties: {
         parameter: {
           type: 'string',
           description: 'Parameter description'
         }
       },
       required: ['parameter']
     };
     
     protected async executeImpl(args: any, context: ToolContext): Promise<ToolResult> {
       // Implementation
     }
     
     protected validateImpl(args: any): boolean {
       // Validation logic
     }
   }
   ```

2. **Register in index**
   ```typescript
   // src/tools/index.ts
   import { MyNewTool } from './my-new-tool';
   
   export const ALL_TOOLS = [
     // ... existing tools
     new MyNewTool(),
   ];
   ```

3. **Add tests**
   ```typescript
   // test/tools/my-new-tool.test.ts
   describe('MyNewTool', () => {
     // Test cases
   });
   ```

## Code Style

### TypeScript Guidelines

1. **Use strict TypeScript**
   ```typescript
   // ✅ Good
   interface CharacterInfo {
     name: string;
     level: number;
   }
   
   // ❌ Avoid
   const data: any = {};
   ```

2. **Proper error handling**
   ```typescript
   // ✅ Good
   try {
     const result = await apiCall();
     return this.formatResult(result);
   } catch (error) {
     return this.formatError(error);
   }
   
   // ❌ Avoid
   const result = await apiCall(); // No error handling
   ```

3. **Use enums for constants**
   ```typescript
   // ✅ Good
   export enum WorldName {
     SCANIA = '스카니아',
     BERA = '베라',
     LUNA = '루나'
   }
   
   // ❌ Avoid
   const WORLD_SCANIA = '스카니아';
   ```

### Code Formatting

We use Prettier and ESLint:

```bash
# Format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Naming Conventions

- **Files**: kebab-case (`character-tools.ts`)
- **Classes**: PascalCase (`CharacterTool`)
- **Functions**: camelCase (`getCharacterInfo`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Interfaces**: PascalCase (`CharacterBasic`)

## Testing

### Test Structure

```typescript
// test/tools/character-tools.test.ts
import { CharacterBasicInfoTool } from '../../src/tools/character-tools';

describe('CharacterBasicInfoTool', () => {
  let tool: CharacterBasicInfoTool;
  
  beforeEach(() => {
    tool = new CharacterBasicInfoTool();
  });
  
  describe('validation', () => {
    it('should validate correct parameters', () => {
      const args = { characterName: 'TestCharacter' };
      expect(tool.validate(args)).toBe(true);
    });
    
    it('should reject invalid parameters', () => {
      const args = { characterName: '' };
      expect(tool.validate(args)).toBe(false);
    });
  });
  
  describe('execution', () => {
    it('should return character information', async () => {
      // Test implementation
    });
  });
});
```

### Test Requirements

- **Unit tests** for all new tools
- **Integration tests** for API interactions
- **Error handling tests** for edge cases
- **Performance tests** for critical paths

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- character-tools.test.ts

# Run with coverage
npm run test:coverage
```

## Documentation

### Documentation Requirements

1. **API Reference**
   - Update `docs/API_REFERENCE.md`
   - Document all parameters and return types
   - Include examples

2. **Usage Examples**
   - Add to `docs/EXAMPLES.md`
   - Provide Claude Desktop queries
   - Show expected responses

3. **Code Documentation**
   ```typescript
   /**
    * Retrieves basic character information from NEXON API
    * @param characterName - Name of the character to query
    * @param date - Optional date in YYYY-MM-DD format
    * @returns Character basic information with metadata
    */
   async getCharacterBasic(characterName: string, date?: string): Promise<ToolResult> {
     // Implementation
   }
   ```

### Documentation Style

- Use clear, concise language
- Provide practical examples
- Include error scenarios
- Keep up-to-date with code changes

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code review discussions

### Questions?

- Check existing documentation first
- Search existing issues and discussions
- Create a new discussion for general questions
- Create an issue for specific bugs or feature requests

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge after review
5. Tag release
6. Publish to npm

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

Thank you for contributing to MapleStory MCP Server! 🍁