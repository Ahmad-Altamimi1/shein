import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: user,
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// PUT /api/users/profile - Update user profile
router.put(
  '/profile',
  [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Display name must be between 1 and 100 characters'),
    body('photoURL')
      .optional()
      .isURL()
      .withMessage('Invalid photo URL'),
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

      const { displayName, photoURL } = req.body;
      const user = req.user;

      if (displayName) user.displayName = displayName;
      if (photoURL !== undefined) user.photoURL = photoURL;

      await user.save();

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// GET /api/users/preferences - Get user preferences
router.get('/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: user.preferences,
    } as ApiResponse);

  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// PUT /api/users/preferences - Update user preferences
router.put(
  '/preferences',
  [
    body('notifications.orderUpdates')
      .optional()
      .isBoolean()
      .withMessage('Order updates preference must be a boolean'),
    body('notifications.promotions')
      .optional()
      .isBoolean()
      .withMessage('Promotions preference must be a boolean'),
    body('notifications.recommendations')
      .optional()
      .isBoolean()
      .withMessage('Recommendations preference must be a boolean'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Invalid language code'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Invalid currency code'),
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

      const user = req.user;
      const { notifications, language, currency } = req.body;

      if (notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...notifications,
        };
      }

      if (language) user.preferences.language = language;
      if (currency) user.preferences.currency = currency;

      await user.save();

      res.json({
        success: true,
        data: user.preferences,
        message: 'Preferences updated successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// POST /api/users/addresses - Add shipping address
router.post(
  '/addresses',
  [
    body('fullName')
      .notEmpty()
      .withMessage('Full name is required'),
    body('street')
      .notEmpty()
      .withMessage('Street address is required'),
    body('city')
      .notEmpty()
      .withMessage('City is required'),
    body('state')
      .notEmpty()
      .withMessage('State is required'),
    body('zipCode')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Invalid zip code'),
    body('phone')
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage('Invalid phone number'),
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

      const user = req.user;
      const newAddress = req.body;

      user.addresses.push(newAddress);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
        message: 'Address added successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error adding address:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// PUT /api/users/addresses/:index - Update shipping address
router.put(
  '/addresses/:index',
  [
    param('index')
      .isInt({ min: 0 })
      .withMessage('Invalid address index'),
    body('fullName')
      .optional()
      .notEmpty()
      .withMessage('Full name cannot be empty'),
    body('street')
      .optional()
      .notEmpty()
      .withMessage('Street address cannot be empty'),
    body('city')
      .optional()
      .notEmpty()
      .withMessage('City cannot be empty'),
    body('state')
      .optional()
      .notEmpty()
      .withMessage('State cannot be empty'),
    body('zipCode')
      .optional()
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Invalid zip code'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage('Invalid phone number'),
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

      const user = req.user;
      const addressIndex = parseInt(req.params.index);

      if (addressIndex >= user.addresses.length) {
        res.status(404).json({
          success: false,
          error: 'Address not found',
        } as ApiResponse);
        return;
      }

      // Update address fields
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          user.addresses[addressIndex][key] = req.body[key];
        }
      });

      await user.save();

      res.json({
        success: true,
        data: user.addresses,
        message: 'Address updated successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// DELETE /api/users/addresses/:index - Delete shipping address
router.delete(
  '/addresses/:index',
  [
    param('index')
      .isInt({ min: 0 })
      .withMessage('Invalid address index'),
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

      const user = req.user;
      const addressIndex = parseInt(req.params.index);

      if (addressIndex >= user.addresses.length) {
        res.status(404).json({
          success: false,
          error: 'Address not found',
        } as ApiResponse);
        return;
      }

      user.addresses.splice(addressIndex, 1);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
        message: 'Address deleted successfully',
      } as ApiResponse);

    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

export default router;