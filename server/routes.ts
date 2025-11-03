import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { sendEmail, replaceTemplateTags } from "./email";
import { sendSMS, cleanPhoneNumber } from "./sms";
import { uploadImageToCloudflare, uploadImageFromFile } from "./cloudflare";
import { verifyAdminCredentials, requireAuth, isAuthenticated } from "./auth";
import {
  insertBlogCategorySchema,
  insertBlogPostSchema,
  insertEmailTemplateSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to format date as MySQL datetime string (YYYY-MM-DD HH:mm:ss)
function formatMySQLDateTime(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Turkish-friendly slug generator
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Replace multiple - with single -
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication API
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await verifyAdminCredentials(username, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials or not an admin" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.isAdmin = true;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth-check", isAuthenticated);

  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Blog Categories API
  app.get("/api/blog-categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      
      // Add post count to each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => ({
          ...cat,
          postCount: await storage.getBlogCategoryPostCount(cat.id),
        }))
      );
      
      res.json(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/blog-categories", async (req, res) => {
    try {
      const validated = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(validated);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.put("/api/blog-categories/:id", async (req, res) => {
    try {
      const validated = insertBlogCategorySchema.partial().parse(req.body);
      const category = await storage.updateBlogCategory(parseInt(req.params.id), validated);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.delete("/api/blog-categories/:id", async (req, res) => {
    try {
      await storage.deleteBlogCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Blog Posts API
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/blog-posts", requireAuth, async (req, res) => {
    try {
      // Normalize status BEFORE validation (frontend sends number, backend expects string)
      if (req.body.status !== undefined) {
        if (req.body.status === 1 || req.body.status === '1' || req.body.status === 'published' || req.body.status === 'Yayında') {
          req.body.status = '1';
        } else if (req.body.status === 0 || req.body.status === '0' || req.body.status === 'draft' || req.body.status === 'Taslak') {
          req.body.status = '0';
        }
      }
      
      const validated = insertBlogPostSchema.parse(req.body);
      
      // Generate slug from title if not provided
      if (!validated.slug && validated.title) {
        validated.slug = generateSlug(validated.title);
      }
      
      // Set user_id from session
      validated.user_id = req.session.userId;
      
      // Set created_at and updated_at timestamps in MySQL datetime format
      const now = formatMySQLDateTime();
      validated.created_at = now;
      validated.updated_at = now;
      
      const post = await storage.createBlogPost(validated);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.put("/api/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      // Normalize status BEFORE validation (frontend sends number, backend expects string)
      if (req.body.status !== undefined) {
        if (req.body.status === 1 || req.body.status === '1' || req.body.status === 'published' || req.body.status === 'Yayında') {
          req.body.status = '1';
        } else if (req.body.status === 0 || req.body.status === '0' || req.body.status === 'draft' || req.body.status === 'Taslak') {
          req.body.status = '0';
        }
      }
      
      const validated = insertBlogPostSchema.partial().parse(req.body);
      
      // Regenerate slug from title if title is being updated
      if (validated.title && !validated.slug) {
        validated.slug = generateSlug(validated.title);
      }
      
      // Don't update user_id on edit (keep original creator)
      // Set updated_at timestamp in MySQL datetime format
      validated.updated_at = formatMySQLDateTime();
      
      const post = await storage.updateBlogPost(parseInt(req.params.id), validated);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Image Upload API
  app.post("/api/upload-image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadImageFromFile(req.file.buffer, req.file.originalname);

      if (!result.success || !result.result) {
        return res.status(500).json({ error: "Image upload failed" });
      }

      console.log("Cloudflare upload result:", JSON.stringify(result.result, null, 2));

      // Use the variants from Cloudflare response, or construct URL
      let imageUrl: string;
      
      if (result.result.variants && result.result.variants.length > 0) {
        // Use the first variant from Cloudflare
        imageUrl = result.result.variants[0];
      } else {
        // Fallback: construct URL (usually public variant is available)
        const imageId = result.result.id;
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        imageUrl = `https://imagedelivery.net/${accountId}/${imageId}/public`;
      }

      // Return both formats: {url} for cover photo and {success, variants} for editor
      res.json({ 
        url: imageUrl,
        success: true,
        variants: result.result.variants || [imageUrl]
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Email Templates API
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const validated = insertEmailTemplateSchema.parse(req.body);
      
      // Set created_at and updated_at timestamps in MySQL datetime format
      const now = formatMySQLDateTime();
      validated.created_at = now;
      validated.updated_at = now;
      
      const template = await storage.createEmailTemplate(validated);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const validated = insertEmailTemplateSchema.partial().parse(req.body);
      
      // Set updated_at timestamp in MySQL datetime format
      validated.updated_at = formatMySQLDateTime();
      
      const template = await storage.updateEmailTemplate(parseInt(req.params.id), validated);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      await storage.deleteEmailTemplate(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Send Email API
  app.post("/api/send-email", async (req, res) => {
    try {
      const { userIds, subject, message, templateId, customText } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs required" });
      }

      const users = await storage.getUsersByIds(userIds);
      
      let finalSubject = subject;
      let finalMessage = message;

      // If template is used, get template and replace tags
      if (templateId) {
        const template = await storage.getEmailTemplate(parseInt(templateId));
        if (template) {
          finalSubject = template.subject;
          finalMessage = template.content;
        }
      }

      // Send emails to all users
      const emailPromises = users.map((user) => {
        const personalizedSubject = replaceTemplateTags(finalSubject, user, customText);
        const personalizedMessage = replaceTemplateTags(finalMessage, user, customText);

        return sendEmail({
          to: [user.email],
          subject: personalizedSubject,
          html: personalizedMessage,
        });
      });

      await Promise.all(emailPromises);

      res.json({ success: true, sentCount: users.length });
    } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ error: "Failed to send emails" });
    }
  });

  // Send SMS API
  app.post("/api/send-sms", async (req, res) => {
    try {
      const { userIds, message } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs required" });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: "Message required" });
      }

      const users = await storage.getUsersByIds(userIds);
      const phoneNumbers = users
        .filter((u) => u.mobile)
        .map((u) => cleanPhoneNumber(u.mobile!));

      if (phoneNumbers.length === 0) {
        return res.status(400).json({ error: "No valid phone numbers found" });
      }

      const result = await sendSMS({
        message,
        recipients: phoneNumbers,
      });

      res.json({ success: true, sentCount: phoneNumbers.length, result });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // Cloudflare Images API - Upload from URL
  app.post("/api/upload-image-url", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Image URL required" });
      }

      const result = await uploadImageToCloudflare(url);
      
      if (result.success && result.result) {
        res.json({
          success: true,
          imageId: result.result.id,
          variants: result.result.variants,
        });
      } else {
        res.status(400).json({ error: "Upload failed", details: result.errors });
      }
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Cloudflare Images API - Upload from file
  app.post("/api/upload-image", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadImageFromFile(
        req.file.buffer,
        req.file.originalname
      );
      
      if (result.success && result.result) {
        res.json({
          success: true,
          imageId: result.result.id,
          variants: result.result.variants,
        });
      } else {
        res.status(400).json({ error: "Upload failed", details: result.errors });
      }
    } catch (error) {
      console.error("Error uploading image file:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
