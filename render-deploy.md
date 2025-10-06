# Deploy to Render

Render offers free hosting for Python APIs.

## Setup

1. **Create account at render.com**
2. **Connect your GitHub repository**
3. **Create new Web Service**

## Configuration

**Build Command:**
```bash
cd python-backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd python-backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**
- `PYTHON_VERSION`: 3.9

## Benefits

- Free tier available
- Automatic HTTPS
- Custom domains
- Auto-deploy from Git
- Built-in monitoring

## After Deployment

Update your config with the Render URL:
```typescript
API: {
  BASE_URL: 'https://your-app.onrender.com',
}
```
