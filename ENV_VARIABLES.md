# Environment Variables Reference

This file lists all environment variables needed for deployment and local development.

## Quick Reference

### Render (Backend) - Required

Set these in Render Dashboard → Your Service → Environment tab:

```
ASPNETCORE_ENVIRONMENT=Production
AllowedOrigins=https://your-frontend.vercel.app
```

**Important Notes:**
- Replace `your-frontend.vercel.app` with your actual Vercel URL (you'll get this after deploying frontend)
- For multiple origins, use comma-separated: `https://app1.vercel.app,https://app2.vercel.app`
- **Do NOT set PORT** - Render sets this automatically

### Vercel (Frontend) - Required

Set this in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com
```

**Important Notes:**
- Replace `your-backend.onrender.com` with your actual Render backend URL (without trailing slash)
- Use `https://` not `http://`

### Deployment Order

1. Deploy backend to Render first (you can set `AllowedOrigins` to a placeholder initially)
2. Copy your backend URL (e.g., `https://quartermark-api.onrender.com`)
3. Deploy frontend to Vercel with `VITE_API_URL` set to your backend URL
4. Copy your frontend URL (e.g., `https://quartermark.vercel.app`)
5. Update `AllowedOrigins` in Render to match your frontend URL
6. Redeploy backend if needed

### Local Development - Frontend
Create `QuarterMark.Web/.env.local`:
```
VITE_API_URL=http://localhost:5000
```

### Local Development - Backend
Uses `appsettings.json` by default. Can override with environment variables:
- `ASPNETCORE_ENVIRONMENT=Development` (optional, defaults to Development)
- `AllowedOrigins=http://localhost:3000` (optional, already in appsettings.json)

## Detailed Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

