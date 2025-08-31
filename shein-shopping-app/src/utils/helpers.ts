import { Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Product, CartItem, Order, OrderStatus } from '../types';

const { width, height } = Dimensions.get('window');

// Device utilities
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isTablet = width >= 768;

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Safe area helpers
export const getStatusBarHeight = () => {
  if (isIOS) {
    return height >= 812 ? 44 : 20; // iPhone X and newer vs older iPhones
  }
  return 24; // Android
};

// Haptic feedback helpers
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
  if (!isIOS && !isAndroid) return;

  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
  }
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Generate unique ID
export const generateUniqueId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomString}`;
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cart utilities
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const calculateCartItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const findCartItem = (
  items: CartItem[], 
  productId: string, 
  selectedSize?: string, 
  selectedColor?: string
): CartItem | undefined => {
  return items.find(item => 
    item.product.id === productId &&
    item.selectedSize === selectedSize &&
    item.selectedColor === selectedColor
  );
};

// Product utilities
export const getProductDisplayPrice = (product: Product): string => {
  if (product.originalPrice && product.originalPrice > product.price) {
    return `$${product.price} (was $${product.originalPrice})`;
  }
  return `$${product.price}`;
};

export const isProductOnSale = (product: Product): boolean => {
  return !!(product.originalPrice && product.originalPrice > product.price);
};

export const getProductSavings = (product: Product): number => {
  if (!product.originalPrice || product.originalPrice <= product.price) {
    return 0;
  }
  return product.originalPrice - product.price;
};

// Order utilities
export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return '#FFA726';
    case OrderStatus.CONFIRMED:
      return '#42A5F5';
    case OrderStatus.PROCESSING:
      return '#AB47BC';
    case OrderStatus.SHIPPED:
      return '#26A69A';
    case OrderStatus.DELIVERED:
      return '#66BB6A';
    case OrderStatus.CANCELLED:
      return '#EF5350';
    default:
      return '#9E9E9E';
  }
};

export const getOrderStatusIcon = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'clock-outline';
    case OrderStatus.CONFIRMED:
      return 'check-circle';
    case OrderStatus.PROCESSING:
      return 'package-variant';
    case OrderStatus.SHIPPED:
      return 'truck-delivery';
    case OrderStatus.DELIVERED:
      return 'home-circle';
    case OrderStatus.CANCELLED:
      return 'cancel';
    default:
      return 'help-circle';
  }
};

export const getOrderStatusProgress = (status: OrderStatus): number => {
  switch (status) {
    case OrderStatus.PENDING:
      return 0.1;
    case OrderStatus.CONFIRMED:
      return 0.25;
    case OrderStatus.PROCESSING:
      return 0.5;
    case OrderStatus.SHIPPED:
      return 0.75;
    case OrderStatus.DELIVERED:
      return 1.0;
    case OrderStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatProductCode = (code: string): string => {
  return code.toUpperCase().trim();
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Image utilities
export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  // In a real app, you might use a CDN service like Cloudinary
  // For now, return the original URL
  if (!width && !height) return url;
  
  // Add query parameters for image optimization
  const separator = url.includes('?') ? '&' : '?';
  const params = [];
  
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  
  return `${url}${separator}${params.join('&')}`;
};

// Network utilities
export const isNetworkError = (error: any): boolean => {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('timeout') ||
    error.message?.includes('ECONNREFUSED')
  );
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// Storage utilities
export const getStorageSize = async (): Promise<number> => {
  // This would calculate the total size of stored data
  // For now, return 0
  return 0;
};

// Performance utilities
export const measurePerformance = <T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> => {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};