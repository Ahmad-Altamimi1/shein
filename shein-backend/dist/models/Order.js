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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
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
}, { _id: false });
const CartItemSchema = new mongoose_1.Schema({
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
const OrderSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    items: {
        type: [CartItemSchema],
        required: true,
        validate: {
            validator: function (items) {
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
        enum: Object.values(types_1.OrderStatus),
        default: types_1.OrderStatus.PENDING,
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
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });
OrderSchema.pre('save', function (next) {
    if (this.isNew && this.status === types_1.OrderStatus.CONFIRMED && !this.trackingNumber) {
        this.trackingNumber = `SH${Date.now().toString().slice(-8).toUpperCase()}`;
    }
    next();
});
OrderSchema.virtual('orderNumber').get(function () {
    return this._id?.toString().slice(-8).toUpperCase();
});
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });
exports.Order = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map