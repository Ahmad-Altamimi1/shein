export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com',
  ENDPOINTS: {
    // Product endpoints
    SEARCH_PRODUCT: '/api/products/search',
    GET_PRODUCT: '/api/products',
    GET_RECOMMENDATIONS: '/api/products/recommendations',
    
    // Order endpoints
    CREATE_ORDER: '/api/orders',
    GET_ORDERS: '/api/orders',
    GET_ORDER: '/api/orders',
    UPDATE_ORDER_STATUS: '/api/orders',
    
    // User endpoints
    GET_USER: '/api/users',
    UPDATE_USER: '/api/users',
    GET_USER_PREFERENCES: '/api/users/preferences',
    UPDATE_USER_PREFERENCES: '/api/users/preferences',
    
    // Cart endpoints
    GET_CART: '/api/cart',
    ADD_TO_CART: '/api/cart/add',
    UPDATE_CART_ITEM: '/api/cart/update',
    REMOVE_FROM_CART: '/api/cart/remove',
    CLEAR_CART: '/api/cart/clear',
    
    // Shipping endpoints
    CALCULATE_SHIPPING: '/api/shipping/calculate',
    GET_SHIPPING_OPTIONS: '/api/shipping/options',
  },
  TIMEOUT: 10000,
};

export const SHEIN_API_CONFIG = {
  // Mock SHEIN API endpoints - in production, replace with actual SHEIN API
  BASE_URL: 'https://api.shein.com/v1', // Mock URL
  ENDPOINTS: {
    PRODUCT_SEARCH: '/products/search',
    PRODUCT_DETAILS: '/products',
    CATEGORIES: '/categories',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'SheinShoppingApp/1.0.0',
  },
};

export const MOCK_PRODUCTS = [
  {
    id: '1',
    code: 'SW2301001',
    name: 'Casual Cotton T-Shirt',
    price: 12.99,
    originalPrice: 19.99,
    image: 'https://img.ltwebstatic.com/images3_pi/2023/01/17/16739234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
    description: 'Comfortable cotton t-shirt perfect for everyday wear',
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy', 'Pink'],
    rating: 4.5,
    reviews: 1247,
    inStock: true,
  },
  {
    id: '2',
    code: 'SW2301002',
    name: 'High Waist Denim Jeans',
    price: 24.99,
    originalPrice: 39.99,
    image: 'https://img.ltwebstatic.com/images3_pi/2023/02/15/16765234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
    description: 'Trendy high-waist denim jeans with stretch fabric',
    category: 'Bottoms',
    sizes: ['26', '27', '28', '29', '30', '31', '32'],
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    rating: 4.3,
    reviews: 892,
    inStock: true,
  },
  {
    id: '3',
    code: 'SW2301003',
    name: 'Floral Summer Dress',
    price: 18.99,
    originalPrice: 29.99,
    image: 'https://img.ltwebstatic.com/images3_pi/2023/03/10/16783234953c8f8b8e5f8c8d8e8f8c8d8e8f8c8d.jpg',
    description: 'Beautiful floral print dress perfect for summer occasions',
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'],
    rating: 4.7,
    reviews: 654,
    inStock: true,
  },
];