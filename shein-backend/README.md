# SHEIN Helper Backend API

RESTful API server for the SHEIN Shopping Helper mobile application. Built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Firebase project (for authentication)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server:**
```bash
npm run dev
```

4. **Initialize sample data:**
```bash
curl -X POST http://localhost:3000/api/products/sync
```

## 📋 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/shein-shopping-app

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-email

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Products
```
GET    /api/products/search?code={code}  # Search by product code
GET    /api/products/:id                 # Get product details
GET    /api/products/featured            # Get featured products
GET    /api/products/recommendations     # Get recommendations
POST   /api/products/sync                # Sync products (admin)
```

### Orders
```
POST   /api/orders                       # Create order
GET    /api/orders                       # Get user orders
GET    /api/orders/:id                   # Get specific order
PUT    /api/orders/:id/status            # Update status (admin)
DELETE /api/orders/:id                   # Cancel order
```

### Users
```
GET    /api/users/profile                # Get user profile
PUT    /api/users/profile                # Update profile
GET    /api/users/preferences            # Get preferences
PUT    /api/users/preferences            # Update preferences
POST   /api/users/addresses              # Add address
PUT    /api/users/addresses/:index       # Update address
DELETE /api/users/addresses/:index       # Delete address
```

## 🏗 Architecture

### Project Structure
```
src/
├── config/          # Database and app configuration
├── middleware/      # Express middleware (auth, validation)
├── models/          # MongoDB/Mongoose models
├── routes/          # API route handlers
├── services/        # Business logic and external APIs
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

### Database Models

#### Product
```typescript
{
  code: string;           // Unique product code
  name: string;           // Product name
  price: number;          // Current price
  originalPrice?: number; // Original price (for discounts)
  image: string;          // Main product image
  images?: string[];      // Additional images
  description?: string;   // Product description
  category?: string;      // Product category
  sizes?: string[];       // Available sizes
  colors?: string[];      // Available colors
  rating?: number;        // Average rating (0-5)
  reviews?: number;       // Number of reviews
  inStock: boolean;       // Availability status
}
```

#### Order
```typescript
{
  userId: string;         // User identifier
  items: CartItem[];      // Ordered items
  totalAmount: number;    // Total order amount
  shippingCost: number;   // Shipping cost
  status: OrderStatus;    // Order status
  shippingAddress: Address; // Delivery address
  trackingNumber?: string; // Shipping tracking
  estimatedDelivery?: Date; // Estimated delivery
}
```

#### User
```typescript
{
  firebaseUid: string;    // Firebase user ID
  email: string;          // User email
  displayName: string;    // Display name
  photoURL?: string;      // Profile picture
  addresses: Address[];   // Saved addresses
  preferences: UserPreferences; // App preferences
  loyaltyPoints: number;  // Reward points
}
```

## 🔒 Authentication

The API supports two authentication methods:

### Firebase Authentication (Recommended)
- Secure, scalable authentication by Google
- Automatic user management
- Social login support

### JWT Authentication (Alternative)
- Custom JWT token system
- Manual user registration/login
- Full control over authentication flow

## 🛡 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet Security**: HTTP security headers
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Authentication**: Firebase/JWT token verification

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Console Logging**: Development debugging
- **Error Tracking**: Global error handler
- **Health Checks**: Server status monitoring

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment
Recommended platforms:
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS**: EC2/ECS with RDS or DocumentDB
- **Google Cloud**: App Engine with Cloud Firestore
- **DigitalOcean**: Droplets with managed databases

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# Search product
curl "http://localhost:3000/api/products/search?code=SW2301001"

# Get featured products
curl http://localhost:3000/api/products/featured
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery quick --count 10 --num 100 http://localhost:3000/health
```

## 🔧 Configuration

### MongoDB Setup
```javascript
// Local MongoDB
mongodb://localhost:27017/shein-shopping-app

// MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/shein-shopping-app
```

### Firebase Setup
1. Create Firebase project
2. Enable Authentication
3. Generate service account key
4. Add credentials to environment variables

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: In-memory caching for frequently accessed data
- **Compression**: Gzip compression for responses
- **Connection Pooling**: MongoDB connection optimization
- **Rate Limiting**: Prevent API abuse

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service is running
   - Verify connection string in .env
   - Check network connectivity

2. **Firebase Authentication Error**
   - Verify Firebase credentials in .env
   - Check Firebase project configuration
   - Ensure service account has proper permissions

3. **CORS Errors**
   - Update ALLOWED_ORIGINS in .env
   - Check frontend URL configuration
   - Verify preflight request handling

### Debug Mode
```bash
DEBUG=* npm run dev  # Enable all debug logs
```

## 📚 API Documentation

Detailed API documentation is available at:
- Development: http://localhost:3000/docs
- Production: https://your-api-domain.com/docs

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test API endpoints thoroughly

## 📄 License

MIT License - see LICENSE file for details.