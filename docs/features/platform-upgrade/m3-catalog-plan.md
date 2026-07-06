# M3 (Phase 15) — Catalog Management: Consolidated Planning Brief (Opus, 2026-07-04)

> Reconciliation note: the schema/migration described here was applied by the
> orchestrator as `20260704010000_catalog_lifecycle_and_seo` (this brief proposed
> `20260706000000_product_course_lifecycle_seo` — different name/timestamp, byte-identical
> field list). Already committed, local-verified (0 drift), applied to production.

Scope: Product + Course lifecycle (`publishAt`) + SEO columns (DONE); Products bulk
actions + duplicate + preview + SEO/publishAt UI; Categories → table; Courses → table.
Additive-only, no enum conversion, `active`/`available` booleans stay.

Confirmed facts: `WishlistItem`/`UserAddress` already shipped in M1 — M3's migration is
ONLY Product+Course lifecycle+SEO. Course has NO instructor, NO image/thumbnail field.
`Product.categoryId` onDelete:SetNull, `OrderItem.productId` onDelete:SetNull — bulk/
category delete is safe (no cascade data loss).

## 1. Schema (APPLIED) + public-facing gating (orchestrator, before the 3 streams)

Fields added to both Product and Course: `publishAt DateTime?` + `seoTitleHe/En/Ar` +
`seoDescriptionHe/En/Ar String? @db.Text`, index `@@index([active, publishAt])`.
Visibility predicate: `active: true, OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }]`.

