import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import {
  users,
  blogCategories,
  blogPosts,
  emailTemplates,
  type User,
  type InsertUser,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogPost,
  type InsertBlogPost,
  type EmailTemplate,
  type InsertEmailTemplate,
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
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.created_at));
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
    await db.update(blogPosts).set({ ...post, updated_at: new Date() }).where(eq(blogPosts.id, id));
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
    await db.update(emailTemplates).set({ ...template, updated_at: new Date() }).where(eq(emailTemplates.id, id));
    return await this.getEmailTemplate(id);
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
