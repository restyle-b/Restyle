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

**Database (production Supabase):** all migrations through `20260702000000_academy_commerce` are applied and recorded in `_prisma_migrations` (verified in DB). Migrations added on `academy-phase-7` (`20260703000000_testimonial_role`, `20260703020000_drop_services`, `20260703030000_opening_hours_restructure`, and anything newer) are verified only against the **isolated local Postgres** — they still must be run manually in the Supabase SQL Editor (+ `prisma migrate resolve --applied <name>`) when PR #7 ships. `prisma migrate` cannot reach Supabase from this sandbox (proxy stalls after TCP handshake) — manual SQL is the standing procedure.

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

## Phase 9 — Restyle app link (booking) ✅
No booking system on the site — "Book now" CTAs deep-link to the Restyle app (`BookingLink`: Android→Google Play, else App Store), URLs now editable via admin SiteSettings.

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