Exact gating points (must all use this predicate):
1. `src/lib/content/get-products.ts` fetchProducts() — covers list + getProductBySlug.
2. `src/lib/content/get-courses.ts` fetchCourses() — covers list.
3. `src/lib/content/get-courses.ts` getCourseBySlug() — separate findUnique, needs its
   own explicit check (not covered by #2's cache).
4. `src/server/actions/shop/create-order.ts` product findMany (~line 62-64) — SECURITY
   CRITICAL, live query, exact-time enforcement (no cache lag tolerance here).
5. `src/server/actions/courses/create-enrollment.ts` course findUnique (~line 54-55) —
   same, reject if publishAt in the future.
Do NOT gate admin queries (drafts/scheduled must stay visible to admin).

Timezone trap: `datetime-local` input has no TZ (Asia/Jerusalem wall-clock); convert
explicitly on write (Jerusalem→UTC) and read (UTC→Jerusalem) — never `new Date(str)`
naively. Cache-lag: catalog list `unstable_cache` 300s revalidate → scheduled item may
appear up to ~5min late; checkout/enrollment (live queries) are exact. Acceptable.

## 2. Products stream (Stream A)

Server actions (`src/server/actions/admin/products.ts`): `bulkSetProductActive(ids,
value)`, `bulkSetProductFeatured(ids, value)`, `bulkDeleteProducts(ids)` — one
updateMany/deleteMany each (not N single actions), `succeeded/failed` from `.count` vs
`ids.length`, one logActivity per bulk op. `duplicateProduct(id)` — copies all
name/desc/price/category/image/order/SEO fields; RESETS: name+"(עותק)", fresh slug,
active=false (draft), publishAt=null, featured=false, stock=0, salePriceAgorot=null.

UI (`products-table.tsx`): checkbox column (native input, not Switch), tri-state
select-all scoped to filtered/visible set, prune selection on filter change. Floating
bar (fixed bottom-6 centered) with 3 ops only (activate/deactivate, feature/unfeature,
delete+ConfirmDialog) — matches ux-spec B2 exactly, no bulk "available". Add
Duplicate+Preview to row-actions dropdown.

SEO/publishAt UI: new SECOND collapsible section "SEO ותזמון פרסום" in
product-edit-sheet.tsx (separate from existing "פרטים נוספים" — 7 more fields would
overload it), datetime-local + helper "מוצג בשעון ישראל".

Preview decision: NO new public route/signed-token. Enabled only for published
products (opens real /shop/[slug]); disabled+tooltip for draft/scheduled. Avoids a new
security surface for a single-image catalog.

SEO consumption (must-wire, else dead columns): generateMetadata in
shop/[slug]/page.tsx uses seoTitle{locale}/seoDescription{locale}, fallback to name/
description.

## 3. Categories stream (Stream B)

No schema change (no image field — explicitly out of scope, would need a migration).
New `categories-table.tsx` replacing `categories-form.tsx`: columns שם/מספר
מוצרים(_count)/פעילה(inline toggle)/סדר(up-down)/פעולות. Edit via Sheet (create+edit,
5 fields). Actions: createCategory, updateCategory, deleteCategory,
duplicateCategory, toggleCategoryActive, reorderCategory(id, "up"|"down") — DELETE the
old delete-by-omission `updateCategories` entirely. Reorder = swap adjacent `order`
values in a $transaction, inline per-stream (not shared — ~12 lines, not worth a
shared helper). No drag-and-drop (would need @dnd-kit + fiddly RTL math for lists of
~20 rows — not worth it for M3).

## 4. Courses stream (Stream C)

New `courses-table.tsx` replacing `courses-form.tsx`: columns שם (+ level·duration
subtitle, since no instructor/thumbnail exists) / מחיר (or "תדמיתי" if priceAgorot
null) / נרשמים / קיבולת / פעילה / סדר / פעולות. Students count = enrollments where
status IN (DEPOSIT_PAID, PAID) — matches the existing "seats taken" definition already
used in get-courses.ts/create-enrollment.ts, not an invented new definition. Edit Sheet
with progressive disclosure (core fields / "תרגומים ותוכן" collapsible / "SEO ותזמון
פרסום" collapsible — course has ~24 editable fields). Same action set as categories
(create/update/delete/duplicate/toggle/reorder), same duplicate semantics (name+"(עותק)",
new slug, active=false, publishAt=null). SEO wired into academy/[slug]/page.tsx metadata.

## 5. Sequencing

Orchestrator-only Phase 0 (done + about to do the gating): schema migration + all 5
public-facing guards, under one reviewer since #4/#5 are security-critical.

Then 3 non-overlapping parallel streams, zero shared-file edits:
- A (Products): server/actions/admin/products.ts, components/admin/products/**,
  lib/admin/product-schema.ts, app/admin/products/page.tsx, get-products.ts SEO
  mapping + shop/[slug]/page.tsx metadata.
- B (Categories): server/actions/admin/categories.ts, lib/admin/category-schema.ts,
  new categories-table.tsx + category-edit-sheet.tsx, app/admin/categories/page.tsx.
- C (Courses): server/actions/admin/courses.ts, lib/admin/courses-schema.ts, new
  courses-table.tsx + course-edit-sheet.tsx, app/admin/courses/page.tsx,
  get-courses.ts SEO mapping + academy/[slug]/page.tsx metadata.

activity-log.ts, confirm-dialog.tsx, table.tsx: read-only imports for all 3, zero
conflict. Explicitly REJECTED: a shared EntityTable/bulk-select abstraction now
(categories/courses differ enough in field sets/semantics that a generic would need
heavy config — two ~150-line siblings beat one over-parameterized component; consistent
with M1/M2 precedent of each screen rolling its own).

## 6. Acceptance criteria
1. Existing rows unaffected (publishAt=NULL, render exactly as before).
2. Scheduling gate: future-publishAt item absent from catalog+detail(404)+un-buyable
   via direct POST; past publishAt = published; active=false always wins.
3. Bulk actions scoped to visible/filtered set, partial-failure toasts, cleared after.
4. Duplicate produces a draft with all resets applied.
5. Preview: real link for published, disabled+tooltip for draft/scheduled.
6. SEO fields actually consumed in generateMetadata (not write-only).
7. publishAt round-trips correctly through the Jerusalem/UTC conversion.
8. Categories: table+counts+toggle+Sheet+duplicate+reorder; old bulk action removed.
9. Courses: table+student-count+Sheet+duplicate+reorder; old bulk action removed.
10. requireAdmin+zod+logActivity on every new action; money stays integer agorot.
11. tsc/lint/test/build green AND a live integration pass (per M1's lesson: static
    checks miss RSC-boundary crashes, theme issues, layout collisions) — load each
    screen live, run a bulk action, a duplicate, a reorder, and verify a future-dated
    publishAt item is actually hidden publicly.

Risk callouts (calibrated to the 3 real bugs M1's integration review caught): timezone
conversion is the single most likely correctness bug (passes typecheck, wrong behavior);
keep Lucide icons imported inside client components, never passed as props from a
Server Component; prune bulk-selection on filter change; compute bulk failed-count from
updateMany/deleteMany's `.count`, don't assume full success.
