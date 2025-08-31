import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
      });
      return;
    }

    // Try Firebase token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      
      // Find or create user in our database
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (!user) {
        user = new User({
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
    } catch (firebaseError) {
      // If Firebase token fails, try JWT
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT secret not configured');
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
        req.userId = decoded.userId;
        
        const user = await User.findById(decoded.userId);
        if (!user) {
          res.status(401).json({
            success: false,
            error: 'User not found',
          });
          return;
        }
        
        req.user = user;
        next();
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue as guest
      req.userId = 'guest';
      next();
      return;
    }

    // Try to authenticate, but don't fail if token is invalid
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      req.user = user;
    } catch (error) {
      // Token invalid, continue as guest
      req.userId = 'guest';
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.userId = 'guest';
    next();
  }
};