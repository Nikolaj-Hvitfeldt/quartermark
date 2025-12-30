# Deployment Guide

This guide explains how to deploy QuarterMark to Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub repository with the code
- Render account (free tier works)
- Vercel account (free tier works)

## Deploy Backend to Render

1. **Create a new Web Service on Render**:
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**:
   - **Name**: `quartermark-api` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `QuarterMark.Api`
   - **Dockerfile Path**: `./Dockerfile` (or just `Dockerfile`)
     - Note: When Root Directory is set to `QuarterMark.Api`, the Dockerfile Path should be relative to that directory, so use `./Dockerfile` or `Dockerfile`

3. **Environment Variables**:
   - Add `ASPNETCORE_ENVIRONMENT` = `Production`
   - Add `AllowedOrigins` = `https://your-vercel-app.vercel.app` (you'll get this after deploying frontend)
     - For multiple origins, use comma-separated: `https://your-app.vercel.app,https://your-custom-domain.com`
   - Note: Render will provide `PORT` automatically (the code already handles this)

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build to complete
   - Copy the service URL (e.g., `https://quartermark-api.onrender.com`)

## Deploy Frontend to Vercel

1. **Create a new project on Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure the project**:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `QuarterMark.Web`
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

3. **Environment Variables**:
   - Add `VITE_API_URL` = `https://your-render-backend.onrender.com`
     - Replace with your actual Render backend URL (without trailing slash)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Copy the deployment URL (e.g., `https://quartermark.vercel.app`)

## Update Backend CORS (After Frontend Deployment)

1. **Go back to Render**:
   - Open your backend service
   - Go to "Environment" tab
   - Update `AllowedOrigins` to include your Vercel URL:
     ```
     https://your-vercel-app.vercel.app
     ```
   - If you have a custom domain, add it too:
     ```
     https://your-vercel-app.vercel.app,https://your-custom-domain.com
     ```

2. **Redeploy** the backend service (or it may auto-redeploy)

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to your project settings → Domains
2. Add your custom domain
3. Update `AllowedOrigins` in Render to include the custom domain

### Render (Backend)
1. Go to your service settings → Custom Domains
2. Add your custom domain
3. Update `VITE_API_URL` in Vercel environment variables

## Troubleshooting

### Backend Issues

- **CORS Errors**: Make sure `AllowedOrigins` in Render includes your Vercel URL (including `https://`)
- **SignalR Connection Issues**: Ensure WebSockets are enabled (Render supports this by default)
- **Port Issues**: Render uses port 10000 by default, but the Dockerfile should handle this

### Frontend Issues

- **Cannot connect to backend**: Verify `VITE_API_URL` is set correctly in Vercel environment variables
- **Build failures**: Check that all dependencies are in `package.json` and `npm install` completes successfully
- **404 on routes**: The `vercel.json` rewrite rule should handle this, but verify it's configured correctly

## Local Development

### Frontend Environment Variables

For local development, copy the example file and create `.env.local`:

```bash
cd QuarterMark.Web
cp .env.example .env.local
```

Or manually create `QuarterMark.Web/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### Backend Environment Variables

The backend uses `appsettings.json` for configuration. For local development, the default CORS origins are already configured in `appsettings.json`.

If you need to override environment variables locally:

**Windows (PowerShell):**
```powershell
$env:AllowedOrigins="http://localhost:3000"
$env:ASPNETCORE_ENVIRONMENT="Development"
```

**Windows (CMD):**
```cmd
set AllowedOrigins=http://localhost:3000
set ASPNETCORE_ENVIRONMENT=Development
```

**Linux/Mac:**
```bash
export AllowedOrigins=http://localhost:3000
export ASPNETCORE_ENVIRONMENT=Development
```

### Required Environment Variables Summary

#### Render (Backend)
- `ASPNETCORE_ENVIRONMENT` = `Production`
- `AllowedOrigins` = `https://your-vercel-app.vercel.app` (comma-separated for multiple)
- `PORT` = (automatically set by Render, no need to configure)

#### Vercel (Frontend)
- `VITE_API_URL` = `https://your-render-backend.onrender.com` (without trailing slash)

