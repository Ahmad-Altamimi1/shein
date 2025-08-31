import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const ProductSchema = new Schema<IProduct>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  sizes: [{
    type: String,
    trim: true,
  }],
  colors: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    min: 0,
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ProductSchema.index({ code: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtual fields are serialized
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);