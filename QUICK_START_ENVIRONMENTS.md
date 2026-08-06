# Quick Start - Environment Modes

## 🚀 Run Commands

| Command | Environment | API URL | Use For |
|---------|-------------|---------|---------|
| `npm start` | **local** (.env.local) | http://localhost:4000/ | Local development |
| `npm run start:dev` | **dev** (.env.development) | https://dev-api.yourdomain.com/ | Dev server testing |
| `npm run start:prod` | **prod** (.env.production) | https://api.yourdomain.com/ | Production testing |

## 📦 Build Commands

| Command | Environment | Output |
|---------|-------------|--------|
| `npm run build` | **prod** | Production-ready bundle |
| `npm run build:dev` | **dev** | Dev server bundle |
| `npm run build:local` | **local** | Local build |

## 📝 Environment Files

- `.env.local` - Your local settings (gitignored, use .env.local.example as template)
- `.env.development` - Dev server configuration
- `.env.production` - Production configuration

## ⚙️ Configuration

Each environment file has:
```env
REACT_APP_API_URL=<backend-url>
REACT_APP_ENV=<environment-name>
REACT_APP_API_TIMEOUT=10000
```

## 🔧 First Time Setup

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your backend URL (default: http://localhost:4000/)

3. Run the app:
   ```bash
   npm start
   ```

## 📖 Full Documentation

See `ENVIRONMENT_CONFIG.md` for complete details.
