import { Document } from 'mongoose';

export interface IProduct extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  product: string; // Product ID
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface IOrder extends Document {
  userId: string;
  items: ICartItem[];
  totalAmount: number;
  shippingCost: number;
  status: OrderStatus;
  shippingAddress: IAddress;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface IAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  addresses: IAddress[];
  preferences: IUserPreferences;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreferences {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    recommendations: boolean;
  };
  language: string;
  currency: string;
}

export interface IRecommendation {
  userId: string;
  productId: string;
  reason: string;
  score: number;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SheinProductData {
  productId: string;
  title: string;
  price: {
    current: number;
    original?: number;
  };
  images: string[];
  description: string;
  specifications: {
    sizes?: string[];
    colors?: string[];
    material?: string;
  };
  rating?: {
    score: number;
    count: number;
  };
  availability: boolean;
}