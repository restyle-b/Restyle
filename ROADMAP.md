# ROADMAP — Restyle 🪒

> **Source of truth for project progress.** Tracks what is done ✅, in progress 🔄, and remaining ⬜.
> **Maintained in English (since 2026-07-03) to save tokens — write ALL future entries in English.**
> The full detailed Hebrew history (2026-06-17 → 2026-07-03, incl. the complete original Session Log) is archived verbatim at [`docs/archive/ROADMAP-hebrew.md`](./docs/archive/ROADMAP-hebrew.md) — consult it only when older detail is needed.

Legend: ✅ done + QA'd · 🔄 in progress · ⬜ not started · ⏸️ blocked/waiting

---

## 🚦 Start here next session — critical!

**Branches:** `main` is the default branch (created 2026-07-01 from what was live in production + Lighthouse a11y fixes). `claude/salon-website-platform-yaa9ya` is historical only — never develop on it. Two open PRs:
- **PR #7** (`academy-phase-7`) — shop (Stage 2), academy commerce (Phase 7), Playwright E2E suite, design-handoff updates, and the full admin redesign (2026-07-03). Not merged.
- **PR #8** (`main-hygiene-a11y-contact`) — a11y/contact/i18n hygiene fixes against `main`. Not merged.

**Database (production Supabase):** all 13 migrations, through `20260703050000_product_inventory_and_activity_log`, are applied and recorded in `_prisma_migrations` with matching checksums (applied directly via the Supabase MCP `apply_migration` tool — the last one, adding `Product.salePriceAgorot/available/featured` + `ActivityLog`, on 2026-07-04, after having been verified only against the isolated local Postgres beforehand: `migrate deploy` clean + `migrate diff` 0 drift). Verified after via direct SQL against `_prisma_migrations` + `information_schema.columns` + `pg_class.relrowsecurity` (RLS on `activity_log` confirmed enabled). **Nothing pending on production anymore.** `prisma migrate` itself cannot reach Supabase from this sandbox (proxy stalls after TCP handshake) — manual/MCP-tool SQL is the standing procedure for any future migration.

**Local test environment:** an isolated PostgreSQL 16 runs at `localhost:5432` (matches `.env.local` `DATABASE_URL`), with a stub `auth` schema so Supabase-dependent migrations apply. Completely separate from production — safe to seed/reset. Used for migration verification and the Playwright E2E suite.

**Other standing facts:** emails go through **Brevo** (not Resend) — contact form + Supabase Auth SMTP, verified end-to-end. Single admin only; role granted manually via `scripts/promote-business-admin.sql` (Phase 8.5 — role-management UI — was explicitly cancelled by the user). Full-repo security review done 2026-06-23 (0 Critical; residual findings in `docs/ARCHITECTURE.md §7.0`). CI runs on every push.

### Open items that require the user:
1. Real images (hero/gallery/academy/about) — placeholders now.
2. Real accessibility-coordinator name on `/accessibility`.
3. Custom domain — blocks email deliverability (Brevo sends from `@outlook.com`, lands in spam on iCloud) and Apple Sign-In.
4. Native-speaker review of en/ar translations (done by Claude).
5. Confirm Vercel Production Branch was switched to `main` (GitHub default already switched).
6. Merge/review PRs #7 and #8; run the pending PR-#7 migrations on Supabase at merge time.
7. Tranzila: real (sandbox) credentials when ready; `ALLOW_MOCK_CHECKOUT=true` on a preview env to exercise the mock payment flow.

### Session-open checklist:
1. `git status` / `git log -1` — confirm branch vs `origin/main` (or the open feature branch).
2. `npx tsc --noEmit && npm run lint && npm test && npm run build` — green before touching anything.
3. Read the latest Session Log entry at the bottom of this file.
4. If `.env.local` is missing in a fresh container — ask the user to re-enter it per `docs/SETUP.md`.

---

## Vision
Premium barbershop website (menspire.com inspiration). Priorities re-ordered 2026-06-18: the base deliverable is a **marketing site only** (no shop, no user accounts); shop, secure account area, academy commerce, order management, admin and payments are the **optional extension** — activated only when the client chooses it (alternatives compared in [`docs/QUOTE.md`](./docs/QUOTE.md)). The extension **was explicitly approved** by the user on 2026-07-01 (shop) and 2026-07-02 (academy commerce) and is now built.

## Current status summary
- **Base track (marketing site):** complete — home, about, gallery, contact (+form), locations, accessibility widget + statement, privacy/terms, i18n (he/en/ar), SEO, security hardening (4 pentest rounds), Lighthouse pass. Waiting only on user-provided assets (images, domain, coordinator name).
- **Extension track:** shop + checkout + orders (Stage 2), academy course purchases with deposit/balance (Phase 7), and full admin panel — all implemented on `academy-phase-7`/PR #7, awaiting merge + production migrations.
- **Tests:** typecheck + lint + unit (Vitest) + build green; Playwright E2E suite (9 tests: i18n ×3 locales, guest checkout, course enrollment) green.

---

## Phase 0 — Planning & infrastructure ✅
Stack (Next.js 15/TS/Tailwind/Prisma/Supabase/Vercel), architecture doc, CLAUDE.md, skills (planning/development/qa/security/tranzila-payments/ui-ux), this roadmap.

