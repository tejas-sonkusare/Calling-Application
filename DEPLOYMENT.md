# Deployment Guide

This guide will help you deploy your video calling application online so it can be accessed from anywhere.

## Deployment Architecture

- **Frontend (React)**: Deploy to Vercel
- **Backend (Node.js/Socket.io)**: Deploy to Railway, Render, or Heroku

## Prerequisites

1. GitHub account (for connecting repositories)
2. Vercel account (free tier available)
3. Railway/Render account (free tiers available)

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Initialize git repository (if not already done)
cd "/Users/tejassonkusare5/Desktop/Projects/Calling Application"
git init
git add .
git commit -m "Initial commit - Video calling app"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/calling-app.git
git push -u origin main
```

---

## Step 2: Deploy Backend Server

The backend needs WebSocket support, so it cannot be deployed on Vercel (serverless). Use one of these options:

### Option A: Railway (Recommended)

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Project**:
   - Railway will auto-detect Node.js
   - Set **Root Directory**: `server`
   - Set **Start Command**: `npm start`

4. **Environment Variables**:
   - Railway automatically provides `PORT` variable
   - No additional variables needed

5. **Get Your Backend URL**:
   - After deployment, Railway provides a URL like: `https://your-app.up.railway.app`
   - Copy this URL (you'll need it for frontend)

### Option B: Render

1. **Sign up**: Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**:
   - **Name**: `calling-app-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. **Environment Variables**:
   - `PORT` is automatically set by Render

5. **Get Your Backend URL**:
   - Render provides: `https://your-app.onrender.com`

### Option C: Heroku

1. **Install Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from heroku.com
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd server
   heroku create your-app-name-backend
   ```

4. **Deploy**:
   ```bash
   git subtree push --prefix server heroku main
   ```

---

## Step 3: Deploy Frontend to Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Project**:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `VITE_SOCKET_URL`
     - **Value**: Your backend URL (from Step 2)
       - Example: `https://your-app.up.railway.app`
       - Example: `https://your-app.onrender.com`
     - **Environments**: Production, Preview, Development

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like: `https://your-app.vercel.app`

---

## Step 4: Update Backend CORS Settings

Update your backend to allow your frontend domain:

### For Railway/Render:

Edit `server/index.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",  // Local development
      "https://your-app.vercel.app",  // Your Vercel domain
      "https://*.vercel.app"  // All Vercel preview deployments
    ],
    methods: ["GET", "POST"]
  }
});
```

Or allow all origins (for testing):
```javascript
origin: "*"
```

---

## Step 5: Test Deployment

1. **Open your frontend URL**: `https://your-app.vercel.app`
2. **Open in two browser windows** (or incognito)
3. **Test the application**:
   - Create a room
   - Join from second window
   - Test video call
   - Test chat
   - Test screen sharing

---

## Production Considerations

### 1. HTTPS Required

- WebRTC requires HTTPS in production
- Vercel and Railway/Render provide HTTPS automatically
- ✅ No additional setup needed

### 2. TURN Server (Optional)

For users behind restrictive firewalls, you may need a TURN server:

```javascript
// In webrtc.js, update STUN_SERVERS:
const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
    // Add TURN server here if needed
  ]
};
```

Free TURN servers:
- Twilio (free tier available)
- Metered.ca (free tier available)

### 3. Environment Variables Summary

**Frontend (Vercel)**:
- `VITE_SOCKET_URL`: Your backend URL

**Backend (Railway/Render)**:
- `PORT`: Automatically set (don't change)

### 4. Custom Domain (Optional)

**Vercel**:
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS setup instructions

**Railway/Render**:
- Both support custom domains in their settings

---

## Quick Deployment Commands

### Railway CLI
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Vercel CLI
```bash
npm i -g vercel
cd client
vercel
```

---

## Troubleshooting

### Issue: WebSocket connection fails
- **Solution**: Check CORS settings in backend
- **Solution**: Verify `VITE_SOCKET_URL` is correct in Vercel

### Issue: Video call doesn't work
- **Solution**: Ensure HTTPS is enabled (required for WebRTC)
- **Solution**: Check browser console for errors

### Issue: Backend not accessible
- **Solution**: Check Railway/Render logs
- **Solution**: Verify PORT is set correctly

### Issue: Environment variables not working
- **Solution**: Vercel requires `VITE_` prefix for client-side variables
- **Solution**: Redeploy after changing environment variables

---

## Cost Estimates

### Free Tiers:
- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Custom domains

- **Railway**: Free tier includes:
  - $5 credit/month
  - Enough for small projects

- **Render**: Free tier includes:
  - Free web services (with limitations)
  - Sleeps after 15min inactivity

### Paid Options:
- Railway: $5-20/month
- Render: $7+/month
- Vercel: $20/month (Pro plan)

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed (Railway/Render)
- [ ] Backend URL obtained
- [ ] Frontend deployed (Vercel)
- [ ] Environment variable `VITE_SOCKET_URL` set
- [ ] CORS updated in backend
- [ ] Tested in production
- [ ] Custom domain configured (optional)

---

## Example URLs After Deployment

**Backend**: `https://calling-app-backend.up.railway.app`
**Frontend**: `https://calling-app.vercel.app`

**Frontend Environment Variable**:
```
VITE_SOCKET_URL=https://calling-app-backend.up.railway.app
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs (Railway/Render dashboard)
3. Verify environment variables are set
4. Test with two different browsers/devices

---

**Your app will be live and accessible from anywhere! 🚀**

