import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import {
  users,
  blogCategories,
  blogPosts,
  emailTemplates,
  points,
  refPointCashOut,
  type User,
  type InsertUser,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogPost,
  type InsertBlogPost,
  type EmailTemplate,
  type InsertEmailTemplate,
  type Point,
  type InsertPoint,
  type RefPointCashOut,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUsersByIds(ids: number[]): Promise<User[]>;

  // Blog Categories
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  getBlogCategoryPostCount(categoryId: number): Promise<number>;

  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;

  // Points
  getUserPoints(userId: number): Promise<Point[]>;
  getUserPointsSummary(userId: number): Promise<{ earned: number; spent: number; total: number }>;
  getUserCashOuts(userId: number): Promise<RefPointCashOut[]>;
  createPoint(point: InsertPoint): Promise<Point>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUsersByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return await db.select().from(users).where(sql`${users.id} IN ${ids}`);
  }

  // Blog Categories
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories).orderBy(blogCategories.title);
  }

  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    const results = await db.select().from(blogCategories).where(eq(blogCategories.id, id)).limit(1);
    return results[0];
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const result = await db.insert(blogCategories).values(category);
    const id = Number(result[0].insertId);
    const created = await this.getBlogCategory(id);
    return created!;
  }

  async updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    await db.update(blogCategories).set(category).where(eq(blogCategories.id, id));
    return await this.getBlogCategory(id);
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
    return true;
  }

  async getBlogCategoryPostCount(categoryId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.category, categoryId));
    return Number(result[0]?.count || 0);
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.id));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return results[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post);
    const id = Number(result[0].insertId);
    const created = await this.getBlogPost(id);
    return created!;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    await db.update(blogPosts).set(post).where(eq(blogPosts.id, id));
    return await this.getBlogPost(id);
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.created_at));
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const results = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
    return results[0];
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await db.insert(emailTemplates).values(template);
    const id = Number(result[0].insertId);
    const created = await this.getEmailTemplate(id);
    return created!;
  }

  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    // updated_at is set in routes.ts before calling this method
    await db.update(emailTemplates).set(template).where(eq(emailTemplates.id, id));
    return await this.getEmailTemplate(id);
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }

  // Points
  async getUserPoints(userId: number): Promise<Point[]> {
    return await db.select().from(points).where(eq(points.user_id, userId)).orderBy(desc(points.created_at));
  }

  async getUserPointsSummary(userId: number): Promise<{ earned: number; spent: number; total: number }> {
    // Get total earned points
    const earnedResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${points.points}), 0)` })
      .from(points)
      .where(eq(points.user_id, userId));
    const earned = Number(earnedResult[0]?.total || 0);

    // Get total spent points
    const spentResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${refPointCashOut.points}), 0)` })
      .from(refPointCashOut)
      .where(eq(refPointCashOut.user_id, userId));
    const spent = Number(spentResult[0]?.total || 0);

    return {
      earned,
      spent,
      total: earned - spent
    };
  }

  async getUserCashOuts(userId: number): Promise<RefPointCashOut[]> {
    return await db.select().from(refPointCashOut).where(eq(refPointCashOut.user_id, userId)).orderBy(desc(refPointCashOut.created_at));
  }

  async createPoint(point: InsertPoint): Promise<Point> {
    const result = await db.insert(points).values(point);
    const id = Number(result[0].insertId);
    const results = await db.select().from(points).where(eq(points.id, id)).limit(1);
    return results[0]!;
  }
}

export const storage = new DatabaseStorage();
