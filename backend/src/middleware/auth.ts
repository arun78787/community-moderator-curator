// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1) Try Authorization header first
    const authHeader = (req.headers['authorization'] || '') as string;
    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2) If not found, try cookies (cookie-parser must be enabled in server)
    if (!token) {
      // @ts-ignore - cookie typing may not exist in Request
      token = (req.cookies && (req.cookies.token || req.cookies.jwt)) || undefined;
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
    let payload: any;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (err) {
      console.warn('JWT verification failed:', err);
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }

    // If payload contains a user id, try to fetch user from DB (non-fatal lookup)
    const userId = payload.id ?? payload.userId ?? payload.sub;
    if (userId) {
      try {
        const user = await User.findByPk(userId);
        if (!user) {
          console.warn('Token validated but user not found in DB:', userId);
          return res.status(401).json({ message: 'Unauthorized: user not found' });
        }
        req.user = user;
      } catch (dbErr) {
        console.error('DB error while loading user for token:', dbErr);
        return res.status(500).json({ message: 'Server error while validating token' });
      }
    } else {
      // no user id in payload, attach raw payload so handlers can still read it
      req.user = payload;
    }

    return next();
  } catch (err) {
    console.error('Unexpected auth error:', err);
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const role = (req.user.role as string) || (req.user.get && req.user.get('role')) || undefined;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
