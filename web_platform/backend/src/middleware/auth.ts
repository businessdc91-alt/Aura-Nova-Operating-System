import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { auth } from '../config/firebase';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken & { isAdmin?: boolean };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Optional: Check if user has admin claim or specific roles
    // const userRecord = await auth.getUser(decodedToken.uid);
    // const isAdmin = userRecord.customClaims?.admin === true;

    req.user = {
        ...decodedToken,
        // isAdmin 
    };

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
