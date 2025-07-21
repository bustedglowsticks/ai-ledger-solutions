# Multi-stage build for Quantum Yield Empire
FROM node:18-alpine AS base

# Install dependencies
RUN apk add --no-cache git python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create production build
FROM node:18-alpine AS production

# Install PM2 for process management
RUN npm install -g pm2

# Set working directory
WORKDIR /app

# Copy from base stage
COPY --from=base /app ./

# Create PM2 ecosystem file
RUN echo '{ \
  "apps": [ \
    { \
      "name": "professional-website", \
      "script": "professional-website/server.js", \
      "instances": 1, \
      "env": { \
        "NODE_ENV": "production", \
        "PORT": 3003 \
      } \
    }, \
    { \
      "name": "testnet-dashboard", \
      "script": "simple-testnet-dashboard.js", \
      "instances": 1, \
      "env": { \
        "NODE_ENV": "production", \
        "PORT": 3006 \
      } \
    }, \
    { \
      "name": "beast-mode-bot", \
      "script": "src/index.js", \
      "instances": 1, \
      "env": { \
        "NODE_ENV": "production" \
      } \
    } \
  ] \
}' > ecosystem.config.js

# Expose ports
EXPOSE 3003 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/api/status || exit 1

# Start PM2
CMD ["pm2-runtime", "ecosystem.config.js"] 