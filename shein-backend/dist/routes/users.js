"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.put('/profile', [
    (0, express_validator_1.body)('displayName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Display name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('photoURL')
        .optional()
        .isURL()
        .withMessage('Invalid photo URL'),
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
        const { displayName, photoURL } = req.body;
        const user = req.user;
        if (displayName)
            user.displayName = displayName;
        if (photoURL !== undefined)
            user.photoURL = photoURL;
        await user.save();
        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.get('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: user.preferences,
        });
    }
    catch (error) {
        console.error('Error getting user preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.put('/preferences', [
    (0, express_validator_1.body)('notifications.orderUpdates')
        .optional()
        .isBoolean()
        .withMessage('Order updates preference must be a boolean'),
    (0, express_validator_1.body)('notifications.promotions')
        .optional()
        .isBoolean()
        .withMessage('Promotions preference must be a boolean'),
    (0, express_validator_1.body)('notifications.recommendations')
        .optional()
        .isBoolean()
        .withMessage('Recommendations preference must be a boolean'),
    (0, express_validator_1.body)('language')
        .optional()
        .isLength({ min: 2, max: 5 })
        .withMessage('Invalid language code'),
    (0, express_validator_1.body)('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Invalid currency code'),
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
        const user = req.user;
        const { notifications, language, currency } = req.body;
        if (notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...notifications,
            };
        }
        if (language)
            user.preferences.language = language;
        if (currency)
            user.preferences.currency = currency;
        await user.save();
        res.json({
            success: true,
            data: user.preferences,
            message: 'Preferences updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.post('/addresses', [
    (0, express_validator_1.body)('fullName')
        .notEmpty()
        .withMessage('Full name is required'),
    (0, express_validator_1.body)('street')
        .notEmpty()
        .withMessage('Street address is required'),
    (0, express_validator_1.body)('city')
        .notEmpty()
        .withMessage('City is required'),
    (0, express_validator_1.body)('state')
        .notEmpty()
        .withMessage('State is required'),
    (0, express_validator_1.body)('zipCode')
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Invalid zip code'),
    (0, express_validator_1.body)('phone')
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage('Invalid phone number'),
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
        const user = req.user;
        const newAddress = req.body;
        user.addresses.push(newAddress);
        await user.save();
        res.json({
            success: true,
            data: user.addresses,
            message: 'Address added successfully',
        });
    }
    catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.put('/addresses/:index', [
    (0, express_validator_1.param)('index')
        .isInt({ min: 0 })
        .withMessage('Invalid address index'),
    (0, express_validator_1.body)('fullName')
        .optional()
        .notEmpty()
        .withMessage('Full name cannot be empty'),
    (0, express_validator_1.body)('street')
        .optional()
        .notEmpty()
        .withMessage('Street address cannot be empty'),
    (0, express_validator_1.body)('city')
        .optional()
        .notEmpty()
        .withMessage('City cannot be empty'),
    (0, express_validator_1.body)('state')
        .optional()
        .notEmpty()
        .withMessage('State cannot be empty'),
    (0, express_validator_1.body)('zipCode')
        .optional()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Invalid zip code'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage('Invalid phone number'),
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
        const user = req.user;
        const addressIndex = parseInt(req.params.index);
        if (addressIndex >= user.addresses.length) {
            res.status(404).json({
                success: false,
                error: 'Address not found',
            });
            return;
        }
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
        });
    }
    catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.delete('/addresses/:index', [
    (0, express_validator_1.param)('index')
        .isInt({ min: 0 })
        .withMessage('Invalid address index'),
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
        const user = req.user;
        const addressIndex = parseInt(req.params.index);
        if (addressIndex >= user.addresses.length) {
            res.status(404).json({
                success: false,
                error: 'Address not found',
            });
            return;
        }
        user.addresses.splice(addressIndex, 1);
        await user.save();
        res.json({
            success: true,
            data: user.addresses,
            message: 'Address deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map