## Phase 1 — Scaffolding ✅
Next.js 15 + TS strict + Tailwind v4, RTL/Hebrew fonts, ESLint/Prettier, Prisma + `lib/env.ts` (zod) + `lib/db.ts`, Vitest, base layout + design tokens, CI (GitHub Actions), Supabase connected (all early migrations applied manually in SQL Editor), Playwright skeleton (2026-07-02: `playwright.config.ts` + 3 spec files, local webServer on port 3100).

## Phase 2 — Marketing site ✅ (except user-asset items)
Home (hero + all sections), about, gallery, contact (zod + honeypot + server action), locations, SEO (metadata/sitemap/robots). ⬜ Remaining: OG images + final a11y pass — blocked on real images.

## Phase 3 — Auth & account area (extension) ✅ (code)
Supabase Auth (`@supabase/ssr`), middleware protection for `/account`, login/register/forgot/reset/account pages, `auth.callback` route, `handle_new_user` trigger + RLS migration (applied in production 2026-06-23). Security fixes: open-redirect via `?next=` (`safeRedirectPath`), signup honeypot, `prevent_role_change` trigger. Auth pages are deliberately Hebrew-only.

## Stage 2 — Full shop (Phases 4+5+6 combined, approved 2026-07-01) ✅
Plan: [`docs/features/shop.md`](./docs/features/shop.md). Branch `shop-phase-4-5-6` → PR #6.
- ✅ Schema+migrations: Product/Category/Order/OrderItem/Payment + RLS + seed (8 products, 3 categories).
- ✅ Public catalog `/shop`, `/shop/[slug]`; client-side cart (Context+localStorage); checkout with server-side price calculation (`create-order.ts` — client sends only `{productId, quantity}[]`).
- ✅ `PaymentProvider` interface + MockProvider (+ `/checkout/mock-pay`, fail-closed via `ALLOW_MOCK_CHECKOUT`) + TranzilaProvider skeleton (per `tranzila-payments` skill; no real credentials yet); idempotent `handle-payment-result.ts` — stock decremented only on verified payment, amount verified, Brevo confirmation email best-effort.
- ✅ Order history `/account/orders` + guest lookup (`orderNumber` + `guestLookupToken`, generic errors, rate-limited); admin CRUD for products/categories + admin order management with explicit status-transition allow-list; webhook route with `x-webhook-secret` (timingSafeEqual).
- ✅ Security review (3 Low found+fixed) + QA. Money is always integer agorot.
- Decisions: stock decrements only on verified payment; only payment-confirmation email; **tax invoices explicitly deferred** (user has no registered business number yet; invoice provider TBD — placeholder shown in admin as of 2026-07-03).

## Phase 7 — Academy course purchases (approved 2026-07-02) ✅
Branch `academy-phase-7` → PR #7. Deposit = per-course percentage (default 20%); online balance payment; guest+logged-in enrollment; seat capacity. Dedicated `Enrollment`+`CoursePayment` models (shop handler enforces amount==total; enrollment handler verifies against the **specific** payment amount). Course page `/academy/[slug]` (syllabus/details/price/deposit/seats), enroll+pay flow, balance payment with double-charge guard, `/courses/lookup`, `/account/courses`, admin `/admin/enrollments`, webhook routing extended. Migration `20260702000000_academy_commerce` applied on production Supabase + real course prices seeded. ⬜ user-dependent: `ALLOW_MOCK_CHECKOUT` on preview; Tranzila credentials; course content access (video/lessons) is a separate future phase.

## Phase 8 — Admin CMS ✅ (redesigned 2026-07-03)
All content manageable at `/admin` (fixed Hebrew RTL, outside `[locale]`): site settings + opening hours, courses, testimonials, gallery, marketing/legal text blocks (`ContentBlock` merged into next-intl messages in `i18n/request.ts`), products/categories, orders, enrollments. Multilingual fields: Hebrew required, en/ar optional with fallback. `requireAdmin()` (session + role, fail-closed) in layout and in every action. **2026-07-03 redesign:** grouped nav with active state; real dashboard (stats + pending counts); two-step confirm before row deletion; shared form styles; breadcrumbs on nested pages; orders/enrollments search + pagination (previously hard-capped at latest 100 — real bug); `SiteSettings` and `OpeningHour` finally wired to the public site (were dead CRUD); opening hours reduced to locale-neutral `openTime/closeTime/closed` (day names derived via `Intl.DateTimeFormat`); **"Services" feature deleted entirely** (DB + admin + public page + nav) at user request. Phase 8.5 (role management UI) cancelled — single admin via SQL script.

