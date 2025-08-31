"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    (0, express_validator_1.body)('items.*.product')
        .isMongoId()
        .withMessage('Invalid product ID'),
    (0, express_validator_1.body)('items.*.quantity')
        .isInt({ min: 1, max: 20 })
        .withMessage('Quantity must be between 1 and 20'),
    (0, express_validator_1.body)('shippingAddress.fullName')
        .notEmpty()
        .withMessage('Full name is required'),
    (0, express_validator_1.body)('shippingAddress.street')
        .notEmpty()
        .withMessage('Street address is required'),
    (0, express_validator_1.body)('shippingAddress.city')
        .notEmpty()
        .withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state')
        .notEmpty()
        .withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.zipCode')
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Invalid zip code'),
    (0, express_validator_1.body)('shippingAddress.phone')
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage('Invalid phone number'),
], auth_1.optionalAuth, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
            return;
        }
        const { items, shippingAddress } = req.body;
        const userId = req.userId || 'guest';
        let totalAmount = 0;
        let shippingCost = 5.99;
        for (const item of items) {
            const product = await Product_1.Product.findById(item.product);
            if (!product) {
                res.status(404).json({
                    success: false,
                    error: `Product not found: ${item.product}`,
                });
                return;
            }
            if (!product.inStock) {
                res.status(400).json({
                    success: false,
                    error: `Product out of stock: ${product.name}`,
                });
                return;
            }
            totalAmount += product.price * item.quantity;
        }
        const order = new Order_1.Order({
            userId,
            items,
            totalAmount,
            shippingCost,
            status: types_1.OrderStatus.PENDING,
            shippingAddress,
        });
        await order.save();
        await order.populate('items.product');
        if (req.user) {
            const pointsEarned = Math.floor(totalAmount);
            await req.user.addLoyaltyPoints(pointsEarned);
        }
        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully',
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.get('/', [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(Object.values(types_1.OrderStatus))
        .withMessage('Invalid order status'),
], auth_1.authenticateToken, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
            return;
        }
        const { page = 1, limit = 20, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const filter = { userId: req.userId };
        if (status) {
            filter.status = status;
        }
        const orders = await Order_1.Order.find(filter)
            .populate('items.product')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Order_1.Order.countDocuments(filter);
        res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.get('/:id', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid order ID'),
], auth_1.authenticateToken, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
            return;
        }
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            userId: req.userId,
        }).populate('items.product');
        if (!order) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.put('/:id/status', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid order ID'),
    (0, express_validator_1.body)('status')
        .isIn(Object.values(types_1.OrderStatus))
        .withMessage('Invalid order status'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
            return;
        }
        const { status } = req.body;
        const order = await Order_1.Order.findByIdAndUpdate(req.params.id, {
            status,
            ...(status === types_1.OrderStatus.SHIPPED && {
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })
        }, { new: true }).populate('items.product');
        if (!order) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }
        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.delete('/:id', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid order ID'),
], auth_1.authenticateToken, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
            return;
        }
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!order) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }
        if ([types_1.OrderStatus.SHIPPED, types_1.OrderStatus.DELIVERED].includes(order.status)) {
            res.status(400).json({
                success: false,
                error: 'Cannot cancel order that has been shipped',
            });
            return;
        }
        order.status = types_1.OrderStatus.CANCELLED;
        await order.save();
        res.json({
            success: true,
            data: order,
            message: 'Order cancelled successfully',
        });
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map