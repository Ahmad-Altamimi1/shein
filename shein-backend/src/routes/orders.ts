import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { ApiResponse, PaginatedResponse, OrderStatus } from '../types';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

// POST /api/orders - Create new order
router.post(
  '/',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.product')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 20 })
      .withMessage('Quantity must be between 1 and 20'),
    body('shippingAddress.fullName')
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.street')
      .notEmpty()
      .withMessage('Street address is required'),
    body('shippingAddress.city')
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.zipCode')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Invalid zip code'),
    body('shippingAddress.phone')
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage('Invalid phone number'),
  ],
  optionalAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { items, shippingAddress } = req.body;
      const userId = req.userId || 'guest';

      // Validate products exist and calculate total
      let totalAmount = 0;
      let shippingCost = 5.99; // Base shipping cost

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404).json({
            success: false,
            error: `Product not found: ${item.product}`,
          } as ApiResponse);
          return;
        }

        if (!product.inStock) {
          res.status(400).json({
            success: false,
            error: `Product out of stock: ${product.name}`,
          } as ApiResponse);
          return;
        }

        totalAmount += product.price * item.quantity;
      }

      // Create order
      const order = new Order({
        userId,
        items,
        totalAmount,
        shippingCost,
        status: OrderStatus.PENDING,
        shippingAddress,
      });

      await order.save();

      // Populate product details for response
      await order.populate('items.product');

      // Award loyalty points if user is authenticated
      if (req.user) {
        const pointsEarned = Math.floor(totalAmount);
        await req.user.addLoyaltyPoints(pointsEarned);
      }

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// GET /api/orders - Get user orders
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(Object.values(OrderStatus))
      .withMessage('Invalid order status'),
  ],
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { page = 1, limit = 20, status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const filter: any = { userId: req.userId };
      if (status) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .populate('items.product')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Order.countDocuments(filter);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      } as PaginatedResponse<typeof orders[0]>);

    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// GET /api/orders/:id - Get specific order
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
  ],
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).populate('items.product');

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: order,
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put(
  '/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('status')
      .isIn(Object.values(OrderStatus))
      .withMessage('Invalid order status'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          ...(status === OrderStatus.SHIPPED && { 
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
          })
        },
        { new: true }
      ).populate('items.product');

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        } as ApiResponse);
        return;
      }

      // TODO: Send push notification to user about status update

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// DELETE /api/orders/:id - Cancel order
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
  ],
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        } as ApiResponse);
        return;
      }

      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        } as ApiResponse);
        return;
      }

      // Only allow cancellation if order is not shipped
      if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
        res.status(400).json({
          success: false,
          error: 'Cannot cancel order that has been shipped',
        } as ApiResponse);
        return;
      }

      order.status = OrderStatus.CANCELLED;
      await order.save();

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

export default router;