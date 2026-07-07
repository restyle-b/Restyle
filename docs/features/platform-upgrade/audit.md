# Platform Upgrade — Current-State Audit (Opus agent A, 2026-07-04)

> Line-level audit of account area + admin panel vs. Shopify-class target.
> Feeds the milestone briefs in ../platform-upgrade.md. Facts verified by reading
> every file under the target paths at commit 88ca594.

## 1. ACCOUNT AUDIT

The account area is 4 pages, no shell: account/page.tsx (dashboard = profile line +
nav buttons), orders/page.tsx, orders/[orderNumber]/page.tsx, courses/page.tsx.
There is NO account/layout.tsx, no sidebar, no bottom nav. Navigation is ad-hoc
back-links. Only account component: account-icon-link.tsx (header icon).
Styling is manual dark-theme Tailwind (bg-ink-soft, border-line-dark) — predates
Phase 8.6 shadcn primitives, untouched by it.

Data per user: orders by userId (nullable — guest orders never link retroactively;
IDOR defense exists in order detail: userId !== session -> notFound). Enrollments by
userId only (customerEmail indexed but unused in account queries). User model has
name+phone but dashboard reads name from Supabase user_metadata, not Prisma.

i18n inconsistency: orders/courses pages use next-intl properly; account/page.tsx is
hardcoded Hebrew.

Gap table (customer dashboard): recent-orders card PARTIAL (list page exists, no card);
order tracking PARTIAL (status history in detail; no tracking-number concept);
active-courses card PARTIAL; profile editing MISSING (no UI, no server action — auth.ts
has signUp/signIn/password only; name/phone write-once at signup); profile completion
MISSING; wishlist MISSING (no model/code); saved addresses MISSING (per-order snapshot
only); recently-viewed MISSING; recommended MISSING; customer notifications MISSING;
quick actions MISSING; sidebar/bottom-nav MISSING.

## 2. ADMIN AUDIT

Shell (Phase 8.6) solid: own <html dir="rtl">, requireAdmin() in layout + every action
(verified), TooltipProvider, Toaster, Sidebar+Topbar+MobileNav. Upload route re-checks
role manually.

Dashboard: getDashboardStats() = counts only (active courses/testimonials/gallery/
products/categories, orders/enrollments by status, pending). StatCard grid + two
StatusBreakdown cards. Revenue KPI PARTIAL (today-revenue + AOV only on Orders page via
getOrdersOverview, orders.ts:80); customers count MISSING (no db.user.count anywhere);
inventory alerts PARTIAL (filter chips only, not on dashboard); charts MISSING (no lib,
no time-series query); activity feed not embedded (exists at /admin/activity).

Products (products-table.tsx, products.ts): strong inline-edit table — search, category
filter, stock-health chips with counts, featured filter, client sort, inline
price/sale/stock cells, 3 toggles, edit Sheet, delete ConfirmDialog, activity logging,
revalidatePublicPaths(). MISSING: bulk select/actions, drafts/scheduled (only boolean
active), SEO fields, duplicate, preview link, multi-image (imageUrl is single string,
one ImageUploadButton at product-edit-sheet.tsx:197).

Categories: bulk react-hook-form useFieldArray, NOT a table. updateCategories does
deleteMany(notIn submittedIds) + per-row upsert in one transaction (categories.ts:52-70).
MISSING: table view, _count products, duplicate. active checkbox EXISTS; numeric order
field only.

Courses: same giant useFieldArray bulk form (~285 lines). MISSING: table view, student
counts, duplicate/publish/archive/preview.

Orders: KPI cards via getOrdersOverview, server-side search + status/payment filters +
Pagination (PAGE_SIZE 25), expandable OrderRow, ALLOWED_ORDER_TRANSITIONS guard +
OrderStatusEvent + StatusHistory. MISSING: internal notes (no field), send-email,
tracking number. Enrollments: parallel structure, same gaps.

Inventory: stock health derived at display (getStockHealth, LOW_STOCK_THRESHOLD=5
hardcoded in lib/admin/product-schema.ts). Inline stock edit EXISTS, logs
product.stock_change. MISSING: dashboard alerts, per-product history view, reserved
stock. NOTE: stock decrements ONLY in handle-payment-result.ts:88 ($transaction, on
PAID); create-order only checks. Cancellation does NOT restore stock.

Notifications: bell = pending orders+enrollments counts from getDashboardStats, links
to filtered lists. No read/unread, no persistence, no model.

Settings: two sections only — site contact info (SiteSettingsForm) + opening hours.
Shipping fee hardcoded (4000 agorot, lib/checkout/shipping.ts DELIVERY_FEE_AGOROT;
schema comment on Order.shippingAgorot).

Activity: fully built — ActivityLog model, logActivity() best-effort helper, page with
entity-type chips + search + pagination + ActivityTimeline. Reference pattern.

## 3. REUSABLE BUILDING BLOCKS (do not rebuild)

- components/admin/pagination.tsx — Pagination (basePath+params+page/pageSize/total)
- components/admin/confirm-dialog.tsx + confirm-remove-button.tsx
- products/inline-editable-cell.tsx + price/sale-price/stock/toggle cells (toggle wraps
  Switch with optimistic + toast + router.refresh())
- Status menus (order/enrollment), badges (order/enrollment/stock-health),
  status-history.tsx, lib/admin/order-status-transitions.ts
- getOrdersOverview() / getEnrollmentsOverview() — KPI pattern to lift onto dashboard
- ActivityLog + logActivity(); listActivity returns entityTypes for chips
- POST /api/admin/upload (magic-byte sniffing) + image-upload-button.tsx
- unstable_cache in lib/content/get-*.ts with named tags; mutations revalidateTag +
  per-locale revalidatePath via local revalidatePublicPaths() helper — copy this shape
- lib/admin/form-styles.ts, buttonVariants, shadcn primitives in components/ui
- formatAgorot, shekelsToAgorot, getStockHealth, generateSlug, lib/admin/*-schema.ts
- requireAdmin() (returns {email}), getCurrentUser() (role), createSupabaseServerClient()

## 4. UX DEBT

- ZERO loading states: no loading.tsx anywhere, no Skeleton component, no Suspense in
  admin or account. All pages force-dynamic and block on await.
- Topbar re-runs getDashboardStats() on EVERY admin page load (topbar.tsx:7) — extra
  blocking round-trip site-wide.
- Empty states are plain <p> text everywhere.
- Account area visual debt: raw Tailwind, hardcoded Hebrew on dashboard page.
- Categories & Courses giant single-submit forms — most out-of-step screens.

## 5. RISKS / CONSTRAINTS

- Money = integer agorot everywhere; aggregate in agorot, divide only at display.
- requireAdmin() first line of every new admin action; API routes use upload-route pattern.
- Guest purchases never retroactively link to accounts (userId-only queries).
- No email/notification infra exists — "send email" features are bigger than they look.
- Product.imageUrl single string — multi-image is a schema migration.
- Payments still mock; revenue KPIs reflect mock orders until Tranzila.
- Out of scope: appointments (external app), curriculum/video, invoicing, role mgmt.
