#!/bin/bash

echo "🚀 Starting SHEIN Helper App Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "📱 Starting mobile app (React Native with Expo)..."
cd shein-shopping-app

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing mobile app dependencies..."
    npm install
fi

# Start the Expo development server in the background
echo "🔄 Starting Expo development server..."
npm start &
EXPO_PID=$!

# Wait a moment for Expo to start
sleep 3

echo ""
echo "✅ Mobile app is starting!"
echo "📱 Scan the QR code with Expo Go app on your phone"
echo "🌐 Or press 'w' to open in web browser"
echo ""

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep mongod > /dev/null; then
        echo "⚠️  MongoDB is not running. Starting MongoDB..."
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data
    else
        echo "✅ MongoDB is already running"
    fi
fi

# Start backend server
echo "🔧 Starting backend API server..."
cd ../shein-backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Start the backend server
echo "🔄 Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo ""
echo "🎉 SHEIN Helper App is now running!"
echo "=================================================="
echo "📱 Mobile App: http://localhost:19006 (web) or scan QR code"
echo "🔧 Backend API: http://localhost:3000"
echo "🔍 API Health: http://localhost:3000/health"
echo ""
echo "To stop the servers:"
echo "  Press Ctrl+C or run: kill $EXPO_PID $BACKEND_PID"
echo ""

# Wait for user to stop
wait