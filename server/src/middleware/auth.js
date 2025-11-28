import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function auth(required = true) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (required) return res.status(401).json({ message: 'Missing Authorization header' });
      return next();
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid Authorization format' });
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      try {
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
      } catch (dbError) {
        // If database is not available, skip user loading for optional auth
        if (!required) {
          console.warn('Database unavailable, skipping user verification');
          return next();
        }
        throw dbError;
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
