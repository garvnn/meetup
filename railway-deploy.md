# Deploy to Railway (Recommended)

Railway is perfect for Python APIs with a generous free tier.

## Quick Deploy

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy from python-backend directory:**
   ```bash
   cd python-backend
   railway init
   railway up
   ```

4. **Get your public URL:**
   ```bash
   railway domain
   ```

## What Railway Does

- Automatically detects Python and installs dependencies
- Runs `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Provides a public HTTPS URL
- Handles scaling and monitoring
- Free tier: $5 credit monthly

## Update Your App

After deployment, update your config:

```typescript
// lib/config.ts
API: {
  BASE_URL: 'https://your-app.railway.app',
  // Remove localhost/IP addresses
}
```
