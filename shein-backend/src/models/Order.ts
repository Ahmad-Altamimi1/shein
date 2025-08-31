import mongoose, { Schema } from 'mongoose';
import { IOrder, ICartItem, IAddress, OrderStatus } from '../types';

const AddressSchema = new Schema<IAddress>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  selectedSize: {
    type: String,
    trim: true,
  },
  selectedColor: {
    type: String,
    trim: true,
  },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  items: {
    type: [CartItemSchema],
    required: true,
    validate: {
      validator: function(items: ICartItem[]) {
        return items.length > 0;
      },
      message: 'Order must contain at least one item',
    },
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    index: true,
  },
  shippingAddress: {
    type: AddressSchema,
    required: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
    sparse: true,
  },
  estimatedDelivery: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });

// Pre-save middleware to generate tracking number
OrderSchema.pre('save', function(next) {
  if (this.isNew && this.status === OrderStatus.CONFIRMED && !this.trackingNumber) {
    this.trackingNumber = `SH${Date.now().toString().slice(-8).toUpperCase()}`;
  }
  next();
});

// Virtual for order number display
OrderSchema.virtual('orderNumber').get(function(this: IOrder) {
  return this._id?.toString().slice(-8).toUpperCase();
});

// Ensure virtual fields are serialized
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);