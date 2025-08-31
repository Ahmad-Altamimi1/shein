export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviews?: number;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingCost: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  addresses: Address[];
  preferences: UserPreferences;
  loyaltyPoints: number;
  createdAt: Date;
}

export interface UserPreferences {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    recommendations: boolean;
  };
  language: string;
  currency: string;
}

export interface Recommendation {
  id: string;
  product: Product;
  reason: string;
  score: number;
}

export type RootStackParamList = {
  Main: undefined;
  ProductCode: undefined;
  ProductDetails: { product: Product };
  Cart: undefined;
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  Recommendations: undefined;
  Account: undefined;
};

export type TabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Account: undefined;
};