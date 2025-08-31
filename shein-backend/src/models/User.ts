import mongoose, { Schema } from 'mongoose';
import { IUser, IAddress, IUserPreferences } from '../types';

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
});

const UserPreferencesSchema = new Schema<IUserPreferences>({
  notifications: {
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotions: {
      type: Boolean,
      default: true,
    },
    recommendations: {
      type: Boolean,
      default: true,
    },
  },
  language: {
    type: String,
    default: 'en',
    trim: true,
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
  },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  photoURL: {
    type: String,
    trim: true,
  },
  addresses: {
    type: [AddressSchema],
    default: [],
  },
  preferences: {
    type: UserPreferencesSchema,
    default: () => ({}),
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ loyaltyPoints: -1 });

// Virtual for loyalty tier
UserSchema.virtual('loyaltyTier').get(function() {
  return Math.floor(this.loyaltyPoints / 500) + 1;
});

// Virtual for points to next tier
UserSchema.virtual('pointsToNextTier').get(function() {
  return 500 - (this.loyaltyPoints % 500);
});

// Method to add loyalty points
UserSchema.methods.addLoyaltyPoints = function(points: number) {
  this.loyaltyPoints += points;
  return this.save();
};

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser>('User', UserSchema);