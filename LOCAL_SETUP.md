# Running Locally for Video Calls

Yes! You can run the app locally and make video calls with friends. Here's how:

## Quick Start (3 Steps)

### Step 1: Start Backend Server

```bash
cd server
npm start
```

You should see:
```
Signaling server running on port 3001
```

### Step 2: Start Frontend

**In a new terminal window:**

```bash
cd client
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

Open: **http://localhost:5173**

## Making Video Calls

### Option A: Same Computer (Testing)

1. Open http://localhost:5173 in **Tab 1**
2. Open http://localhost:5173 in **Tab 2** (or incognito)
3. Create room in Tab 1
4. Join room in Tab 2
5. Start video call!

### Option B: Different Computers (You & Friend)

#### For Your Computer:

1. **Find your local IP address:**

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address` (usually starts with `192.168.x.x` or `10.x.x.x`)

**Example IP**: `192.168.1.100`

2. **Start servers** (both backend and frontend)

3. **Share with your friend:**
   - Your IP: `192.168.1.100`
   - URL: `http://192.168.1.100:5173`

#### For Your Friend:

1. They open: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
2. You both create/join the same room
3. Start video calling!

## Important Notes

### Same Network Required
- ✅ Both computers must be on the **same WiFi/network**
- ❌ Won't work if friend is on different network

### Firewall
- Make sure firewall allows connections on ports:
  - **3001** (backend)
  - **5173** (frontend)

**Mac - Allow Firewall:**
```bash
# System Settings → Network → Firewall → Options
# Allow incoming connections for Node.js
```

**Windows - Allow Firewall:**
- Windows Defender → Allow an app
- Add Node.js and allow both ports

### Update Socket URL for Friend

**Option 1: Use Your IP (Recommended)**

Create `.env` file in `client/` folder:
```bash
cd client
echo "VITE_SOCKET_URL=http://YOUR_IP:3001" > .env
```

Replace `YOUR_IP` with your actual IP (e.g., `192.168.1.100`)

**Option 2: Use localhost (Only for same computer)**

Already set to `http://localhost:3001` by default.

## Quick Commands

### Start Everything:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### Stop Servers:
Press `Ctrl + C` in each terminal

## Troubleshooting

### Issue: Friend can't connect
**Solution:**
- Check if both on same WiFi
- Verify firewall allows connections
- Check if IP address is correct
- Make sure backend is running

### Issue: "Connection error" in console
**Solution:**
- Make sure backend is running on port 3001
- Check if `VITE_SOCKET_URL` points to correct IP
- Verify no firewall blocking

### Issue: Video not showing
**Solution:**
- Grant camera/microphone permissions
- Check browser console for errors
- Make sure both users granted permissions

## Testing Checklist

- [ ] Backend running (port 3001)
- [ ] Frontend running (port 5173)
- [ ] Both tabs/computers can access app
- [ ] Camera/mic permissions granted
- [ ] Same room ID used
- [ ] Video appears in both windows

## Example Scenario

**You:**
- IP: `192.168.1.100`
- Start backend: `npm start` (in server folder)
- Start frontend: `npm run dev` (in client folder)
- Open: `http://localhost:5173`

**Friend:**
- Opens: `http://192.168.1.100:5173`
- Joins same room ID
- Video call works!

## For Internet Access (Different Networks)

If you want to call someone on a different network (not same WiFi), you need to:
1. Deploy backend online (Railway/Render)
2. Deploy frontend online (Vercel)
3. Use the online URLs

But for local testing on same network, this works perfectly! ✅

