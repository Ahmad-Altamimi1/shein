"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const User_1 = require("../models/User");
if (!firebase_admin_1.default.apps.length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
    }
}
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
            });
            return;
        }
        try {
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
            req.userId = decodedToken.uid;
            let user = await User_1.User.findOne({ firebaseUid: decodedToken.uid });
            if (!user) {
                user = new User_1.User({
                    firebaseUid: decodedToken.uid,
                    email: decodedToken.email || '',
                    displayName: decodedToken.name || 'User',
                    photoURL: decodedToken.picture,
                });
                await user.save();
            }
            req.user = user;
            next();
            return;
        }
        catch (firebaseError) {
            try {
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    throw new Error('JWT secret not configured');
                }
                const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
                req.userId = decoded.userId;
                const user = await User_1.User.findById(decoded.userId);
                if (!user) {
                    res.status(401).json({
                        success: false,
                        error: 'User not found',
                    });
                    return;
                }
                req.user = user;
                next();
            }
            catch (jwtError) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                });
            }
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            req.userId = 'guest';
            next();
            return;
        }
        try {
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
            req.userId = decodedToken.uid;
            const user = await User_1.User.findOne({ firebaseUid: decodedToken.uid });
            req.user = user;
        }
        catch (error) {
            req.userId = 'guest';
        }
        next();
    }
    catch (error) {
        console.error('Optional auth error:', error);
        req.userId = 'guest';
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map