# Platform Upgrade — Account Area + Admin Panel (Phases 13-18)

> Master plan for the 2026-07-04 epic: transform the customer account area into a real
> dashboard and upgrade the admin panel toward a Shopify/Stripe-class management platform.
> Orchestrated multi-agent workflow: 4 Opus analysis agents → this plan → parallel Sonnet
> implementation agents per milestone → Opus review agents before each close-out.

## User decisions (locked 2026-07-04)
- **Single admin stays** — no roles/permissions module (re-confirmed; was cancelled in Phase 8.5).
- **Curriculum builder / video hosting — skipped** for now (may revisit).
- **Invoices — deferred** until an Israeli invoicing provider is chosen (existing stub stays).
- **Promotion engine — full, in stages** on one extensible model. Stage A: coupon codes
  (percent/fixed), automatic discounts, free-shipping-above-X, restrictions (min subtotal,
  product/category, expiry, usage limits). Stage B (later): Buy X Get Y, bundles,
  time-window promos, customer-segment rules.
- Out of scope (standing decisions): appointments/booking (external Restyle app), taxes,
  email-template editor, integrations page.

## Current-state audit (Opus agent A, verified line-level)

**Account area** — 4 standalone pages, NO layout/shell, no sidebar/bottom-nav. Dashboard
page is profile-line + 3 nav buttons, hardcoded Hebrew (other account pages use next-intl
properly — namespace inconsistency). Data: orders and enrollments both queried by `userId`
(guest purchases never link retroactively). **No profile editing exists** — `User.name/phone`
are write-once at signup; dashboard reads name from Supabase `user_metadata`, not Prisma.
Account pages use raw dark-theme Tailwind, predating the Phase 8.6 shadcn primitives.

**Admin** — Phase 8.6 shell is solid (sidebar/topbar/mobile-nav, requireAdmin everywhere).
- Dashboard: count-KPIs only; revenue/AOV exist but only on orders/enrollments pages
  (`getOrdersOverview` / `getEnrollmentsOverview`); no customers count, no charts, no
  time-series queries, activity feed not embedded.
- Products: strong inline-edit table (search/filters/sort, inline price/sale/stock cells,
  toggles, edit Sheet). Missing: bulk select+actions, drafts/scheduled publish, SEO fields,
  duplicate, preview link, multi-image (single `imageUrl` string).
- Categories + Courses: still old giant `useFieldArray` bulk forms — most out-of-step
  screens; no product/student counts, no duplicate.
- Orders/Enrollments: KPIs, filters, pagination, guarded status transitions + history.
  Missing: internal notes, send-email, tracking number.
- Inventory: stock health derived at display; inline stock edit logs `product.stock_change`
  activity. Missing: dashboard alerts, per-product history view, reserved-stock concept.
- Notifications: bell = pending counts only, no persistence/read-state.
- Settings: contact info + opening hours only. Shipping fee hardcoded (4000 agorot,
  `DELIVERY_FEE_AGOROT`).
- Activity log: fully built — reference pattern (`ActivityLog` + `logActivity()`).

**UX debt (system-wide):** zero `loading.tsx`/skeletons/Suspense; plain-text empty states;
topbar re-runs `getDashboardStats()` on every admin page load (blocking).

**Reusable blocks:** Pagination, ConfirmDialog, inline-editable cells + toggle cell,
status menus/badges/StatusHistory, overview actions, `logActivity`, upload route +
ImageUploadButton, `unstable_cache` + tag revalidation pattern, form-styles, agorot helpers.

## Analysis reports (full briefs in ./platform-upgrade/)
- **[audit.md](./platform-upgrade/audit.md)** — line-level current-state audit (agent A).
- **[data-model.md](./platform-upgrade/data-model.md)** — Prisma additions for all new
  domains, additive-only, RLS Pattern B for every new table (agent B).
- **[promotion-engine.md](./platform-upgrade/promotion-engine.md)** — money-critical
  evaluation semantics: pure evaluator, largest-remainder line allocation, round-once
  half-up, reserve-at-creation redemption with FOR UPDATE + release-on-failure (agent C).
- **[ux-spec.md](./platform-upgrade/ux-spec.md)** — screen-by-screen UX with Hebrew
  microcopy, RTL rules, empty/loading states (agent D).

## Reconciliation — tech-lead decisions where agents B and C diverged

Agents B and C independently designed the promotions schema. Final authoritative shape:

1. **Two-model split wins (agent B): `Promotion` (the benefit) + `Coupon` (codes) +
   `CouponRedemption`.** Decisive reason: the requirements include *bulk coupon
   generation* — N single-use codes pointing at one benefit. Agent C's single-model
   design (nullable `code` on Promotion) would need N promotion rows for N codes.
   Automatic promotions = `Promotion.automatic = true` with no coupons.
