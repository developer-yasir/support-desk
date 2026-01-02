# 🚀 Deploy to Vercel - Quick Guide

## Overview

Deploy your WorkDesks Support application to Vercel for **FREE**!

**What you'll deploy:**
- ✅ Frontend (React app) on Vercel
- ✅ Backend API on Render (free tier)
- ✅ Database on MongoDB Atlas (free tier)

**Total Cost**: $0/month 🎉

---

## 📋 Prerequisites

- GitHub account (you already have this ✅)
- Your code is pushed to GitHub ✅

---

## 🗄️ Step 1: Setup MongoDB Atlas (5 minutes)

### Quick Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google
3. Click **"Build a Database"** → Choose **"M0 Free"**
4. Click **"Create Cluster"** (wait 3-5 minutes)

### Configure Access:
1. **Database Access**: Add user
   - Username: `workdesk-admin`
   - Password: Click "Autogenerate" and **SAVE IT**
   - Role: Atlas admin

2. **Network Access**: Add IP
   - Click "Allow Access from Anywhere" (0.0.0.0/0)

### Get Connection String:
1. Click **"Connect"** → **"Connect your application"**
2. Copy the connection string
3. Replace `<password>` with your saved password
4. Add `/workdesk-support` before the `?`:
   ```
   mongodb+srv://workdesk-admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/workdesk-support?retryWrites=true&w=majority
   ```
5. **SAVE THIS** - you'll need it next!

---

## 🔧 Step 2: Deploy Backend to Render (5 minutes)

### Quick Deploy:
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your repository: `developer-yasir/workdesk-support`

### Configure:
- **Name**: `workdesk-support-api`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### Environment Variables:
Click "Advanced" and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB connection string from Step 1 |
| `JWT_SECRET` | `workdesk-super-secret-jwt-key-2026` |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | `*` (we'll update this later) |

### Deploy:
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. **COPY YOUR BACKEND URL**: `https://workdesk-support-api.onrender.com`

### Verify:
Visit: `https://workdesk-support-api.onrender.com/api/health`

Should see: `{"status":"success","message":"WorkDesks Support API is running"}`

---

## 🎨 Step 3: Deploy Frontend to Vercel (3 minutes)

### Quick Deploy:
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import: `developer-yasir/workdesk-support`

### Configure:
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Add Environment Variable:
1. Click **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://workdesk-support-api.onrender.com/api`
   - Check all: Production, Preview, Development

### Deploy:
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. **YOUR APP IS LIVE!** 🎉

You'll get a URL like: `https://workdesk-support.vercel.app`

---

## 🔄 Step 4: Update Backend CORS (1 minute)

1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Click your `workdesk-support-api` service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://workdesk-support.vercel.app
   ```
5. Click **"Save Changes"** (auto-redeploys)

---

## ✅ Step 5: Test Your Live App!

1. Visit your Vercel URL: `https://workdesk-support.vercel.app`
2. Try logging in with demo account:
   - Email: `superadmin@workdesks.com`
   - Password: `super123`
3. Create a test ticket
4. Verify everything works!

---

## 🎉 You're Live!

**Your URLs:**
- 🌐 **Frontend**: https://workdesk-support.vercel.app
- 🔧 **Backend**: https://workdesk-support-api.onrender.com
- 🗄️ **Database**: MongoDB Atlas

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Render Backend**: Sleeps after 15 min of inactivity
  - First request after sleep: 30-60 seconds
  - Solution: Use [UptimeRobot](https://uptimerobot.com) to ping every 5 min
- **MongoDB Atlas**: 512MB storage limit
- **Vercel**: No limitations! ✨

### Keeping Backend Awake (Optional):
1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create free account
3. Add monitor: `https://workdesk-support-api.onrender.com/api/health`
4. Check every 5 minutes

---

## 🔧 Troubleshooting

### "Cannot connect to backend"
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is running (visit `/api/health`)
- Check browser console for errors

### CORS errors
- Update `FRONTEND_URL` in Render to match your Vercel URL exactly
- No trailing slash

### Backend won't start
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set

---

## 🔄 Updating Your App

Just push to GitHub - both Vercel and Render will auto-deploy! 🚀

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. Go to your Vercel project
2. Settings → Domains
3. Add your domain
4. Follow DNS instructions

**Free on Vercel!** No extra cost for custom domains.

---

## 🎯 Next Steps

- ✅ Share your live URL
- ✅ Test all features
- ✅ Monitor in Vercel/Render dashboards
- ✅ Set up UptimeRobot to prevent cold starts

**Congratulations! Your app is live! 🚀**
