# Admin Panel Design Guidelines - Beartshare

## Design System: Material Design
Utility-focused, information-dense admin interface for CRUD operations, data tables, and forms.

---

## Typography

**Font**: Inter (Google Fonts) → Fallback: system-ui, sans-serif

**Scale**:
```css
Page Titles:     2rem (32px) / 700
Section Headers: 1.5rem (24px) / 600
Component Titles: 1.25rem (20px) / 600
Body:            0.875rem (14px) / 400
Labels:          0.75rem (12px) / 500
Table Headers:   0.8125rem (13px) / 600 / uppercase / letter-spacing: 0.05em
```

**Line Heights**: Headers 1.2 | Body 1.5 | Tables 1.4

---

## Layout & Spacing

**Spacing Scale** (Tailwind): 2, 3, 4, 6, 8, 12, 16
- Micro: `p-2, p-3, gap-2`
- Component: `p-4, p-6, gap-4`
- Section: `p-8, py-12, gap-8`
- Page: `px-6 py-8` (mobile), `px-12 py-16` (desktop)

**Grid**:
- Sidebar: `w-64` (fixed) + Main: `flex-1`
- Container: `max-w-7xl mx-auto`
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Forms: `grid-cols-2` (desktop), `grid-cols-1` (mobile)

**Breakpoints**: Mobile <640px | Tablet 768px+ | Desktop 1024px+ | Wide 1280px+

---

## Components

### Navigation

**Sidebar** (`w-64`, fixed desktop / drawer mobile):
```html
- Logo: p-6 (top)
- Nav items: py-3 px-6 rounded-lg
- Active: bg-accent + 4px left border
- Icons: Heroicons (outline default, solid active)
- Grouped sections: border-t my-4
```

**Top Bar** (`h-16`, sticky):
- Mobile: Hamburger | Title | Profile
- Desktop: [Page context in sidebar] | Notifications | Profile dropdown

### Data Tables

**Structure**:
```html
<table class="w-full">
  <thead class="sticky top-0 shadow-sm">
    <tr class="py-4"> <!-- Sort arrows, checkboxes -->
  <tbody class="hover:bg-gray-50 transition">
```

**Toolbar** (above table):
- Left: Bulk actions (when selected)
- Right: Search `w-full md:w-96` | Filter | Export | Add (primary)

**Features**: Sticky header, alternating rows, pagination ("1-10 of 250"), empty states

### Forms

**Layout**:
```html
<form class="p-8 grid grid-cols-2 gap-6">
  <label class="mb-2 font-medium">
  <input class="h-11 px-4 rounded-lg border-2"> <!-- Focus: keep 2px border -->
  <textarea class="min-h-32 p-4 col-span-2">
  <div class="col-span-2 pt-6 border-t"> <!-- Actions -->
```

**Inputs**: `h-11`, `rounded-lg`, `border-2` | Disabled: `opacity-50 cursor-not-allowed`

**Rich Editor**: `col-span-2`, `min-h-96`, TinyMCE/Quill, character counter

### Cards

**Standard**: `rounded-xl p-6 shadow-sm hover:shadow-md border`

**Stat Cards** (Dashboard):
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div class="min-h-32 p-6">
    <div class="w-12 h-12 rounded-lg"> <!-- Icon -->
    <div class="text-2xl font-bold"> <!-- Value -->
    <div class="text-sm"> <!-- Trend -->
```

**Blog Preview**:
- Image: `aspect-ratio-16/9 object-cover`
- Content: `p-6`, title `text-lg line-clamp-2`, excerpt `text-sm line-clamp-3`

### Buttons

```css
Primary:   h-11 px-6 rounded-lg font-medium
Secondary: h-11 px-6 rounded-lg font-medium border-2 (outline)
Icon:      w-10 h-10 rounded-lg (Heroicons 20px)
Disabled:  opacity-50 cursor-not-allowed
```

**Groups**: Connected with `rounded-l`/`rounded-r` on edges

### Modals

```html
<div class="fixed inset-0 bg-black/50"> <!-- Overlay -->
  <div class="max-w-2xl rounded-xl p-8">
    <header class="flex justify-between mb-6">
    <div> <!-- Content -->
    <footer class="border-t pt-6"> <!-- Actions -->