2. **Field names from agent C** (clearer): `percentBp` (basis points, 1000 = 10%),
   `amountAgorot`, `freeShippingMinSubtotalAgorot`. Kind enum: `PromotionKind
   { PERCENT, FIXED_AMOUNT, FREE_SHIPPING }` (+ stage-B members added later).
3. **`appliesTo` enum from agent C** (`SHOP` now, `COURSES` later) — courses excluded
   from Stage A (deposit/balance split makes discount semantics ambiguous).
4. **Usage limits live on `Coupon`** (`usageLimit`, `perCustomerLimit`, `usedCount`) —
   per-code semantics; automatic promotions have no usage counting in Stage A.
   The FOR UPDATE lock is taken on the **coupon** row.
5. **Stage-B dormant fields on `Promotion`** (agent C): `priority`, `stackable`,
   `conditions Json?` (never money in JSON — agent B's rule).
6. **Eligibility restrictions: implicit Prisma M2M relations** on Promotion↔Product /
   Promotion↔Category (agent B) — referential integrity + cascade beat `String[]`.
7. **`appliesToSaleItems Boolean @default(true)`** kept from agent B (common Israeli
   "לא כולל פריטי מבצע" case; evaluator excludes on-sale lines from the base when false).
8. **Order/OrderItem fields from agent C**: `discountAgorot`, `appliedCouponCode`,
   `appliedPromotions Json?` (display snapshot), `freeShipping`, and
   `OrderItem.lineDiscountAgorot` (line-level allocation is mandatory — refunds later).
9. **Everything semantic from agent C is authoritative**: evaluation pipeline, rounding,
   stacking, free-shipping-on-pre-discount-subtotal, reserve-at-creation +
   release-on-terminal-failure, the 28-case vitest plan.
10. **Charts: no new dependency** — hand-rolled monochrome SVG (admin-only, two simple
    charts; full RTL control; dataviz-skill mono guidance).
11. **Orchestration rule for implementation agents**: schema/migration changes are done
    by the orchestrator only (no parallel schema edits); implementation agents NEVER
    touch `src/lib/supabase/server.ts` / `src/middleware.ts` (no auth-bypass hacks in
    agent hands — end-to-end verification is done centrally by the orchestrator).

## Milestones
- **M1 (Phase 13)** — Customer account transformation: `account/layout.tsx` shell (RTL
  sidebar desktop / mobile nav), real dashboard cards, `updateProfile` action (name/phone),
  wishlist (model + heart + page), saved addresses CRUD, i18n normalization of account
  namespace, empty states + skeletons.
- **M2 (Phase 14)** — Admin dashboard v2: revenue/customers/AOV/low-stock KPI row, revenue
  + top-products charts (dataviz skill), embedded latest activity, topbar stats query fix,
  notification center v2 (persisted, read-state).
- **M3 (Phase 15)** — Catalog management: products bulk actions + duplicate + preview +
  SEO/scheduling fields; categories → table with counts; courses → table with student
  counts + duplicate.
- **M4 (Phase 16)** — Promotion engine Stage A + coupons (money-critical: security +
  tranzila-payments skills, dedicated review agent, vitest suite for evaluator).
- **M5 (Phase 17)** — Inventory: InventoryEvent history, create-order + admin hooks,
  low-stock alerts surfacing, adjustment dialog with reason, per-product history drawer.
- **M6 (Phase 18)** — Settings sections (incl. editable shipping fee), system-wide UX
  polish (skeletons/empty states/shortcuts), final Opus review wave + QA close-out.

## Acceptance criteria (master level)
1. Account: new user sees a real dashboard with sensible empty states; existing user sees
   recent orders + active courses; can edit name/phone; wishlist + addresses round-trip.
2. Admin dashboard: revenue/AOV/customers/low-stock KPIs + 2 charts render with real data
   AND with near-empty data without looking broken.
3. Products: bulk select → activate/deactivate/feature/delete works with confirm + toasts;
   duplicate creates a draft copy; scheduled publish works via publishAt.
4. Categories/courses: table views with counts; no more delete-by-omission bulk forms.
5. Coupons: full lifecycle (create → preview in cart → server-side recompute at order
   creation → redemption recorded atomically → usage limits enforced under race).
6. Inventory: every stock change has an InventoryEvent row; low stock surfaces on
   dashboard + bell; history drawer per product.
7. All money stays integer agorot; every new admin action starts with requireAdmin();
   all new tables get RLS-enabled migrations; `tsc`/lint/tests/build green per milestone.
