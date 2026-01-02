# 🚀 Deployment Guide - WorkDesks Support

Complete guide to deploy your WorkDesks Support application to free hosting platforms.

---

## 📋 Overview

**Architecture**:
- **Database**: MongoDB Atlas (Free - 512MB)
- **Backend**: Render (Free - 750 hours/month)
- **Frontend**: Vercel (Free - Unlimited)

**Total Cost**: $0/month 🎉

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or email
3. Complete the registration

### 1.2 Create Cluster
1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select a cloud provider (AWS recommended)
4. Choose region closest to you
5. Name your cluster (e.g., `workdesk-cluster`)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.3 Configure Database Access
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `workdesk-admin`
5. Click **"Autogenerate Secure Password"** and **SAVE IT**
6. User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://workdesk-admin:<password>@workdesk-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `workdesk-support` at the end:
   ```
   mongodb+srv://workdesk-admin:YOUR_PASSWORD@workdesk-cluster.xxxxx.mongodb.net/workdesk-support?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING** - you'll need it for backend deployment

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended for easier deployment)
3. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `developer-yasir/workdesk-support`
3. Configure the service:
   - **Name**: `workdesk-support-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### 2.3 Add Environment Variables
Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB connection string from Step 1.5 |
| `JWT_SECRET` | Click "Generate" or use: `your-super-secret-jwt-key-change-this` |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | Leave empty for now (will update after frontend deployment) |

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see: **"Your service is live 🎉"**
4. **COPY YOUR BACKEND URL**: `https://workdesk-support-api.onrender.com`

### 2.5 Verify Backend
1. Visit: `https://workdesk-support-api.onrender.com/api/health`
2. You should see:
   ```json
   {
     "status": "success",
     "message": "WorkDesks Support API is running",
     "timestamp": "2026-01-02T..."
   }
   ```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `developer-yasir/workdesk-support`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variable
1. Click **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://workdesk-support-api.onrender.com/api`
   - Select: **Production**, **Preview**, **Development**

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Once deployed, you'll get your live URL: `https://workdesk-support.vercel.app`

---

## 🔄 Step 4: Update Backend CORS

### 4.1 Update Frontend URL in Render
1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Click on your **workdesk-support-api** service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL`:
   - **Value**: `https://workdesk-support.vercel.app`
5. Click **"Save Changes"**
6. Service will automatically redeploy

---

## ✅ Step 5: Test Your Live Application

### 5.1 Visit Your App
1. Go to: `https://workdesk-support.vercel.app`
2. You should see the login page

### 5.2 Test Registration
1. Click **"Register"** or use demo account
2. Try logging in with:
   - Email: `superadmin@workdesks.com`
   - Password: `super123`

### 5.3 Verify Everything Works
- ✅ Login successful
- ✅ Dashboard loads
- ✅ Can create tickets
- ✅ No errors in browser console

---

## 🎉 Your App is Live!

**Frontend**: https://workdesk-support.vercel.app  
**Backend**: https://workdesk-support-api.onrender.com  
**Database**: MongoDB Atlas

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render (Backend)**:
- Sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month (enough for 24/7 if only one service)

**MongoDB Atlas**:
- 512MB storage limit
- Shared cluster (slower performance)

**Vercel (Frontend)**:
- Unlimited bandwidth
- No sleep/cold starts
- Fast global CDN

### Keeping Backend Awake (Optional)
To prevent cold starts, you can use a free service like [UptimeRobot](https://uptimerobot.com):
1. Create account
2. Add monitor: `https://workdesk-support-api.onrender.com/api/health`
3. Check every 5 minutes
4. This keeps your backend awake

---

## 🔧 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Verify backend is running (visit `/api/health`)
- Check browser console for CORS errors

### CORS errors
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- No trailing slash in URLs

### Database connection failed
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string password is correct
- Ensure database user has proper permissions

---

## 📱 Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel project settings
2. Click **"Domains"**
3. Add your domain
4. Follow DNS configuration instructions

### Render Custom Domain (Paid)
- Custom domains on Render require paid plan

---

## 🔄 Updating Your App

### Update Code
1. Push changes to GitHub
2. Vercel and Render will auto-deploy
3. Check deployment status in respective dashboards

### Manual Redeploy
- **Vercel**: Go to Deployments → Click "Redeploy"
- **Render**: Go to service → Click "Manual Deploy"

---

## 📊 Monitoring

### Render Dashboard
- View logs
- Monitor CPU/Memory usage
- Check deployment history

### Vercel Analytics
- View page views
- Monitor performance
- Check build logs

### MongoDB Atlas
- Monitor database size
- View connection metrics
- Check query performance

---

## 🎯 Next Steps

1. ✅ Test all features thoroughly
2. ✅ Share your live URL with users
3. ✅ Monitor performance and errors
4. ✅ Consider upgrading to paid tiers if needed

**Congratulations! Your WorkDesks Support app is now live! 🚀**