```

**Variants**: Confirmation `max-w-md` | Form `max-w-2xl` | Preview `max-w-4xl`

### Badges & Tags

**Status**: `px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide`

**Category**: `px-3 py-1.5 rounded-md text-sm font-medium` (removable with X)

### Notifications

**Toast** (`fixed top-4 right-4 w-96`):
- Icon + Message + Close
- Auto-dismiss 5s with progress bar
- Stack with `gap-2`

**Inline Alerts**: `rounded-lg p-4 mb-6` | Icon + Message + Optional action

---

## Page Templates

### Dashboard
1. Welcome + 4-column stat cards
2. Recent activity table + Quick actions
3. 2-column charts (if analytics)

### Users List
- Title + Add button
- Search | Role filter | Status filter
- Table: Checkbox | Avatar | Name | Email | Phone | Status | Actions
- Pagination

### Email/SMS Composer
**Desktop**: 2-column layout
- Left (`w-96`): User list + checkboxes + search
- Right: Subject (email) | Message `min-h-48` | Character counter (SMS) | Template selector

**Recipient Summary**: "15 kullanıcı seçildi" + tags (scrollable `max-h-32`)

### Blog Posts
**List View**:
- Title + Add button + Grid/List toggle
- Grid: 3-column cards with images
- List: Table view
- Filters: Category | Status | Search

**Editor** (full-width):
```html
<div class="px-12">
  <toolbar class="sticky top-0"> <!-- Autosave | Preview | Save | Publish -->
  <input class="text-3xl font-bold mb-6"> <!-- Title -->
  <select class="mb-4"> <!-- Category -->
  <div class="aspect-ratio-16/9 mb-6"> <!-- Featured image -->
  <div class="min-h-96"> <!-- Rich editor -->
```

### Blog Categories
- Table: Name | Slug | Post Count | Actions
- Inline add form at top
- Edit modal

---

## Icons & Accessibility

**Heroicons** (CDN): Nav 24px | Buttons 20px | Tables 18px | Forms 20px

**A11y Requirements**:
- Labels for all inputs (not placeholders only)
- Focus: `ring-2 ring-offset-2`
- ARIA labels on icon buttons
- Keyboard navigation support
- Skip to content link
- Icons + text (never color alone)
- Touch targets ≥44×44px

---

## Responsive Strategy

**Mobile** (<768px):
- Sidebar → drawer
- Tables → horizontal scroll + sticky first column
- Forms → single column
- Composer → modal for recipient selection

**Tablet** (768-1024px):
- Collapsible sidebar
- Hide non-critical table columns
- 2-column forms/stats

**Desktop** (1024px+):
- Full sidebar
- All table columns
- Hover states active

---

## Localization (Turkish)

- Dates: `DD.MM.YYYY`
- Numbers: `1.234,56`
- All UI text in Turkish
- Validation messages in Turkish

---

## Performance

- Paginated tables (lazy load)
- Debounced search (300ms)
- Virtual scrolling (large lists)
- Optimized blog images
- Progressive dashboard loading

---

## Quick Reference

**Common Patterns**:
```html
<!-- Page Container -->
<div class="px-6 py-8 md:px-12 md:py-12 max-w-7xl mx-auto">

<!-- Section -->
<section class="mb-8">

<!-- Card -->
<div class="rounded-xl p-6 shadow-sm border">

<!-- Form Field -->
<div>
  <label class="block mb-2 font-medium">Label</label>
  <input class="h-11 px-4 w-full rounded-lg border-2 focus:border-primary">
  <p class="text-xs mt-1 text-gray-600">Helper text</p>
</div>
```

**Color Strategy**: Use Tailwind semantic classes (`bg-primary`, `text-error`) with design system tokens.