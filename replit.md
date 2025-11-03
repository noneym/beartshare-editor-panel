# Beartshare Admin Panel

## Overview

Beartshare Admin Panel is a full-stack administrative dashboard built with React, Express, and MySQL. The application provides comprehensive user management capabilities, bulk communication tools (email and SMS), and a complete blog management system with categories and WYSIWYG editing.

The platform is designed as an information-dense Material Design admin interface focused on CRUD operations, data tables, forms, and bulk communication workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles with Inter font family
- Custom theme system supporting light/dark modes via CSS variables
- Responsive design with mobile-first breakpoints (640px, 768px, 1024px, 1280px)

**Design Philosophy:**
- Information-dense layout optimized for admin workflows
- Utility-focused with hover states and elevation effects
- Fixed sidebar navigation (20rem width) with collapsible mobile drawer
- Consistent spacing scale using Tailwind spacing units (2, 3, 4, 6, 8, 12, 16)

**State Management:**
- React Query for server state, caching, and automatic refetching
- Query client configured with infinite staleTime and disabled automatic refetching
- Local component state for UI interactions and forms
- React Hook Form with Zod validation for form management

**Key Features:**
- Rich text blog editor with formatting toolbar (headings, lists, links, images)
- User selection interface with multi-select checkboxes
- Email template system with variable substitution ([isim], [soyisim], [email], [metin])
- Real-time template preview with sample data
- Toast notifications for user feedback

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- ES modules throughout the codebase
- Custom middleware for JSON request logging and timing
- Vite middleware integration for HMR during development

**API Design:**
- RESTful API endpoints under `/api/*` prefix
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Centralized error handling with appropriate status codes

**Key API Endpoints:**
- `/api/users` - User CRUD operations
- `/api/blog-categories` - Category management with post counts
- `/api/blog-posts` - Blog post CRUD with status management
- `/api/email-templates` - Template CRUD operations
- `/api/send-email` - Bulk email sending with template support
- `/api/send-sms` - Bulk SMS sending

**Business Logic:**
- Storage layer abstraction (IStorage interface) for data access
- Template variable replacement system for personalized communications
- User filtering and selection for bulk operations

### Data Storage

**Database:**
- MySQL (MariaDB) as the primary database
- Connection pooling with mysql2/promise (10 connections, unlimited queue)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript types generated from Drizzle schemas

**Database Configuration:**
- Remote MySQL server (default: 138.199.140.167:10003)
- Environment variable support for flexible deployment
- Database name: beartshare

**Schema Design:**
```
users (main user table)
- Core fields: id, name, lastname, email, mobile, tcno
- Auth: username, password, remember_token
- Metadata: level, admin, mail_verify, ref_code, birth_date
- Timestamps: created_at, updated_at

blog_category
- id, title, slug (unique)
- Timestamps: created_at, updated_at

blog_post
- id, title, content (text), slug
- category (foreign key to blog_category)
- image, user_id, status (draft/published)
- Timestamps: created_at, updated_at

email_templates
- id, name, subject, content (HTML)
- Timestamps: created_at
```

**ORM Features:**
- Drizzle Zod schema generation for runtime validation
- Migration support via drizzle-kit
- Type-safe query builder with select, insert, update, delete operations
- Relationship queries for category post counts

### External Dependencies

**Email Service:**
- Nodemailer with SMTP transport
- Provider: Brevo (formerly Sendinblue) SMTP relay
- Default configuration: smtp-relay.brevo.com:587
- Template variable support: [isim], [soyisim], [email], [metin]
- Bulk sending capability with multiple recipients

**SMS Service:**
- NetGSM SOAP API integration
- XML-based SOAP requests for message delivery
- Phone number normalization (automatic 90 country code handling)
- Custom header support (default: BEARTSHARE)
- Turkish encoding support

**Third-Party Libraries:**
- **UI Components:** @radix-ui/* (accordion, dialog, dropdown, select, etc.)
- **Forms:** react-hook-form with @hookform/resolvers for Zod validation
- **Date Handling:** date-fns for date formatting and manipulation
- **Utilities:** clsx and tailwind-merge for className management
- **Icons:** lucide-react for consistent icon system
- **XML Parsing:** xml2js for SOAP response handling

**Development Tools:**
- Replit-specific plugins for runtime error overlay and dev banner
- esbuild for production server bundling
- tsx for TypeScript execution in development

**Build & Deployment:**
- Separate client and server build processes
- Client builds to `dist/public` via Vite
- Server bundles to `dist/index.js` via esbuild
- Production mode serves static files from Express
- Environment-based configuration (NODE_ENV)