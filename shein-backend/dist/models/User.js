"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AddressSchema = new mongoose_1.Schema({
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
const UserPreferencesSchema = new mongoose_1.Schema({
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
const UserSchema = new mongoose_1.Schema({
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
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ loyaltyPoints: -1 });
UserSchema.virtual('loyaltyTier').get(function () {
    return Math.floor(this.loyaltyPoints / 500) + 1;
});
UserSchema.virtual('pointsToNextTier').get(function () {
    return 500 - (this.loyaltyPoints % 500);
});
UserSchema.methods.addLoyaltyPoints = function (points) {
    this.loyaltyPoints += points;
    return this.save();
};
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
exports.User = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map