## Phase 8.6 — Admin panel premium redesign ✅
Plan: [`docs/features/admin-redesign.md`](./docs/features/admin-redesign.md). Full rethink (user request 2026-07-03, explicit "do not simply restyle") — SaaS-dashboard-grade (Shopify/Stripe/Linear/Vercel reference), on `academy-phase-7`/PR #7. Key decisions: `Product` gets 3 new independent columns (`salePriceAgorot`, `available`, `featured` — visibility/availability/stock kept as separate axes, also wired into the public shop + `create-order.ts` pricing so they're not cosmetic-only); new cross-entity `ActivityLog` model (append-only audit trail, written alongside the existing `OrderStatusEvent`/`EnrollmentStatusEvent` rather than replacing them); adopted shadcn/ui primitives properly (Badge/Card/Table/Sheet/DropdownMenu/Dialog/Switch/Tooltip/`sonner` toasts — only `Button` existed before); products admin dropped the "submit the whole array, delete whatever's missing" pattern for granular per-field server actions (this was a real latent bug: any row omitted from a resubmit was silently deleted).
- ✅ A — Foundations: sidebar (grouped, collapses to a Sheet on mobile) + topbar (notifications bell w/ pending counts, profile menu) replacing the old single-row header nav; new `src/components/ui/*` primitives; new overlay motion in `globals.css` (data-state-driven, no plugin, respects the existing global `prefers-reduced-motion`).
- ✅ B — Data model: migration `20260703050000_product_inventory_and_activity_log`, verified via `migrate deploy` (13 migrations clean) + `migrate diff` (0 drift) on the isolated local Postgres.
- ✅ C — Products & Inventory: `createProduct`/`updateProductDetails`/`deleteProduct`/`updateProductPrice`/`updateProductSalePrice`/`updateProductStock`/`toggle{Active,Available,Featured}` (each `requireAdmin()`+zod+`ActivityLog`); inline-editable table with stock-health badges (derived, not stored), quick-add Sheet with progressive disclosure, client-side filter/sort/search. Fixed incidentally: `getProducts()` had no tiebreaker on `order` (ties — the default for every new product — sorted non-deterministically between refreshes).
- ✅ D — Orders: stat cards (`getOrdersOverview`), payment-status filter, expandable rows (items/address/timeline) replacing flat link-cards, compact `OrderStatusMenu` (allowed transitions only, `CANCELLED` behind a confirm `Dialog`).
- ✅ E — Course Registrations: identical treatment to D (`getEnrollmentsOverview`, `EnrollmentRow`, `EnrollmentStatusMenu`).
- ✅ F — Activity/History: new `/admin/activity`, unified timeline (icon per entity type, actor, relative time), entity-type filter + search + pagination. `logActivity()` wired into all remaining bulk admin actions (courses/testimonials/gallery/categories/content/site-settings) so every meaningful admin write is now covered from one source.
- ✅ G — Polish + security + QA: `security` skill review (0 Critical/High; added an explicit `z.boolean()` runtime check on the three toggle actions as defense-in-depth, since TS types alone don't guard a direct server-action call); removed `backdrop-blur` from the Sheet/Dialog overlay (harmless simplification, not a fix for anything — a screenshot artifact during testing turned out to be a headless-Chromium quirk with non-fullPage captures at narrow viewports, not a real rendering bug, confirmed by inspecting raw pixel data and by a working `fullPage` capture of the same state). `docs/ARCHITECTURE.md` §5.2 documents the redesign's architectural decisions. Verified end-to-end throughout (not just typecheck) against an isolated local Postgres + a temporary local-only auth bypass (reverted before every commit, confirmed via `git diff` each time) — real DB writes, real toasts, real activity-log entries, mobile nav Sheet confirmed working via `fullPage` screenshot. `npx tsc --noEmit && npm run lint && npm test && npm run build` all green throughout.

**Still pending (user-dependent, same as the rest of PR #7):** production Supabase migration not yet run — `20260703050000_product_inventory_and_activity_log` joins the other pending PR-#7 migrations, all applied together at merge time (see "Start here next session" above).

## Phase 9 — Restyle app link (booking) ✅
No booking system on the site — "Book now" CTAs deep-link to the Restyle app (`BookingLink`: Android→Google Play, else App Store), URLs now editable via admin SiteSettings.

## Phase 12 — Admin shortcut in the account area ✅
User request: show an "Admin Panel" shortcut on `/account` for admins only, convenience-only (not a security boundary). New `src/lib/auth/current-user.ts` — `getCurrentUser()`, a non-redirecting sibling to `requireAdmin()` (same Supabase-session → Prisma-role lookup pattern, reused rather than duplicated) — used by `account/page.tsx` to conditionally render a `ShieldCheck`-icon `Link` to `/admin` (styled with the existing `buttonVariants({variant:"outline"})`, matching the "My courses" button). Caught and fixed one real bug while building: used the i18n-aware `Link` from `@/i18n/navigation` at first, which would have prefixed `/admin` with the locale (e.g. `/en/admin`) — `/admin` lives outside `[locale]` (see `middleware.ts` `NON_LOCALIZED_PREFIXES`), so switched to plain `next/link`. `security` skill review: 0 Critical/High — role check is server-rendered only (no client-side bypass surface), scoped to the caller's own session (no IDOR), and `/admin` access stays fully gated by the untouched `requireAdmin()` + middleware regardless of the button. Verified visually against local Postgres with two seeded test users (ADMIN/USER): admin sees the button, regular user doesn't, and a regular user hitting `/admin` directly still gets redirected away by `requireAdmin()`. All gates green.

## Phase 11 — PWA (two separate installable apps) ✅
Plan: [`docs/features/pwa.md`](./docs/features/pwa.md). User request 2026-07-03: PWA for both the public site and the admin panel. Since `[locale]` and `admin` are two independent `<html>` trees (no shared root `layout.tsx`), these are two separate installed apps, not one PWA with modes — separate manifest, icons, and service worker each, on purpose. Key decisions: static `public/*.webmanifest` files (not `app/manifest.ts` — nested-segment support for that convention isn't confirmed, and a leaked manifest between the two apps is a real risk not worth the convenience); `serwist`/`@serwist/next` for the service workers rather than hand-rolled fetch routing (this site has auth/payments/admin — a caching bug here is a security/correctness risk, and a declarative per-route-pattern config is easier to audit than manual `if` branches); strict `NetworkOnly` for `/cart`, `/checkout*`, `/account/*`, `/courses/*`, `/api/*`, `/auth/*`, and all of `/admin/*` (never cached), `NetworkFirst` for `/shop*` (real prices), `StaleWhileRevalidate` for static marketing pages, `CacheFirst` only for immutable `/_next/static/*` assets. Admin icon set is color-inverted from the public one so the two installed apps are visually distinguishable on a home screen/task switcher.
- ✅ Group 1 — Icons + manifests (Playwright-rendered from the existing `icon.svg` mark; `metadata.manifest` wired per layout; iOS meta tags)
- ✅ Group 2 — Service workers (serwist config, two SWs with distinct scopes, registration per layout, CSP `worker-src`/`manifest-src`); real bug found+fixed along the way: next-intl's middleware was 404-ing `/sw.js`/`*.webmanifest` (not in its static-file exclusion list), fixed via the middleware matcher.
- ✅ Group 3 — `security` skill review found 2 real gaps, both fixed before close-out: (1) **High** — `/courses/success` and `/courses/cancel` are `force-dynamic` pages that render live enrollment status/number and payment balance from the DB, but weren't in the never-cache list, so they fell through to the broad marketing-pages `StaleWhileRevalidate` rule — meaning payment/PII data would land in Cache Storage on a shared device, the exact risk `/cart`/`/checkout`/`/account` were already excluded for. Fixed by adding `courses` to the never-cache path list in `src/app/sw.ts`. (2) **Medium** — the middleware's static-asset bypass matched by file extension anywhere in the URL (`.*\.(?:svg|png|...)$`), which would have silently skipped the session check for any *future* `/admin/*` or `/account/*` route ending in one of those extensions (an image proxy, a CSV/XML export), leaving only the in-handler `requireAdmin()` layer standing — a defense-in-depth regression. Fixed by scoping the bypass to the actual static paths (`icons/`, `images/`, named root files) instead of a global extension match. Both fixes re-verified: full quality gates green (`tsc` incl. worker tsconfig, lint, `npm test`), and a live dev-server curl pass confirming all static assets (`robots.txt`, `sitemap.xml`, `*.webmanifest`, `icons/*`, `images/*`, `icon.svg`) still resolve 200 and `/admin`+`/account` still redirect to `/login` without a session.

## Phases 13-18 — Platform upgrade: account area + admin (epic) 🔄 resumed 2026-07-04
Resumed same day as the pause. Schema migration for wishlist+addresses applied
(production + local-verified, 0 drift). M1 and M2 both implemented by parallel Sonnet
agents in isolated worktrees, each reviewed line-by-line by the orchestrator before
merge (diff scoped exactly to its brief, tsc/lint/test/build re-verified independently,
plus live Playwright verification against the local DB for M1). Both fast-forward
merged and pushed.
Master plan: [`docs/features/platform-upgrade.md`](./docs/features/platform-upgrade.md)
(+ 4 analysis briefs in `docs/features/platform-upgrade/`). User request 2026-07-04:
Shopify/Stripe-class management experience, mandated multi-agent workflow (4 Opus
analysis agents done → parallel Sonnet implementation per milestone → Opus review wave).
Locked decisions: single admin stays; curriculum/video skipped; invoices deferred;
promotion engine full-but-staged (A: coupons+percent/fixed+free-shipping; B: BXGY/
bundles/time-based later).
- ✅ **Phase 13 (M1)** — Account transformation: new `account/layout.tsx` consolidating
  the auth-redirect that was duplicated across 4 pages, RTL sidebar (desktop, `border-s`
  opposite of admin's `border-e` — content is DOM-first for a11y, nav visually first via
  `order-*`) + 5-tab mobile bottom bar with a "עוד" overflow `Sheet`, full `account` i18n
  namespace (he/en/ar). Dashboard rebuilt as independently-`Suspense`-streamed cards
  (recent orders, profile-completion nudge, courses, quick actions, wishlist preview,
  recommended/recently-viewed rails) with every empty state per spec. `updateProfile`
  action + `/account/profile` (name/phone editable, email read-only, links to the
  existing reset-password flow — no new password UI). Wishlist: idempotent DB-truth
  toggle (`WishlistItem`, race-safe via P2002) + heart button on `ProductCard` +
  `/account/wishlist` with optimistic remove/undo. Address book: full CRUD, single-default
  invariant enforced transactionally against the partial-unique index, IDOR-guarded
  (every mutation re-checks `existing.userId !== userId`, same pattern as order-detail
  ownership). **Orchestrator integration review caught 3 real bugs the agent's own
  tsc/lint/test/build pass couldn't** (live Playwright verification against the local DB
  is what surfaced them): (1) **crash** — the server layout passed bare Lucide icon
  *component references* as a prop into a `"use client"` nav component; React rejects
  unrendered function/forwardRef values crossing the Server→Client boundary
  ("Functions cannot be passed directly to Client Components") — `/account` 500'd in
  a live run despite type-checking fine. Fixed by moving the href→icon map into the
  client component itself (matching the existing admin sidebar-nav pattern), passing
  only strings down. (2) **day-theme contrast** — the shared `Card` primitive
  (`bg-ink-soft/60`) and two dashboard cards' inner rows (`bg-ink/40`) use
  opacity-modified token variants that the site's `[data-theme="day"]` override rules
  didn't cover (only the non-opacity class was themed) — `Card` was built for the
  always-dark admin panel and M1 is its first consumer under the theme-aware public
  site, so this never surfaced before. Added the missing day-mode overrides. (3)
  **mobile layout collision** — the new fixed bottom tab bar overlapped the site's
  pre-existing floating WhatsApp/phone/accessibility buttons (measured via real bounding
  boxes, not visible in a static screenshot) — added a stable `data-account-mobile-nav`
  attribute + a `:has()` CSS rule (media-matched to the `md:hidden` breakpoint) that
  raises the floating buttons only when the account tab bar is actually in the DOM,
  with zero changes to the site-wide (Server Component) floating-contact component.
  Also completed the `ConfirmDialog` promotion to `components/ui/` that the agent had
  deliberately left as a flagged temporary duplicate (couldn't touch `admin/**` while
  a sibling agent worked there in parallel) — deleted the admin copy, repointed its 3
  importers. `tsc`/lint/34 tests/production build all green after every fix; live
  end-to-end address creation verified against the local DB (day/night, RTL/EN,
  desktop/mobile).
- ✅ **Phase 14 (M2)** — Admin dashboard v2: `getDashboardOverview()` (today/7d/30d
  revenue with prior-period delta, AOV, customers count, low-stock count, 30-day daily
  series, top-5 products) built on pure/tested helpers (`dashboard-metrics.ts`,
  25 vitest cases) layered over the existing `getOrdersOverview`-style revenue
  definition (extracted to a shared `NON_REVENUE_ORDER_STATUSES` constant instead of
  duplicating it). Two hand-rolled monochrome SVG charts — revenue bars (own
  `overflow-x-auto`, page body never scrolls) and top-products horizontal bars anchored
  to the RTL-correct right edge regardless of DOM direction — both with the "little/zero
  data" states specced (never looks broken on a near-empty shop). Activity feed embedded
  via the existing `ActivityTimeline` (`limit` param added, no parallel query). Topbar's
  per-navigation query lightened to a 2-count `getTopbarAlertCounts()` instead of the
  full heavy aggregator. Notification-center persistence deferred to its own migration
  (M5/M6) as planned — bell untouched. `tsc`/lint/25 tests/production build all green.
- ✅ **Phase 15 (M3)** — Catalog: products bulk actions (activate/deactivate/feature/
  delete) + duplicate + preview + SEO/publishAt (Asia/Jerusalem⇄UTC helper, DST-safe);
  categories + courses converted from single-form editors to table views with granular
  server actions (create/update/delete/duplicate/toggle/reorder), counts (`_count`),
  and their own SEO/publishAt Sheets. All 3 streams built in parallel Sonnet worktrees,
  reviewed and merged individually (tsc/lint/test/build green at each step, plus a
  final integration check after all three landed).
- ⬜ **Phase 16 (M4)** — Promotion engine Stage A + coupons (reserve-at-creation,
  FOR UPDATE, release-on-failure; 28-case evaluator vitest suite; security +
  tranzila-payments skills mandatory). Schema shipped (migration
  `20260704020000_promotions_and_coupons`: Promotion+Coupon+CouponRedemption,
  RLS Pattern B); evaluator/admin CRUD/checkout integration not yet built.
- ⬜ **Phase 17 (M5)** — Inventory: InventoryEvent ledger, low-stock alerts everywhere,
  adjustment dialog, per-product history drawer.
- ⬜ **Phase 18 (M6)** — Settings tabs (incl. editable shipping fee), UX polish pass,
  final Opus review wave (architecture/security/a11y/responsive/performance) + QA.

## Stages 1/1.1/1.2 — Marketing completion ✅
Accessibility widget + `/accessibility` statement (IS 5568 / WCAG 2.0 AA), `/academy` content page, `/locations`, quick-contact buttons (floating WhatsApp/phone + Waze/tel/WhatsApp rows, `contact-links.ts` single source), `/privacy` + `/terms`, favicon, real brand logo asset, Brevo email verified in production, Lighthouse pass (a11y/BP 100, perf 88-95, SEO 100 after `force-static` fix on 6 pages).

## Stage 2 (earlier) — i18n (he/en/ar) ✅
`next-intl`, Hebrew default without prefix, `/en` + `/ar`, RTL/LTR handling, LocaleSwitcher, per-locale sitemap with hreflang, E2E-verified. Note: en/ar translations were machine-written — native review pending (user item). Known residual bug: `about`/`accessibility` still use sync `useTranslations()` with `force-static` → body renders Hebrew on /en `/ar` (all other affected pages were converted to async 2026-07-03).

## Phase 10 — Hardening & launch ⬜
- ⬜ Final comprehensive security pass + rate-limit upgrade (Vercel KV) + Next 16 migration
- ⬜ Performance/a11y/E2E final sweep with real images
- ⬜ Backups, monitoring, logging
- ⬜ Domain + production deploy sign-off

---

## Session Log

> Entries before 2026-07-03 are in [`docs/archive/ROADMAP-hebrew.md`](./docs/archive/ROADMAP-hebrew.md) (Hebrew, verbatim). Write new entries in English, most recent last.

| Date | What was done | Next |
|------|----------------|------|
| 2026-07-02 | Playwright E2E infrastructure on `academy-phase-7`: config + isolated local Postgres 16 (stub `auth` schema so all migrations apply), seeded e2e rows, 3 specs (i18n ×3 locales / guest checkout / course enrollment with deposit) — 9/9 green. `ALLOW_MOCK_CHECKOUT` only in the test webServer env. | Merge PR #7 per user. |
| 2026-07-03 | Design-handoff implementation (from Claude Design export): locations page hours block + live "open now" badge + 4 quick-contact tiles; asymmetric testimonials layout on home (lead quote + 2 side quotes, new optional `role` field on Testimonial + migration); Instagram CTA on gallery (real handle `@avraham.hairartist`). Found+fixed pre-existing i18n bug (force-static + sync hooks renders Hebrew on en/ar) on `locations`. All gates + Playwright green. | Fix same i18n bug on about/accessibility later. |
| 2026-07-03 | **Admin redesign, 5 groups** (each committed+pushed separately to PR #7): (0) deleted "Services" feature entirely; (1) OpeningHour simplified to locale-neutral fields, single source of truth for home/locations/OpenNowBadge, admin form 42→21 inputs; (2) SiteSettings wired to the public site (was 100% dead CRUD) — contact details/Instagram/app links now DB-driven with `siteConfig` fallback, converted remaining force-static pages to async (fixing the i18n bug on contact/privacy/terms); (3) grouped admin nav + real dashboard + two-step delete confirmation + breadcrumbs + shared form styles; (4) orders/enrollments search + pagination (fixed real bug: rows beyond latest 100 were unreachable). `facebookUrl` left unwired and `Course.level*` left trilingual — both per explicit user decision. All gates green; Playwright 9/9 after removing deleted `/services` from the i18n spec. Migrations pending on production Supabase (run at PR-#7 merge). | Continue with next user request. |
| 2026-07-03 | **ROADMAP switched to English + admin comfort round 2** (user request). (a) ROADMAP rewritten in English, Hebrew history archived at `docs/archive/ROADMAP-hebrew.md`, rule anchored in CLAUDE.md. (b) **Slugs removed from admin entirely** — auto-generated server-side (`lib/admin/slug.ts`), row identity switched from slug to id in products/categories/courses actions (delete-first transaction so new rows survive), existing slugs stay stable. (c) **Image upload from device** — `/api/admin/upload` (admin-only 401/403, magic-byte sniffing not declared Content-Type, 5MB cap, random filenames) → Supabase Storage public bucket `site-images` (auto-created on first use); upload button in gallery+products forms, URL paste kept as fallback. Live upload NOT testable in this sandbox (`.env.local` has dummy Supabase URL) — verify once on Vercel preview. (d) **Status history** — new `OrderStatusEvent`/`EnrollmentStatusEvent` models (migration `20260703040000_status_events`, pending on production Supabase like the other PR-#7 migrations): every transition recorded (system/payment/admin-email) and shown to the admin (detail-page timelines) and to the client (order detail in account + guest lookup). Verified end-to-end via the E2E flows against local DB. (e) **Dashboard** — orders & enrollments count breakdown per status (each row links to the filtered list) + totals tiles. (f) Admin order detail now shows payment method in Hebrew + an "invoice — coming later" placeholder (invoice provider TBD per user decision). Opus subagent did the slug work; Sonnet translation agent hit the monthly spend limit so translation was done in-session. All gates + Playwright 9/9 green; local `migrate diff` clean. | Run PR-#7 migrations on Supabase at merge; verify image upload on preview. |
| 2026-07-03 | **Three separate user requests, one session.** (1) Applied the 4 pending PR-#7 migrations (`testimonial_role`/`drop_services`/`opening_hours_restructure`/`status_events`) directly to **production** Supabase via the MCP `apply_migration` tool, after first catching and resolving a real discrepancy — the uploaded migration file claimed to be "PR #7" but PR #7's description described unrelated academy-commerce work; verified against the actual `academy-phase-7` branch (which had evolved past its original PR description) before applying, checksums matched exactly. (2) Added add-to-cart + inline quantity stepper directly on shop product cards (`ProductCardCartControl`, sits outside the card's own `Link` so clicks don't navigate) — verified live in browser against a seeded local product catalog. (3) **Phase 8.6 — full admin panel premium redesign** (this session's main task, see Phase 8.6 above for the complete breakdown): 7 groups (A–G), each committed+pushed separately — shell/primitives, data model, Products & Inventory (inline editing), Orders, Course Registrations, Activity/History, polish+security+QA. New verification method established this session and reused across every group: an isolated local Postgres (already used for E2E) plus a **temporary, never-committed** bypass of `requireAdmin()`/middleware auth-check (reverted via `git checkout` — confirmed clean via `git diff` — before every single commit) lets real server actions be exercised end-to-end with Playwright screenshots instead of stopping at typecheck. Caught and fixed one real latent bug (`getProducts()` ordering had no tiebreaker) and one real gap (new `available`/`salePriceAgorot` product fields would have been cosmetic-only without wiring into the public shop + `create-order.ts` pricing — fixed). `security` skill review: 0 Critical/High; added one defense-in-depth fix (runtime `z.boolean()` check on the three toggle actions). All gates (`tsc`/`lint`/`test`/`build`) green throughout. | Run all 5 pending PR-#7 migrations (including today's `product_inventory_and_activity_log`) on production Supabase at merge time; merge/review PR #7. |
| 2026-07-04 | **Phase 11 — PWA, both apps, 3 groups** (user request: "make pwa for the website and for the admin"). Two independent installable apps from one codebase, since `[locale]` and `admin` are separate `<html>` trees: (1) icons (Playwright-rendered from `icon.svg`, admin set color-inverted for home-screen distinguishability) + two static `public/*.webmanifest` files wired via `metadata.manifest`. (2) `serwist`/`@serwist/next` service worker — one compiled `src/app/sw.ts`, registered twice at different scopes (`register:false` + manual `RegisterServiceWorker` per layout), runtime-branches caching strategy off `self.registration.scope` since Cache Storage is origin- not scope-scoped; admin scope is `NetworkOnly` for everything, public scope is `NetworkOnly` for cart/checkout/account/api/auth, `NetworkFirst` for `/shop*`, `StaleWhileRevalidate` for marketing pages. Found+fixed a real bug along the way: next-intl's middleware was 404-ing `/sw.js`/`*.webmanifest` (missing from its static-file exclusion). (3) `security` skill review before close-out found and fixed 2 real gaps that the empirical Playwright pass (which only checked cart/checkout/account/offline) had missed: **High** — `/courses/success`+`/courses/cancel` (force-dynamic, render live enrollment status + payment balance from the DB) weren't in the never-cache list, so they'd have been cached via the broad marketing-pages rule, same PII-in-Cache-Storage risk cart/checkout/account were excluded for — fixed by adding `courses` to the never-cache path list. **Medium** — the middleware's static-asset bypass matched by file extension anywhere in the URL, which would have silently skipped the session check for any future `/admin/*`/`/account/*` route ending in one of those extensions — fixed by scoping the bypass to actual static paths (`icons/`, `images/`, named root files) instead. Re-verified after both fixes: full gates green + live dev-server curl pass (all static assets still 200, `/admin`+`/account` still redirect to `/login`). Known accepted non-security tradeoff (documented, not fixed): the one compiled SW's precache manifest includes both apps' static JS/CSS chunks — architecturally imperfect but not a data-exposure concern (static code only). | Merge/review PR #7 (now includes Phase 11). |
| 2026-07-04 | **Two follow-up requests, one session.** (1) User reported "admin login isn't working" on the Vercel preview. Investigation: production `users` table showed the user's own account (`haim_indyk@icloud.com`) is `role='USER'` (not the bug — by design, only the business account is `ADMIN`), but the actual `restyle.barbershop@outlook.com` admin account ALSO failed — sign-in succeeded (middleware confirmed a valid session, `GET /admin 200` not `307`, per Vercel runtime logs) yet the browser bounced back to `/login`, with a burst of marketing-page prefetches after each attempt and eventual full session loss (`/account` started 307-ing). Root cause: `LoginForm` used `router.push(next)` immediately followed by `router.refresh()` — `next` can point at `/admin`, a completely separate root `<html>` tree from `/login` ([locale] vs admin), and that client-router combo doesn't reliably survive crossing root layouts. Fixed by switching to a hard `window.location.href` navigation, guaranteeing a fresh top-level request through the middleware. Could not reproduce the exact failure on localhost (Vercel's Edge/Serverless split + real network timing aren't replicable there), but verified the new code completes the full login→admin path correctly with a local test admin account; all gates green. (2) User asked to run the migrations discussed earlier — confirmed via `_prisma_migrations` that only `20260703050000_product_inventory_and_activity_log` was still missing (the other 4 from the previous session were already in and checksum-matched), applied it via the MCP `apply_migration` tool with a matching `_prisma_migrations` row (checksum computed from the actual migration file), verified column types/defaults on `products` and RLS-enabled on `activity_log` directly via SQL. Production is now fully caught up — 13/13 migrations applied. | Merge/review PR #7; watch for admin-login confirmation from the user. |
| 2026-07-04 | **Phase 12 — admin shortcut on `/account`** (user request, see Phase 12 above). New `getCurrentUser()` helper reused across the account page instead of duplicating `requireAdmin()`'s role-lookup pattern; conditional `ShieldCheck` + "Admin Panel" `Link` to `/admin`, admin-only. Caught+fixed a real bug while building it: initially used the i18n `Link` (would've produced `/en/admin`, a 404 — `/admin` is outside `[locale]`), swapped for plain `next/link`. `security` skill review: 0 Critical/High (server-rendered check only, no IDOR, `/admin` access still fully gated by the unmodified `requireAdmin()`+middleware). Verified visually with two local seeded test users (ADMIN sees the button, USER doesn't, USER hitting `/admin` directly still gets redirected). All gates green. | Merge/review PR #7 (now includes Phase 12 too). |
| 2026-07-04 | **Phases 13-18 planning (platform-upgrade epic) — analysis completed, then PAUSED by user before implementation.** User requested a Shopify/Stripe-class redesign of account+admin with a mandated multi-agent workflow. Done: (1) scope locked via user answers — single admin stays, curriculum/video skipped, invoices deferred, promotion engine full-but-staged; (2) 4 Opus analysis agents ran in parallel; full reports persisted as implementation briefs in `docs/features/platform-upgrade/`: audit.md (headline gaps: no account shell, no profile-edit action anywhere, categories/courses still giant bulk forms, zero loading states app-wide, topbar re-runs stats every page), data-model.md (additive-only migrations: wishlist/addresses/inventory-ledger/notifications/lifecycle+SEO, all new tables RLS-private), promotion-engine.md (pure evaluator, round-once half-up, largest-remainder allocation, reserve-at-creation + FOR UPDATE + release-on-failure; critical finding: create-order has NO transaction today), ux-spec.md (Hebrew microcopy, bottom tab bar, mono SVG charts, bulk-actions bar, settings tabs); (3) B-vs-C schema conflicts reconciled in the master doc (Promotion+Coupon two-model split for bulk codes, C's semantics authoritative, no chart lib, schema orchestrator-only); (4) ROADMAP Phases 13-18 added. **No implementation code written.** | Resume at Phase 13 (M1): wishlist+addresses migration first, then parallel M1 account-shell + M2 admin-dashboard Sonnet agents (see ⏸️ Phases 13-18 pointer). |
| 2026-07-04 | **Platform-upgrade epic resumed: M1+M2 built, reviewed, merged.** Applied the wishlist+addresses migration (production+local, 0 drift), then ran M1 (account area) and M2 (admin dashboard) as parallel Sonnet agents in isolated git worktrees per the epic's mandated multi-agent workflow. Reviewed both diffs personally before merging — scoped exactly to each brief, no schema/auth files touched by either agent. M2 merged clean on first pass. M1's own gates (tsc/lint/test/build) were green but **live Playwright verification against the local DB caught 3 real bugs invisible to static checks**: a Server→Client RSC boundary crash (bare Lucide icon component passed as a prop — 500 in a live run despite type-checking fine), a day-theme contrast gap on the shared `Card` primitive (its first consumer under the theme-aware public site, having been built for the always-dark admin), and a mobile layout collision between the new bottom tab bar and pre-existing floating contact/accessibility buttons (only visible via measured bounding boxes, not a screenshot). All three fixed, re-verified, and the flagged `ConfirmDialog` duplication was completed as a proper promotion to `components/ui/`. Both worktrees fast-forward merged and pushed; worktrees cleaned up. | Continue with Phase 15 (M3, catalog management) — needs the product/course lifecycle+SEO migration first (data-model.md item 1, not yet applied). |
| 2026-07-06 | **M3 (Phase 15, catalog management) finished — 3 parallel Sonnet streams, all merged.** Per user's "do everything, each with an agent sized to fit" instruction: applied the product/course lifecycle+SEO migration (`publishAt`+6 SEO columns each, additive, RLS untouched) to local+production first, then wired the new `publishAt` gate into every public consumption path (`get-products.ts`, `get-courses.ts`, `create-order.ts`, `create-enrollment.ts` — scheduled/draft items now correctly excluded from storefront listings and direct-purchase attempts, closing a gap where a scheduled product/course could otherwise be bought before its `publishAt`). Then an Opus agent produced a consolidated M3 implementation brief (`docs/features/platform-upgrade/m3-catalog-plan.md`) and 3 Sonnet agents built Products (bulk activate/deactivate/feature/delete + duplicate + preview + SEO/publishAt Sheet section), Categories (table+Sheet replacing the old single giant form, granular CRUD+reorder actions), and Courses (same table+Sheet conversion, Jerusalem⇄UTC `publishAt` helper, DST-verified) in 3 isolated worktrees, each self-verified via tsc/lint/vitest/build plus live-DB sanity checks. Reviewed and merged one at a time (rebase-onto-tip → diff review → gates → merge → push), since all 3 forked before each other's + the migration's commits landed; file sets were disjoint (Products/Categories/Courses don't overlap) so every merge was clean with zero conflicts. Also shipped the **M4 schema** in the same session (migration `20260704020000_promotions_and_coupons`: `Promotion`+`PromotionProduct`+`PromotionCategory`+`Coupon`+`CouponRedemption`, additive `Order`/`OrderItem` discount columns, RLS Pattern B on all 5 new tables) — applied and verified on production, but M4's evaluator/admin UI/checkout integration is not yet built. Final integration check (tsc/lint/test/build) green on the fully-merged tree. | Build M4 (promotion evaluator + admin CRUD + checkout integration); mandatory `security`+`tranzila-payments` skills before it ships. |
