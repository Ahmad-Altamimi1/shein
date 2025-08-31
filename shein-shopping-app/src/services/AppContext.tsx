import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, User, Product, Order } from '../types';
import { storageService } from './storage';
import { apiService } from './api';

interface AppState {
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; selectedSize?: string; selectedColor?: string } }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number; selectedSize?: string; selectedColor?: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: Product[] };

const initialState: AppState = {
  cart: [],
  user: null,
  orders: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.findIndex(
        item => 
          item.product.id === action.payload.product.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: updatedCart };
      } else {
        return { ...state, cart: [...state.cart, action.payload] };
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(
          item => !(
            item.product.id === action.payload.productId &&
            item.selectedSize === action.payload.selectedSize &&
            item.selectedColor === action.payload.selectedColor
          )
        ),
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string, selectedSize?: string, selectedColor?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  searchProduct: (code: string) => Promise<Product | null>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  loadFeaturedProducts: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load cart from storage
      const cart = await storageService.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
      
      // Load user from storage
      const user = await storageService.getUser();
      dispatch({ type: 'SET_USER', payload: user });
      
      // Load orders from storage
      const orders = await storageService.getOrders();
      dispatch({ type: 'SET_ORDERS', payload: orders });
      
      // Load featured products
      await loadFeaturedProducts();
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (item: CartItem) => {
    try {
      const updatedCart = await storageService.addToCart(item);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeFromCart = async (productId: string, selectedSize?: string, selectedColor?: string) => {
    try {
      const updatedCart = await storageService.removeFromCart(productId, selectedSize, selectedColor);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    try {
      const updatedCart = await storageService.updateCartItemQuantity(productId, quantity, selectedSize, selectedColor);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
    }
  };

  const clearCart = async () => {
    try {
      await storageService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  const searchProduct = async (code: string): Promise<Product | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const product = await apiService.searchProductByCode(code);
      
      if (product) {
        // Add to recent searches
        await storageService.addRecentSearch(code);
      }
      
      return product;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search product' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newOrder = await apiService.createOrder(orderData);
      
      // Save order locally
      await storageService.saveOrder(newOrder);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      
      // Clear cart after successful order
      await clearCart();
      
      return newOrder;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create order' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const products = await apiService.getFeaturedProducts();
      dispatch({ type: 'SET_FEATURED_PRODUCTS', payload: products });
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  };

  const getCartTotal = (): number => {
    return state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = (): number => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    searchProduct,
    createOrder,
    loadFeaturedProducts,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}