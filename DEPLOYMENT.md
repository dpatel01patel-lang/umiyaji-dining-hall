# Umiya Ji Dining Hall - Deployment Instructions

## 📋 Prerequisites
Tamne aa files北斗 chhe karvana:
1. GitHub Account
2. Render Account (free account) - https://render.com
3. MongoDB Atlas Account (free tier) - https://cloud.mongodb.com

## 🚀 Step-by-Step Deployment Process

### 1. GitHub Repository Banavo

```bash
# Git Initialize
git init

# Add Files to Git
git add .

# First Commit
git commit -m "Initial commit: Umiya Ji Dining Hall application"

# GitHub Repository Banavo:
# 1. GitHub.com ma jao
# 2. "New Repository" click karo
# 3. Name: "umiya-dining-hall" (naam tamne jem janvani hoy)
# 4. Public choose karo
# 5. "Create repository" click karo

# GitHub Remote Add karo
git remote add origin https://github.com/YOUR_USERNAME/umiya-dining-hall.git

# Git Push karo
git branch -M main
git push -u origin main
```

### 2. MongoDB Atlas Setup

1. **MongoDB Atlas ma jao:** https://cloud.mongodb.com
2. **Sign up/Login karo**
3. **New Project banavo:**
   - "New Project" click karo
   - Project name: "Umiya Dining Hall"
   - "Create Project" click karo

4. **Database Create karo:**
   - "Build a Database" click karo
   - "Shared" plan choose karo (free)
   - Cloud provider: "AWS"
   - Region: "Mumbai (ap-south-1)" (India nu nazdik region)
   - Cluster name: "UmiyaDiningCluster"
   - "Create Cluster" click karo

5. **Database Access banavo:**
   - "Database Access" tab ma jao
   - "Add New Database User" click karo
   - Authentication method: "Password"
   - Username: "adminuser"
   - Password: "Umiya123!@#" (strong password)
   - Role: "Atlas admin"
   - "Add User" click karo

6. **Network Access karvo:**
   - "Network Access" tab ma jao
   - "Add IP Address" click karo
   - "Allow access from anywhere" choose karo (0.0.0.0/0)
   - "Confirm" click karo

7. **Connection String copy karo:**
   - "Clusters" tab ma jao
   - "Connect" click karo tamara cluster nu
   - "Connect your application" choose karo
   - Connection string copy karo:
     `mongodb+srv://adminuser:Umiya123!@#@cluster0.xxxxxx.mongodb.net/umiya-dining-hall?retryWrites=true&w=majority`

### 3. Render Backend Deployment

1. **Render.com ma jao:** https://render.com
2. **Sign up karo** (GitHub account use karo)

3. **New Web Service Create karo:**
   - "New +" click karo
   - "Web Service" choose karo
   - "Build and deploy from a Git repository" choose karo
   - Tamara GitHub repository connect karo
   - Repository select karo

4. **Service Configure karo:**
   - Name: `umiya-dining-backend`
   - Region: "Mumbai (India)"
   - Branch: "main"
   - Root Directory: "backend"
   - Runtime: "Node"
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Environment Variables Add karo:**
   - "Environment" tab ma jao
   - "Add Environment Variable" click karo:
   
   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | PORT | 10000 |
   | MONGODB_URI | Tamaro MongoDB Atlas connection string |
   | JWT_SECRET | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` (terminal ma run kari ne copy kar) |
   | ADMIN_NAME | Umiya Ji Dining Hall |
   | ADMIN_EMAIL | admin@umiyajidining.com |
   | ADMIN_PASSWORD | Umiya123!@# |
   | CORS_ORIGINS | `https://umiya-dining-frontend.onrender.com` |

6. **Create Web Service click karo**

### 4. Render Frontend Deployment

1. **New Static Site Create karo:**
   - "New +" click karo
   - "Static Site" choose karo
   - GitHub repository connect karo

2. **Site Configure karo:**
   - Name: `umiya-dining-frontend`
   - Branch: "main"
   - Root Directory: "front"
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Environment Variable Add karo:**
   - `VITE_API_URL`: Tamaro backend URL (je aapde banayu che, e.g., https://umiya-dining-backend.onrender.com)

4. **Create Static Site click karo**

### 5. Security & Testing

1. **CORS Setup karo:** Backend ma frontend URL add karvani che
2. **Admin Login test karo**
3. **Database connections verify karo**
4. **All API endpoints test karo**

### 6. Final URLs

Deployment完成后 tamara URLs北斗:
- **Frontend:** https://umiya-dining-frontend.onrender.com
- **Backend API:** https://umiya-dining-backend.onrender.com
- **Database:** MongoDB Atlas (tamara cluster)

## 🔧 Troubleshooting

### Backend Issues:
- Log check karo Render dashboard ma
- Environment variables verify karo
- MongoDB connection check karo

### Frontend Issues:
- Build logs check karo
- VITE_API_URL verify karo
- CORS issues thay to admin ma CORS_ORIGINS update karo

### Database Issues:
- IP whitelist check karo MongoDB Atlas ma
- Connection string verify karo
- User credentials check karo

## 📞 Support

Koi pan problem ave to:
1. Render logs check karo
2. Browser console error check karo
3. Network tab ma API calls check karo

---

**🎉 Tamari Deployment Successful!**

Tamara application live che ane globally accessible che!