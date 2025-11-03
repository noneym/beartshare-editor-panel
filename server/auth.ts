import crypto from 'crypto';
import { type Request, type Response, type NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

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

// Verify user credentials (supports both username and email)
export async function verifyAdminCredentials(usernameOrEmail: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  // Try to find user by username or email, with correct password and admin status
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        or(
          eq(users.username, usernameOrEmail),
          eq(users.email, usernameOrEmail)
        ),
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

// Ensure default admin user exists
export async function ensureDefaultAdmin() {
  console.log('🔐 Checking for default admin user...');
  try {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    console.log('🔍 Querying database for admin user...');
    // Check if admin user exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .limit(1);

    if (!existingAdmin) {
      console.log('✨ Admin user not found, creating default admin user...');
      const hashedPassword = hashPassword(adminPassword);
      console.log('🔑 Password hashed');
      
      await db.insert(users).values({
        username: adminUsername,
        password: hashedPassword,
        name: 'Admin',
        lastname: 'User',
        email: 'admin@beartshare.com',
        mobile: '5551234567',
        admin: 1,
        level: 1,
        mail_verify: 1,
      });
      
      console.log('✅ Default admin user created successfully (username: admin, password: admin123)');
    } else {
      console.log('👤 Admin user already exists (ID: ' + existingAdmin.id + ', admin flag: ' + existingAdmin.admin + ')');
      if (existingAdmin.admin !== 1) {
        // Ensure the admin user has admin privileges
        console.log('⚠️  Updating admin privileges...');
        await db.update(users)
          .set({ admin: 1 })
          .where(eq(users.id, existingAdmin.id));
        
        console.log('✅ Updated existing admin user privileges');
      }
    }
  } catch (error) {
    console.error('❌ Error ensuring default admin user:', error);
    console.error('Stack trace:', (error as Error).stack);
  }
}
