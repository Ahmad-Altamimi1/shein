# SHEIN Helper - Shopping Intermediary Mobile App

A modern React Native mobile application that simplifies purchasing products from SHEIN for regular users. Built with Expo and designed for young adults (18-35 years old) with a focus on ease of use, speed, and seamless user experience.

## 🚀 Features

### Core Functionality
- **Product Code Entry**: Easy input and validation of SHEIN product codes
- **Barcode Scanning**: Camera-based barcode scanning for quick product lookup
- **Smart Cart Management**: Add, remove, and modify cart items with quantity controls
- **Order Merging**: Combine multiple items to reduce shipping costs
- **Real-time Order Tracking**: Live status updates from order placement to delivery
- **Personalized Recommendations**: AI-powered product suggestions based on user history
- **User Account Management**: Profile, addresses, payment methods, and preferences

### Advanced Features
- **3D Product Visualization**: Interactive 3D models using Three.js
- **Augmented Reality**: AR product preview (optional feature)
- **Push Notifications**: Real-time order updates and promotional alerts
- **Loyalty Rewards**: Points system with tier progression
- **Social Sharing**: Share favorite products with friends
- **Offline Support**: Local data persistence with AsyncStorage

## 🛠 Technology Stack

### Frontend (Mobile App)
- **React Native** with **Expo** (cross-platform iOS & Android)
- **React Native Paper** - Modern Material Design UI components
- **React Navigation** - Navigation and routing
- **React Native Reanimated** - Smooth animations and gestures
- **Three.js** - 3D product visualization
- **Firebase SDK** - Authentication and push notifications
- **AsyncStorage** - Local data persistence

### Backend (API Server)
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB** with **Mongoose** - Database and ODM
- **Firebase Admin** - Authentication verification
- **JWT** - Token-based authentication
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Development Tools
- **TypeScript** - Type safety and better development experience
- **ESLint** & **Prettier** - Code quality and formatting
- **Expo CLI** - Development and build tools

## 📱 App Screens

### 1. Home Screen
- App branding and welcome message
- "Start Order" call-to-action button
- Featured products grid with images and prices
- Quick action buttons (Scan, Recommendations, Orders)
- Current deals and promotions section

### 2. Product Code Entry Screen
- Text input for manual product code entry
- Barcode scanner integration with camera
- Real-time product validation and fetching
- Product preview with image, name, and price
- Size and color selection options
- Add to cart functionality

### 3. Cart Screen
- Complete cart management interface
- Product images, details, and quantities
- Order merging toggle to reduce shipping costs
- Shipping cost calculation
- Remove items and quantity adjustment
- Order total with breakdown

### 4. Order Confirmation Screen
- Final order review and summary
- Shipping address form with validation
- Payment information and instructions
- Terms and conditions
- Order placement confirmation

### 5. Order Tracking Screen
- Real-time order status progression
- Visual timeline with status indicators
- Tracking number and estimated delivery
- Contact support functionality
- Push notification integration

### 6. Recommendations Screen
- Personalized product suggestions
- Category filtering (Tops, Bottoms, Dresses, etc.)
- Social sharing capabilities
- Add to cart directly from recommendations
- Product ratings and reviews

### 7. Account & Settings Screen
- User profile management
- Shipping addresses management
- Notification preferences
- Loyalty points and tier status
- App settings and preferences

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB (local or cloud instance)
- Firebase project (for authentication and notifications)

### Mobile App Setup

1. **Clone and install dependencies:**
```bash
cd shein-shopping-app
npm install
```

2. **Configure Firebase:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Cloud Messaging
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Update `src/services/firebase.ts` with your configuration

3. **Start the development server:**
```bash
npm start
```

4. **Run on device/simulator:**
```bash
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd shein-backend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

4. **Start the backend server:**
```bash
npm run dev  # Development with auto-restart
npm start    # Production
```

5. **Initialize sample data:**
```bash
curl -X POST http://localhost:3000/api/products/sync
```

## 🎨 Design System

### Color Palette
- **Primary**: #FF6B6B (Coral Red)
- **Secondary**: #4ECDC4 (Teal)
- **Tertiary**: #45B7D1 (Sky Blue)
- **Background**: #FAFAFA (Light Gray)
- **Surface**: #FFFFFF (White)
- **Error**: #FF5252 (Red)

### Typography
- **Headings**: System font with weights 600-700
- **Body Text**: System font with weight 400
- **Captions**: System font with weight 400, smaller size

### Spacing System
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## 🔐 Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **Rate Limiting**: API protection against abuse
- **Helmet Security**: HTTP security headers
- **JWT Authentication**: Secure token-based authentication
- **Firebase Auth**: Google-grade authentication system
- **Data Sanitization**: XSS protection for user inputs

## 📊 API Endpoints

### Products
- `GET /api/products/search?code={productCode}` - Search product by code
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/recommendations` - Get personalized recommendations

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status (admin)
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `POST /api/users/addresses` - Add shipping address
- `PUT /api/users/addresses/:index` - Update shipping address
- `DELETE /api/users/addresses/:index` - Delete shipping address

## 🚀 Deployment

### Mobile App Deployment

1. **Build for production:**
```bash
expo build:android  # Android APK/AAB
expo build:ios      # iOS IPA
```

2. **Publish to app stores:**
```bash
expo submit:android # Google Play Store
expo submit:ios     # Apple App Store
```

### Backend Deployment

1. **Build TypeScript:**
```bash
npm run build
```

2. **Deploy to cloud service:**
   - Heroku, AWS, Google Cloud, or DigitalOcean
   - Set environment variables
   - Configure MongoDB connection
   - Set up domain and SSL

## 🧪 Testing

### Mobile App Testing
```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Test on physical device
npm start
# Scan QR code with Expo Go app
```

### Backend Testing
```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/products/featured
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@sheinhelper.com
- Issues: GitHub Issues page
- Documentation: Project Wiki

## 🔮 Future Enhancements

- **AI-Powered Size Recommendations**: ML-based size suggestions
- **Voice Search**: Voice-activated product search
- **Social Features**: User reviews and community features
- **Advanced AR**: Try-on experiences with camera
- **Multi-language Support**: Localization for global users
- **Payment Integration**: Direct payment processing
- **Inventory Sync**: Real-time SHEIN inventory updates

---

Built with ❤️ for the SHEIN shopping community