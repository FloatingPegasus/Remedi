# 🚀 Quick Start Guide - Re-medi

Get Re-medi running in 5 minutes!

---

## ⚡ Prerequisites Check

```bash
# Verify you have Node.js installed
node --version
# Should show v16.x or higher

npm --version
# Should show 8.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

---

## 📥 Step 1: Install Dependencies (One-time setup)

Open PowerShell/Terminal and run:

```bash
# Navigate to project root
cd prescripto-full-stack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin dependencies
cd ../admin
npm install
```

**Wait for all installations to complete (~2-3 minutes)**

---

## ⚙️ Step 2: Configure Environment (One-time setup)

### Backend Configuration

1. Navigate to `backend` folder
2. Open `.env` file
3. **Required:** Update these values:

```env
MONGODB_URI = "your_mongodb_atlas_connection_string"
CLOUDINARY_NAME = "your_cloudinary_name"
CLOUDINARY_API_KEY = "your_cloudinary_key"
CLOUDINARY_SECRET_KEY = "your_cloudinary_secret"
```

**Where to get these?**
- **MongoDB:** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) (Free tier available)
- **Cloudinary:** [cloudinary.com](https://cloudinary.com) (Free tier available)

---

## 🎯 Step 3: Run the Application

You'll need **3 terminals** open:

### Terminal 1: Backend Server
```bash
cd backend
node server.js
```

**Wait for:**
```
✅ Database Connected Successfully
✅ Cloudinary Connected Successfully
🚀 Server started successfully on PORT: 4000
💚 All systems ready!
```

---

### Terminal 2: Frontend (User Portal)
```bash
cd frontend
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5173/
```

**Open in browser:** `http://localhost:5173/`

---

### Terminal 3: Admin Panel (Optional)
```bash
cd admin
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5174/
```

**Open in browser:** `http://localhost:5174/`

**Login with:**
- Email: `admin@example.com` (or your custom email from .env)
- Password: `greatstack123` (or your custom password from .env)

---

## ✅ Verify Everything Works

### Test 1: User Registration
1. Go to `http://localhost:5173/`
2. Click "Create Account"
3. Fill in the form
4. Click "Create account" button
5. You should be logged in ✅

### Test 2: Add a Doctor (Admin)
1. Go to `http://localhost:5174/`
2. Login with admin credentials
3. Click "Add Doctor" in sidebar
4. Fill in all fields
5. Upload a doctor image
6. Click "Add doctor" button
7. You should see success message ✅

---

## 🛑 How to Stop

In each terminal, press:
```
Ctrl + C
```

**Your data is safe!** Everything is stored in MongoDB Atlas (cloud) and persists even when servers are stopped.

---

## 🔧 Quick Troubleshooting

### Problem: "Create Account" button doesn't work
**Solution:**
1. Open browser console (Press `F12`)
2. Go to Console tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh page

---

### Problem: Backend won't start
**Solution:**
1. Check you're in the `backend` folder
2. Verify `.env` file exists
3. Check MongoDB Atlas connection string is correct
4. Ensure your IP is whitelisted in MongoDB Atlas

---

### Problem: Port already in use
**Solution (Windows):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
```

**Solution (Mac/Linux):**
```bash
lsof -ti:4000 | xargs kill -9
```

---

## 📱 Access Points Summary

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:4000 | Server/Database |
| **User Portal** | http://localhost:5173 | Patient interface |
| **Admin Panel** | http://localhost:5174 | Admin interface |

---

## 🎊 You're All Set!

**What you can do now:**
- ✅ Register users
- ✅ Add doctors (as admin)
- ✅ Book appointments
- ✅ Manage profiles
- ✅ View dashboards

**Need more details?** Check the full [README.md](README.md)

---

## 💡 Daily Workflow

**Starting your work:**
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd admin && npm run dev
```

**Ending your work:**
- Press `Ctrl+C` in each terminal
- Or just close the terminals
- Your data remains safe in the cloud! 🌥️

---

**Need Help?** Contact: damnbrocrazy@gmail.com


