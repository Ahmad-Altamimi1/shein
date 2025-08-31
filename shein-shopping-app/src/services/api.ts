import { API_CONFIG, MOCK_PRODUCTS } from '../constants/api';
import { Product, Order, CartItem, User, Recommendation } from '../types';

class ApiService {
  private baseUrl = API_CONFIG.BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Product methods
  async searchProductByCode(code: string): Promise<Product | null> {
    try {
      // For demo purposes, use mock data
      // In production, this would call the actual SHEIN API
      const product = MOCK_PRODUCTS.find(p => p.code === code);
      if (product) {
        return product;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If not found in mock data, return null
      return null;
    } catch (error) {
      console.error('Error searching product:', error);
      throw error;
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    try {
      // Mock implementation
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      console.error('Error getting product details:', error);
      throw error;
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      // Mock implementation - return all products as featured
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_PRODUCTS;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  async getRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_PRODUCTS.map((product, index) => ({
        id: `rec_${index}`,
        product,
        reason: index === 0 ? 'Based on your recent orders' : 
                index === 1 ? 'Popular in your area' : 'Trending now',
        score: 0.9 - (index * 0.1),
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Order methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const newOrder: Order = {
        ...orderData,
        id: `order_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrders(userId: string): Promise<Order[]> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      return []; // Return empty array for now
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      throw new Error('Order not found');
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // User methods
  async getUser(userId: string): Promise<User> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: userId,
        email: 'user@example.com',
        displayName: 'John Doe',
        addresses: [],
        preferences: {
          notifications: {
            orderUpdates: true,
            promotions: true,
            recommendations: true,
          },
          language: 'en',
          currency: 'USD',
        },
        loyaltyPoints: 150,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentUser = await this.getUser(userId);
      return { ...currentUser, ...userData };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Shipping methods
  async calculateShipping(items: CartItem[], address: any): Promise<number> {
    try {
      // Mock shipping calculation
      await new Promise(resolve => setTimeout(resolve, 300));
      const baseShipping = 5.99;
      const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.5), 0);
      return Math.max(baseShipping, totalWeight * 2);
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();