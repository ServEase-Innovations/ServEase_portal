# Environment Configuration Guide

This project supports three different environment modes: **local**, **dev**, and **prod**.

## Environment Files

- **`.env.local`** - Local development environment (default)
- **`.env.development`** - Development server environment
- **`.env.production`** - Production environment

## Available Scripts

### Development (with hot reload)

```bash
# Run with local environment (reads from .env.local)
npm start

# Run with dev environment (reads from .env.development)
npm run start:dev

# Run with prod environment (reads from .env.production)
npm run start:prod
```

### Production Builds

```bash
# Build for production (reads from .env.production)
npm run build

# Build for dev environment (reads from .env.development)
npm run build:dev

# Build for local environment (reads from .env.local)
npm run build:local
```

## Environment Variables

Each environment file should contain:

```env
# API Configuration
REACT_APP_API_URL=<your-api-url>

# Environment
REACT_APP_ENV=<local|development|production>

# Other configuration
REACT_APP_API_TIMEOUT=10000
```

## Current Configuration

| Environment | API URL | Port | Use Case |
|------------|---------|------|----------|
| **local** | http://localhost:4000/ | 3000 | Local development with backend on port 4000 |
| **dev** | https://dev-api.yourdomain.com/ | 3000 | Development server testing |
| **prod** | https://api.yourdomain.com/ | N/A | Production deployment |

## How It Works

1. Webpack reads the `ENV_MODE` parameter from the npm script
2. Based on `ENV_MODE`, it loads the corresponding `.env.*` file
3. Environment variables prefixed with `REACT_APP_` are injected into the bundle
4. Access them in your code via `process.env.REACT_APP_*`

## Example Usage in Code

```typescript
// src/config/api.ts
const API_URL = process.env.REACT_APP_API_URL;
const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT);

export const apiConfig = {
  baseURL: API_URL,
  timeout: API_TIMEOUT,
};
```

## Security Notes

- Never commit sensitive credentials to `.env` files
- Use environment variables or secrets management for production
- Keep `.env.local` in `.gitignore` for local overrides
- Update API URLs in `.env.development` and `.env.production` before deployment
