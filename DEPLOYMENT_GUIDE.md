# SHEIN Helper - Deployment Guide

Complete deployment guide for the SHEIN Helper mobile app and backend API.

## 🚀 Quick Deployment

### Option 1: Local Development (Recommended for testing)

1. **Start everything with one command:**
```bash
cd /workspace
./start-app.sh
```

This script will:
- Install all dependencies
- Start the Expo development server
- Start the backend API server
- Create necessary configuration files

### Option 2: Manual Setup

#### Mobile App
```bash
cd shein-shopping-app
npm install
npm start  # Scan QR code with Expo Go app
```

#### Backend API
```bash
cd shein-backend
npm install
cp .env.example .env  # Edit with your configuration
npm run dev
```

## 🌐 Production Deployment

### Mobile App to App Stores

#### Prerequisites
1. **Apple Developer Account** ($99/year) for iOS
2. **Google Play Console Account** ($25 one-time) for Android
3. **Expo Application Services (EAS)** account

#### Build and Submit
```bash
cd shein-shopping-app

# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Backend API to Cloud

#### Option 1: Heroku (Easiest)
```bash
cd shein-backend

# Install Heroku CLI
# Create Heroku app
heroku create shein-helper-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git init
git add .
git commit -m "Initial deployment"
heroku git:remote -a shein-helper-api
git push heroku main
```

#### Option 2: DigitalOcean App Platform
```bash
# Build the app
npm run build

# Create app.yaml
spec:
  name: shein-helper-api
  services:
  - name: api
    source_dir: /
    github:
      repo: your-username/shein-helper
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
    - key: NODE_ENV
      value: production
```

#### Option 3: AWS EC2
```bash
# Create EC2 instance (Ubuntu 20.04)
# Install Node.js and MongoDB
sudo apt update
sudo apt install nodejs npm mongodb

# Clone repository
git clone your-repository
cd shein-backend

# Install dependencies
npm install
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name shein-api
pm2 startup
pm2 save
```

## 🗄 Database Setup

### MongoDB Atlas (Cloud - Recommended)

1. **Create Atlas Account**
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Set up database user
   - Configure network access

2. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/shein-shopping-app
```

3. **Update Environment Variables**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shein-shopping-app
```

### Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Create database
mongo
> use shein-shopping-app
> exit
```

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: "SHEIN Helper"
4. Enable Google Analytics (optional)

### 2. Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google (optional)
4. Configure authorized domains

### 3. Enable Cloud Messaging
1. Go to Cloud Messaging
2. Generate server key
3. Configure notification settings

### 4. Get Configuration
1. Go to Project Settings → General
2. Add iOS app (bundle ID: com.sheinhelper.app)
3. Add Android app (package name: com.sheinhelper.app)
4. Download configuration files

### 5. Update App Configuration
```typescript
// src/services/firebase.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🔧 Environment Configuration

### Mobile App Environment
```bash
# .env (create in shein-shopping-app/)
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_FIREBASE_CONFIG=your-firebase-config-json
```

### Backend Environment
```bash
# .env (create in shein-backend/)
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shein-shopping-app
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRES_IN=7d

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-app-domain.com,https://your-web-app.com
```

## 📱 App Store Submission

### iOS App Store

1. **Prepare App**
   - Update version in `app.json`
   - Add app icons and splash screens
   - Test on physical iOS device

2. **Build for App Store**
```bash
eas build --platform ios --profile production
```

3. **Submit via EAS**
```bash
eas submit --platform ios
```

4. **App Store Connect**
   - Add app metadata
   - Upload screenshots
   - Set pricing and availability
   - Submit for review

### Google Play Store

1. **Prepare App**
   - Update version in `app.json`
   - Add adaptive icons
   - Test on Android device

2. **Build for Play Store**
```bash
eas build --platform android --profile production
```

3. **Submit via EAS**
```bash
eas submit --platform android
```

4. **Play Console**
   - Complete store listing
   - Upload screenshots
   - Set content rating
   - Publish to production

## 🔍 Health Checks & Monitoring

### Backend Health Check
```bash
curl https://your-api-domain.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "SHEIN Shopping API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Mobile App Testing
1. Download from app store
2. Test core user flow:
   - Home → Product Code → Cart → Order → Tracking
3. Verify push notifications work
4. Test offline functionality

## 🚨 Troubleshooting

### Common Deployment Issues

#### Mobile App Issues
1. **Build Failures**
   - Check Expo SDK version compatibility
   - Verify all dependencies are installed
   - Clear Expo cache: `expo start --clear`

2. **Firebase Authentication Issues**
   - Verify Firebase configuration
   - Check bundle ID/package name matches
   - Ensure Firebase project is active

#### Backend Issues
1. **Database Connection Failed**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Test database connectivity

2. **Environment Variables Missing**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify .env file is loaded

3. **CORS Errors**
   - Update ALLOWED_ORIGINS
   - Check preflight request handling
   - Verify mobile app API URL

### Performance Issues
1. **Slow API Responses**
   - Check database indexes
   - Monitor query performance
   - Implement caching

2. **Mobile App Lag**
   - Optimize images and assets
   - Reduce bundle size
   - Profile React Native performance

## 📊 Monitoring Setup

### Backend Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start with monitoring
pm2 start dist/index.js --name shein-api
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate
```

### Database Monitoring
- MongoDB Atlas: Built-in monitoring dashboard
- Local MongoDB: Use MongoDB Compass

### Mobile App Analytics
- Firebase Analytics (free)
- Expo Analytics
- Custom event tracking

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy SHEIN Helper

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd shein-backend && npm install
      - run: cd shein-backend && npm run build
      - run: cd shein-backend && npm test
      # Add deployment steps

  build-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd shein-shopping-app && npm install
      - run: cd shein-shopping-app && eas build --platform all --non-interactive
```

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Performance optimization complete
- [ ] Security audit completed
- [ ] Database backups configured
- [ ] Error monitoring setup
- [ ] App store assets prepared

### Launch Day
- [ ] Deploy backend to production
- [ ] Submit mobile app to stores
- [ ] Configure DNS and SSL
- [ ] Set up monitoring alerts
- [ ] Prepare customer support

### Post-Launch
- [ ] Monitor error rates
- [ ] Track user adoption
- [ ] Gather user feedback
- [ ] Plan feature updates
- [ ] Scale infrastructure as needed

---

**Your SHEIN Helper app is ready for deployment! 🎉**