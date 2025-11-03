import crypto from 'crypto';
import { type Request, type Response, type NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

// SHA1 hash function
export function hashPassword(password: string): string {
  return crypto.createHash('sha1').update(password).digest('hex');
}

// Verify user credentials
export async function verifyAdminCredentials(username: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.username, username),
        eq(users.password, hashedPassword),
        eq(users.admin, 1)
      )
    )
    .limit(1);

  return user || null;
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId && req.session?.isAdmin) {
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized' });
}

// Check if user is authenticated (for client-side checks)
export function isAuthenticated(req: Request, res: Response) {
  if (req.session?.userId && req.session?.isAdmin) {
    res.json({ authenticated: true, userId: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
}
