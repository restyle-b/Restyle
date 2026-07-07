# Admin Panel Premium Redesign

> Planning doc. Created 2026-07-03 (plan mode, full rethink requested by the
> user — "pretend you are designing an admin panel for Shopify/Stripe/Linear/
> Vercel"). Source of truth for progress: `ROADMAP.md`.

## Context

The admin (`/admin`, fixed Hebrew RTL, outside `[locale]`) got a first
comfort pass earlier today (Phase 8: grouped nav, real dashboard, two-step
delete, breadcrumbs, search+pagination). The user now wants a **complete
rethink**, not a restyle: the business owner uses this every day, so it
should feel as premium as the customer-facing site, and match modern SaaS
dashboard conventions (Shopify/Stripe/Linear/Vercel) — inline editing,
reduced clicks, real component primitives (badges/tables/cards/sheets),
subtle motion.

Persona: single business owner (single ADMIN account, role mgmt cancelled in
Phase 8.5), checking the admin multiple times a day from desktop and phone.

## Why the current UX doesn't hold up

- **Products**: one giant `react-hook-form` + `useFieldArray` holding *every*
  product at once; "save" submits the whole array and the server action
  **deletes any row not present in the submitted array** (`products.ts`
  `deleteMany({ where: { id: { notIn: submittedIds } } })`). Changing one
  price means loading a form with every product's full multilingual
  content and re-submitting all of it. No inline edit, no bulk-safe partial
  update, no stock/visibility signal at a glance.
- **Orders/Enrollments**: flat link-list rows → full page navigation for any
  detail or status change. No stats, no payment-status filter, no
  timeline styling (plain `<ol>` text).
- **Nav**: single header row of text links, wraps on smaller screens, no
  breadcrumspan dashboard beyond a link grid, no notifications, no profile
  menu (just a bare sign-out button).
- **No dedicated audit trail** — `OrderStatusEvent`/`EnrollmentStatusEvent`
  (added this morning) only cover status transitions on those two entities;
  there's no record of product/price/stock edits or other admin writes.
- **No real component library** — only `Button`/`Container` exist. CLAUDE.md
  already approves shadcn/ui as the stack; it just hasn't been adopted yet.

## Data model changes

### `Product` — 3 new columns (all additive, backward compatible)

```prisma
model Product {
  // ...existing fields unchanged...
  salePriceAgorot Int?     // nullable sale price; "on sale" when set and < priceAgorot
  available       Boolean  @default(true)  // manual purchasability override
  featured        Boolean  @default(false) // highlighted on homepage/catalog
}
```

Three independent axes, deliberately kept separate (standard ecommerce
pattern, e.g. Shopify's Published/status vs inventory):
- **Visibility** = existing `active` (shown in the public catalog at all).
- **Availability** = new `available` (purchasable). Lets the owner pause
  sales on a listed product without hiding it — e.g. "back soon" — instead
  of conflating this with stock count.
- **Stock** = existing `stock` (Int count). Stock health is **derived**, not
  stored: `stock === 0` → out, `0 < stock <= LOW_STOCK_THRESHOLD (5)` → low,
  else healthy. A soldOut product (public site) is `stock <= 0 || !available`.

`salePriceAgorot` reuses the existing shekels↔agorot conversion pattern
(`shekelsToAgorot`), validated to be `> 0` and `< priceAgorot` when present.

### New `ActivityLog` model — unified admin audit trail

```prisma
model ActivityLog {
  id         String   @id @default(cuid())
  actorEmail String?  // admin email, or "system"/"payment" (mirrors changedBy convention)
  action     String   // "product.create" | "product.update" | "product.stock_change" |
                       // "product.delete" | "order.status_change" | "enrollment.status_change" |
                       // "admin.write" (courses/testimonials/gallery/content/settings)
  entityType String   // "product" | "order" | "enrollment" | "course" | "testimonial" | ...
  entityId   String?
  summary    String   // human-readable one-liner, precomputed at write time
  metadata   Json?    // structured before/after values — non-sensitive only (no PII beyond what's already public to the admin)

  createdAt DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("activity_log")
}
```

Deliberately **not** replacing `OrderStatusEvent`/`EnrollmentStatusEvent` —
those stay (customer-facing order/enrollment detail pages read them
directly). `ActivityLog` is an admin-only, append-only, cross-entity log;
order/enrollment status changes write to **both** (their own status-event
row + a summarized `ActivityLog` row) so the History page has one single
source to query instead of unioning 4+ tables. Written from: product
create/update/delete, explicit stock changes (separate `action` from a
generic field edit — the user called stock out specifically), order status
changes, enrollment status changes, and other admin CRUD writes (courses,
testimonials, gallery, content blocks, site settings).

No new RLS policy needed beyond the existing pattern (no public SELECT;
Prisma/service-role only, same as `orders`/`enrollments`).

## Component primitives (new)

CLAUDE.md approves shadcn/ui; only `Button` exists today. Adding, in
shadcn's own convention (Radix primitives + `cva`, Tailwind, dark theme
tokens already in `globals.css`):

- `Badge` — status/payment badges, stock-health badges, featured indicator.
- `Card` — stat tiles, dashboard sections.
- `Table` (`<table>` wrapper primitives, not a data-grid dependency) — products/orders/enrollments lists.
- `Sheet` (Radix Dialog under the hood, slide-over from the side matching RTL) — product quick-add/full-edit, order/enrollment detail-on-the-side.
- `DropdownMenu` — row actions menu, profile menu, notifications popover.
- `Dialog` — confirm-destructive (replaces the two-step inline confirm for a more standard modal, kept for delete only).
- `Switch` — availability/visibility toggles (replaces raw checkboxes).
- `Tooltip` — icon-only button labels.
- `sonner` (toast) — replaces today's inline green/red text messages after every save.

New deps: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`,
`@radix-ui/react-switch`, `@radix-ui/react-tooltip`, `sonner`. All
lightweight, no server-side impact, consistent with the already-approved
shadcn/ui direction.

## Navigation & shell redesign

Replace the single-row header with the standard SaaS shell:
- **Sidebar** (fixed, **right-hand side** to match RTL reading order),
  grouped: Dashboard · Catalog (Products, Categories) · Commerce (Orders,
  Course Registrations) · Content (Courses, Testimonials, Gallery, Site
  Text, Settings) · Activity (History). Collapsible to icon-only; becomes a
  `Sheet` overlay on mobile.
- **Topbar**: breadcrumb (auto-derived + page title), notifications bell
  (pending-orders + pending-enrollments count, dropdown → filtered links,
  reusing `getDashboardStats`), profile menu (`DropdownMenu`: email, role
  badge, sign out — replaces the bare `SignOutButton`).
- Page-level headers get consistent spacing/typography (title + subtitle +
  primary action button, e.g. "+ Add product", aligned right).

Out of scope for v1 (explicitly deferred, note in ROADMAP): command palette
(⌘K), bulk row-selection actions, configurable low-stock threshold.

## Server actions — contract changes

`products.ts` today: one `updateProducts(rows[])` that replaces the entire
table. Replaced with granular actions (still `requireAdmin()` first, still
zod-validated, still `revalidatePublicPaths()` + now also writes
`ActivityLog`):

- `createProduct(input)` — quick-add (name He, price, stock, category;
  slug auto-generated as already established) or full input from the edit sheet.
- `updateProductField(id, field, value)` — single-field inline edit
  (price/salePrice/stock/available/active/featured), one zod schema per
  field, minimal payload, optimistic-friendly.
- `updateProductDetails(id, input)` — full multilingual edit from the Sheet
  (name/description ×3 locales, image, category) — same validation as today's `productSchema` minus the row-array wrapper.
- `deleteProduct(id)` — single-row delete (replaces "omit from submitted
  array" semantics entirely — the implicit delete-by-omission is exactly
  the failure mode being removed).

Orders/enrollments keep `updateOrderStatus`/`updateEnrollmentStatus`
(already granular, already validated against `ALLOWED_ORDER_TRANSITIONS`)
— add the `ActivityLog` write alongside the existing status-event insert.

New `src/server/actions/admin/activity.ts`: `listActivity({ entityType?,
search?, page })` for the History page, plus an internal
`logActivity()` helper called from the other admin actions.

## Page-by-page plan

**Products & Inventory** (`/admin/products`)
- Stat/filter bar: total / low-stock / out-of-stock counts (clickable
  chips that set the stock-health filter), search (name), category filter,
  visibility/availability/featured filter, sort (name/price/stock/updated).
- Table rows: thumbnail, name + category, price (inline number input),
  sale price (inline, shows strikethrough regular price when active),
  stock (inline number + color-coded health badge), availability switch,
  visibility switch, featured star toggle, row menu (edit full details →
  Sheet, duplicate, delete → Dialog confirm).
- "+ Add product" → Sheet, minimal fields first, "add full details" expands
  the rest inline in the same Sheet (no second modal).
- Every inline control is its own server-action call + toast, no page-wide
  submit button anymore.

**Orders** (`/admin/orders`)
- Stat cards: pending count, today's paid revenue, today's order count,
  avg order value.
- Filters: order-status chips (existing) + payment-status filter (new) +
  search (existing).
- Table rows expand inline (accordion) to a compact summary (items,
  address, payment) + status-change control + a styled vertical timeline
  (icons/dots per status) reusing `StatusHistory` restyled; "view full
  order" still links to the existing (restyled) detail page for deep-linking/sharing.

**Course Registrations** (`/admin/enrollments`) — same treatment: stat
cards (pending, today's enrollments, deposit-vs-paid breakdown), filters
(status + course + plan), expandable rows, restyled detail page.

**Activity / History** (new: `/admin/activity`, new nav group)
- Vertical timeline: icon per action type, relative timestamp (absolute on
  hover), actor, one-line summary, expandable metadata (readable
  before→after, e.g. "Price ₪45 → ₪39").
- Filters: entity type, date range, search (actor/summary). Paginated
  (reuse `Pagination`).

## Security notes (per `security` skill — applied at implementation time)

- Every new/changed server action still opens with `requireAdmin()` — no
  exceptions for "just an inline toggle."
- `ActivityLog.metadata` — no PII beyond what the admin can already see
  elsewhere (product fields, order/enrollment customer summaries are
  already admin-visible); never log payment card data (already excluded
  from `Payment`/`CoursePayment` themselves).
- Inline-edit actions validate the single field with the same bounds as
  today's full-row schema (price > 0, stock 0–1,000,000, etc.) — a smaller
  payload must not mean weaker validation.
- `deleteProduct` — real delete (no soft-delete today), keep the
  confirm-destructive `Dialog`; consider whether `OrderItem.productId`
  (`onDelete: SetNull`) still holds — yes, unaffected by this change.

## Acceptance criteria

1. Changing a product's price, sale price, stock, availability,
   visibility, or featured flag requires **zero page navigation** and
   **zero unrelated fields resubmitted**.
2. Adding a new product to a catalog of N products only writes 1 new row —
   never re-touches the other N.
3. Products list visually distinguishes healthy / low / out-of-stock at a
   glance (color, not just a number).
4. Orders and Enrollments lists show status + payment/plan info + customer
   + date + total without opening a detail page; expanding a row shows
   items/address/timeline without navigating away.
5. `/admin/activity` shows a paginated, filterable timeline covering
   product edits, stock changes, order status changes, enrollment status
   changes, and other admin content writes, each with a timestamp and actor.
6. Admin shell has a sidebar + topbar with breadcrumbs, a notifications
   affordance reflecting pending orders/enrollments, and a profile menu
   with sign-out.
7. `requireAdmin()` still gates every action (inline or not); `npx tsc
   --noEmit && npm run lint && npm test && npm run build` green;
   `security` skill review passes with 0 Critical/High.
8. Verified in a real browser (local throwaway Postgres, per this
   session's established verification method) — not just typecheck.

## Delivery groups (each committed+pushed separately, matching this
morning's admin-redesign convention)

- **A — Foundations**: new primitives (Badge/Card/Table/Sheet/DropdownMenu/
  Dialog/Switch/Tooltip/Toaster) + new admin shell (sidebar/topbar/
  breadcrumbs/notifications/profile menu), replacing `admin/layout.tsx` +
  `admin-nav.tsx`. New deps installed.
- **B — Data model**: migration (`Product.salePriceAgorot/available/
  featured` + `ActivityLog`), `product-schema.ts` updates, verified against
  the local throwaway Postgres (same method used earlier this session).
- **C — Products & Inventory**: granular server actions, redesigned table
  page, inline editing, quick-add Sheet, filters/search/sort, stock-health
  badges.
- **D — Orders**: stat cards, payment-status filter, expandable rows,
  restyled timeline, activity logging on status change.
- **E — Course Registrations**: same treatment as D.
- **F — Activity/History**: new page + `activity.ts` actions + timeline UI;
  wire `logActivity()` into products/orders/enrollments/other admin writes.
- **G — Polish pass**: transitions/animations, responsive check top to
  bottom, `security` skill review, `qa` skill pass, `ROADMAP.md` finalize.

Branch: continue on `academy-phase-7` (PR #7 already carries this morning's
admin redesign; this is its direct continuation, not a new PR).
