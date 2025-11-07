import { mysqlTable, varchar, text, longtext, int, timestamp, datetime } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }),
  remember_token: varchar("remember_token", { length: 255 }),
  level: int("level"),
  email: varchar("email", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }),
  tcno: varchar("tcno", { length: 50 }),
  birth_date: varchar("birth_date", { length: 50 }),
  admin: int("admin"),
  ref_code: varchar("ref_code", { length: 255 }),
  mail_verify: int("mail_verify"),
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime
});

export const blogCategories = mysqlTable("blog_category", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime
});

export const blogPosts = mysqlTable("blog_post", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 500 }).notNull(),
  content: longtext("content").notNull(), // Changed to longtext for large blog posts (4GB max)
  category: int("category"),
  image: varchar("image", { length: 500 }),
  user_id: int("user_id"),
  status: varchar("status", { length: 50 }).default("draft"),
  slug: varchar("slug", { length: 500 }),
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime: 2025-08-16 18:06:44
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime: 2025-08-16 18:06:44
});

export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  content: longtext("content").notNull(), // Changed to longtext for large email templates
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime
});

export const points = mysqlTable("points", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  points: int("points").notNull(),
  ref_user_id: int("ref_user_id"),
  order_id: int("order_id"),
  note: text("note"),
  status: varchar("status", { length: 50 }),
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime
});

export const refPointCashOut = mysqlTable("ref_point_cash_out", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  points: int("points").notNull(), // Harcanan puan miktarı
  note: text("note"),
  status: varchar("status", { length: 50 }),
  created_at: varchar("created_at", { length: 50 }), // Database stores as varchar datetime
  updated_at: varchar("updated_at", { length: 50 }), // Database stores as varchar datetime
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  // Don't omit created_at and updated_at - backend sets them explicitly
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  // Don't omit created_at and updated_at - backend sets them explicitly
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  // Don't omit created_at and updated_at - backend sets them explicitly
});

export const insertPointSchema = createInsertSchema(points).omit({
  id: true,
  // Don't omit created_at and updated_at - backend sets them explicitly
});

export const insertRefPointCashOutSchema = createInsertSchema(refPointCashOut).omit({
  id: true,
  // Don't omit created_at and updated_at - backend sets them explicitly
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type Point = typeof points.$inferSelect;
export type InsertPoint = z.infer<typeof insertPointSchema>;

export type RefPointCashOut = typeof refPointCashOut.$inferSelect;
export type InsertRefPointCashOut = z.infer<typeof insertRefPointCashOutSchema>;
