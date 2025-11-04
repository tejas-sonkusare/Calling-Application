# Troubleshooting: "Waiting for peer to join" Issue

## Problem
You deployed the app on Vercel but can't connect with friends - stuck on "Waiting for peer to join"

## Root Cause
The frontend cannot connect to the backend signaling server. This happens when:
1. Backend server is not deployed
2. Environment variable `VITE_SOCKET_URL` is not set in Vercel
3. Backend URL is incorrect

## Solution Steps

### Step 1: Deploy Backend Server (If Not Done)

You MUST deploy the backend server. The frontend alone won't work.

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repository: `tejas-sonkusare/Calling-Application`
5. **IMPORTANT**: Set **Root Directory** to: `server`
6. Click Deploy
7. Wait for deployment (2-3 minutes)
8. Copy the URL (looks like: `https://your-app.up.railway.app`)

**Option B: Render**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo: `tejas-sonkusare/Calling-Application`
4. **Root Directory**: `server`
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. Deploy and copy URL

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name**: `VITE_SOCKET_URL`
   - **Value**: Your backend URL (from Step 1)
     - Example: `https://your-app.up.railway.app`
     - **MUST use HTTPS in production**
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **IMPORTANT**: Go to **Deployments** tab
7. Click the **3 dots** (⋯) on latest deployment
8. Click **Redeploy**
9. Wait for redeploy to complete

### Step 3: Verify Connection

1. Open your Vercel app URL
2. Open browser **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for: `"Connected to signaling server: [socket-id]`
5. If you see connection errors, check:
   - Is backend URL correct?
   - Is backend deployed and running?
   - Did you redeploy frontend after adding env variable?

### Step 4: Test Connection

1. Open your app in two browser windows
2. Check browser console in both windows
3. Both should show: `"Connected to signaling server"`
4. Create room in one, join in the other
5. Should connect now!

## Common Issues

### Issue: "Connection error" in console
**Solution**: 
- Backend not deployed OR
- Wrong `VITE_SOCKET_URL` value OR
- Backend is down

### Issue: "CORS error"
**Solution**: 
- Backend CORS is set to `"*"` which should work
- If not, update `server/index.js` line 12:
```javascript
origin: process.env.FRONTEND_URL || "https://your-vercel-app.vercel.app"
```

### Issue: Backend URL shows localhost
**Solution**: 
- Environment variable not set in Vercel
- Or not redeployed after setting it

### Issue: Backend deployed but URL doesn't work
**Solution**:
- Check Railway/Render logs for errors
- Verify PORT is set correctly (auto-set by platform)
- Check if service is running (not sleeping)

## Quick Checklist

- [ ] Backend deployed (Railway/Render)
- [ ] Backend URL copied
- [ ] `VITE_SOCKET_URL` set in Vercel
- [ ] Vercel app redeployed after setting env variable
- [ ] Browser console shows "Connected to signaling server"
- [ ] Both users can see each other's video

## Still Not Working?

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors (red text)
   - Share error messages

2. **Check Backend Logs**:
   - Go to Railway/Render dashboard
   - View logs
   - Check for connection attempts

3. **Verify URLs**:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-backend.up.railway.app`
   - Make sure both use HTTPS

4. **Test Backend Directly**:
   - Open backend URL in browser
   - Should see connection (or error page is fine)
   - Means backend is accessible

## Example Setup

**Backend (Railway)**:
- URL: `https://calling-app-backend.up.railway.app`

**Frontend (Vercel)**:
- URL: `https://calling-app.vercel.app`
- Environment Variable:
  - `VITE_SOCKET_URL` = `https://calling-app-backend.up.railway.app`

**Both URLs must be HTTPS in production!**

