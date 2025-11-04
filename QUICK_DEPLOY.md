# Quick Deployment Guide

## Yes, you can deploy this online! 🚀

After deployment, your app will be accessible from anywhere with an internet connection.

## Quick Steps

### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Video calling app"
git remote add origin https://github.com/YOUR_USERNAME/calling-app.git
git push -u origin main
```

### 2. Deploy Backend (Choose One)

**Railway (Easiest)**:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repo
5. Set Root Directory: `server`
6. Deploy! ✅

**Render**:
1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Deploy! ✅

**Get Backend URL**: Copy the URL (e.g., `https://your-app.up.railway.app`)

### 3. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. New Project → Import GitHub repo
4. Root Directory: `client`
5. **Add Environment Variable**:
   - Name: `VITE_SOCKET_URL`
   - Value: Your backend URL from step 2
6. Deploy! ✅

### 4. Update Backend CORS (If Needed)

Edit `server/index.js` line 12:
```javascript
origin: process.env.FRONTEND_URL || "https://your-app.vercel.app"
```

Or keep `"*"` for testing.

## After Deployment

✅ **Frontend URL**: `https://your-app.vercel.app`
✅ **Backend URL**: `https://your-app.up.railway.app`

## Test It

1. Open your frontend URL in two browser windows
2. Create a room in one
3. Join from the other
4. Start video calling! 🎥

## All Free Tiers Available!

- Vercel: Free forever
- Railway: $5 credit/month (enough for small apps)
- Render: Free tier available

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.

---

**Your app will work online from anywhere! 🌍**

