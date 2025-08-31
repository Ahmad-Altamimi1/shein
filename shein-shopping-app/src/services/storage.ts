import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, User, Order } from '../types';

const STORAGE_KEYS = {
  CART: '@shein_app_cart',
  USER: '@shein_app_user',
  ORDERS: '@shein_app_orders',
  PREFERENCES: '@shein_app_preferences',
  RECENT_SEARCHES: '@shein_app_recent_searches',
};

class StorageService {
  // Cart storage
  async getCart(): Promise<CartItem[]> {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart from storage:', error);
      return [];
    }
  }

  async saveCart(cart: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      throw error;
    }
  }

  async addToCart(item: CartItem): Promise<CartItem[]> {
    try {
      const currentCart = await this.getCart();
      const existingItemIndex = currentCart.findIndex(
        cartItem => 
          cartItem.product.id === item.product.id &&
          cartItem.selectedSize === item.selectedSize &&
          cartItem.selectedColor === item.selectedColor
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += item.quantity;
      } else {
        currentCart.push(item);
      }

      await this.saveCart(currentCart);
      return currentCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async removeFromCart(productId: string, selectedSize?: string, selectedColor?: string): Promise<CartItem[]> {
    try {
      const currentCart = await this.getCart();
      const updatedCart = currentCart.filter(
        item => !(
          item.product.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
      );
      
      await this.saveCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(
    productId: string, 
    quantity: number, 
    selectedSize?: string, 
    selectedColor?: string
  ): Promise<CartItem[]> {
    try {
      const currentCart = await this.getCart();
      const itemIndex = currentCart.findIndex(
        item => 
          item.product.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          currentCart.splice(itemIndex, 1);
        } else {
          currentCart[itemIndex].quantity = quantity;
        }
      }

      await this.saveCart(currentCart);
      return currentCart;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // User storage
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  }

  // Orders storage
  async getOrders(): Promise<Order[]> {
    try {
      const ordersData = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      return ordersData ? JSON.parse(ordersData) : [];
    } catch (error) {
      console.error('Error getting orders from storage:', error);
      return [];
    }
  }

  async saveOrder(order: Order): Promise<void> {
    try {
      const currentOrders = await this.getOrders();
      const updatedOrders = [...currentOrders, order];
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error saving order to storage:', error);
      throw error;
    }
  }

  // Recent searches
  async getRecentSearches(): Promise<string[]> {
    try {
      const searchesData = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return searchesData ? JSON.parse(searchesData) : [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  async addRecentSearch(search: string): Promise<void> {
    try {
      const recentSearches = await this.getRecentSearches();
      const updatedSearches = [search, ...recentSearches.filter(s => s !== search)].slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error adding recent search:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();