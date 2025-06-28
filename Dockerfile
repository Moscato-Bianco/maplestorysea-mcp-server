# MapleStory SEA MCP Server Dockerfile
# Multi-stage build for production optimization

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Set ownership to mcp user
RUN chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose port (MCP servers typically don't need exposed ports, but useful for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { \
        host: 'localhost', \
        port: 3000, \
        path: '/health', \
        timeout: 5000 \
    }; \
    const request = http.request(options, (res) => { \
        console.log('Health check status:', res.statusCode); \
        process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    request.on('error', (err) => { \
        console.error('Health check failed:', err); \
        process.exit(1); \
    }); \
    request.end();"

# Environment variables (set defaults, override in docker-compose or at runtime)
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000

# Start the MCP server
CMD ["node", "dist/index.js"]