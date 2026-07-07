# Platform Upgrade — UX/IA Spec (Opus agent D, 2026-07-04)

> Screen-by-screen spec for M1 (account) + M2/M3/M6 admin additions. Hebrew microcopy
> here is source-of-truth for the new `account` i18n namespace. Admin stays hardcoded
> Hebrew inline.

## Grounding facts
- Design system is MONOCHROME (accent #e5e5e5 dark / #636363 day). No saturated hues;
  semantic Badge tones only. Buttons = pills (primary|light|outline|ghost, sm|md|lg);
  on dark use variant="light" for primary CTAs.
- Account lives under [locale] → inherits SiteHeader/footer/day-night theme. MUST use
  theme-aware tokens (bg-ink, bg-ink-soft, border-line-dark, text-white). Never hex.
- Admin is a separate root: dir="rtl" locked, always dark. Sidebar RIGHT (border-e);
  mobile nav Sheet side="start" (right); detail drawers side="end" (LEFT). Deliberate.
- messages/he.json has NO account namespace; /account/page.tsx is hardcoded Hebrew;
  orders/courses pages use next-intl. → Create `account` namespace, migrate dashboard.
- Motion: data-state keyframes in globals.css already respect prefers-reduced-motion.
  Reuse; never JS-motion that bypasses the guard.

## A1. Account layout & nav
- New src/app/[locale]/account/layout.tsx (server): does auth redirect ONCE (remove
  per-page duplicates), fetches shell data (name/phone, counts, role), renders chrome.
- Desktop (md+): two-column grid in Container; sidebar RIGHT (RTL leading), sticky,
  ~15rem, border-s. Mirror admin sidebar-nav.tsx → components/account/account-nav.tsx:
  same active logic (exact match for /account, startsWith for children), i18n Link
  (NOT next/link), active pill bg-white/10 text-white, idle text-neutral-400.
- Nav (lucide): LayoutDashboard סקירה /account · Package ההזמנות שלי · GraduationCap
  הקורסים שלי · Heart המועדפים · MapPin כתובות · User הפרופיל שלי.
- Sign-out + admin shortcut pinned to sidebar BOTTOM (mt-auto, border-t). Admin button
  only when role===ADMIN, plain next/link to /admin (outside [locale] — known gotcha).
  Reuse SignOutButton.
- Mobile: **bottom tab bar** (not a second Sheet — site already owns hamburger Sheet;
  PWA standalone expects tabs; thumb reach). fixed bottom-0 z-40 border-t bg-ink/95
  backdrop-blur md:hidden, pb-[env(safe-area-inset-bottom)]. MAX 5 tabs, RTL order:
  בית · הזמנות · קורסים · מועדפים · עוד. Icon + 11px label; active text-white + 2px
  accent top indicator. "עוד" opens Sheet (side="start"): כתובות, פרופיל, פאנל ניהול
  (admin), התנתקות. Content wrapper: pb-20 on mobile.
- Shell renders instantly; per-card skeletons stream via Suspense.

## A2. Account dashboard (/account)
SectionHeading light eyebrow="האזור האישי שלך" title="שלום, {firstName}".
Grid gap-5 lg:grid-cols-3, Card/Badge primitives:
1. הזמנות אחרונות (span 2) — last 2-3, mirror existing order link-card rows (number,
   date, formatAgorot total, OrderStatusBadge) + "מעקב הזמנה" link per in-progress.
   Footer "לכל ההזמנות ←" (ChevronLeft = forward in RTL).
2. השלמת פרופיל nudge (1 col, ONLY if name/phone missing; omit when complete) —
   border-accent/60 bg-accent/10, "הפרופיל שלך כמעט מוכן" + missing chips + CTA light
   "השלמת פרטים".
3. הקורסים שלי (1 col) — max 2, EnrollmentStatusBadge + PayBalanceButton logic reused.
   Footer "לכל הקורסים ←".
4. פעולות מהירות (full width) — pills: קביעת תור (BookingLink) · חזרה לחנות · הקורסים שלנו.
5. המועדפים שלי (span 2) — 3-4 compact product cards, hearts filled. "לכל המועדפים ←".
6. מוצרים מומלצים (full-width rail) — ProductCard in overflow-x-auto snap-x; source:
   featured products.
7. נצפו לאחרונה (full-width rail) — localStorage; OMIT card when empty.
Mobile order: nudge → orders → quick actions → courses → wishlist → recommended → viewed.
Empty states (new user must feel intentional): orders "עדיין לא ביצעת הזמנות. שווה
להתחיל 🙂" + "למעבר לחנות"; courses "עדיין לא נרשמת לקורסים." + "גילוי הקורסים שלנו";
wishlist "אין עדיין מועדפים. סמנו לב על מוצרים שאהבתם והם יופיעו כאן."; recommended —
omit if truly empty.
Skeletons: rounded-xl border-line-dark bg-ink-soft/60 + animate-pulse bg-white/5 bars,
motion-reduce:animate-none; Suspense per card (independent streaming).

## A3. Orders upgrades
- List: status filter chips (הכל/בביצוע/הושלמו) — exact pill-chip pattern from
  products-table (active border-accent bg-accent text-ink). Richer rows: item count +
  first-product thumbnail (ProductImage).
- Detail: upgrade plain <ol> history to the ADMIN StatusHistory visual timeline
  (mirror to shared/marketing variant — border-s rail, dots, newest bg-accent). This is
  the biggest premium lift.
- Tracking affordance: prominent "מעקב הזמנה" stepper (horizontal desktop / vertical
  mobile) when status ∈ {PENDING, PAID, FULFILLED}.
- Actions: "הזמנה חוזרת" (re-add in-stock items; toast "הפריטים נוספו לעגלה" / partial
  "חלק מהפריטים אזלו ולא נוספו") + "מעבר לתשלום" for PENDING. Breadcrumb האזור האישי /
  ההזמנות שלי / #1234.

## A4. Profile (/account/profile)
max-w-xl, sections split by border-t (settings-page rhythm).
1. פרטים אישיים: שם מלא editable · טלפון editable (inputMode=tel, dir=ltr) · אימייל
   READ-ONLY disabled + lock + "האימייל מקושר לחשבון ההתחברות ואינו ניתן לשינוי כאן."
   Save pill light "שמירת שינויים" → sonner toast "הפרטים נשמרו".
2. אבטחה: NO in-page password form — link to existing reset flow. "לשינוי הסיסמה נשלח
   אליך קישור מאובטח למייל." + outline pill "שליחת קישור לאיפוס סיסמה".
3. Link to address book.

## A4b. Addresses (/account/addresses)
- List: stacked Cards, formatted address + Badge "ברירת מחדל". Row DropdownMenu:
  עריכה / הגדרה כברירת מחדל / מחיקה.
- Create/edit in Sheet. Delete via ConfirmDialog ("מחיקת כתובת" / "למחוק את הכתובת?
  הפעולה אינה הפיכה.") — PROMOTE ConfirmDialog from admin to src/components/ui/.
- Empty: "עדיין לא הוספת כתובות. כתובת שמורה תמלא את פרטי המשלוח אוטומטית בצ'קאאוט."
  + "הוספת כתובת". Checkout prefill = follow-up, out of scope here.

## A5. Wishlist
Heart on product card: absolute top-3 start-3 (OPPOSITE corner from sold-out badge at
end-3 — never overlap), h-9 w-9 rounded-full bg-ink/70 backdrop-blur; Heart outline
idle / filled+text-accent active; sibling of the Link in DOM (NOT inside — would
navigate), stopPropagation+preventDefault; desktop reveal on group-hover
(opacity-0 group-hover:opacity-100), ALWAYS visible when wishlisted and on mobile
(max-md:opacity-100); aria-pressed; optimistic toggle. Cart control unchanged below.
Page: ProductCard grid (2/3/4 cols), un-heart → optimistic remove + undo toast
("הוסר מהמועדפים" + "ביטול"). Empty: Heart glyph "רשימת המועדפים ריקה" / "סמנו לב על
מוצרים שאהבתם כדי לשמור אותם כאן." + light "למעבר לחנות". Loading: 8 card skeletons.

## B1. Admin dashboard v2
Two new bands ABOVE existing status-breakdown (keep + demote pending StatCards):
- KPI row grid-cols-2 sm:3 lg:6, StatCard shape + delta-vs-prev-period line: הכנסות
  היום / 7 ימים / 30 יום · הזמנות (30 יום) · AOV · מלאי נמוך (highlighted
  border-accent/60 bg-accent/10 when >0, links /admin/products?stock=low).
- Charts (hand-rolled SVG, monochrome): series #e5e5e5 → #8a8a8a → #5a5a5a; grid #2a2a2a;
  labels neutral-400/500; tooltip bg-ink-soft border-line-dark rounded-lg shadow-lg.
  Chart 1 הכנסות לאורך זמן (30d area/bar, lg:col-span-2 of 3). Chart 2 מוצרים מובילים
  (top-5 horizontal bars — grow from right axis in RTL).
  Mobile: stack; time-series scrolls INSIDE own overflow-x-auto (page body never
  scrolls horizontally).
- Low-data states: <7 days → real short series + chip "מעט נתונים עדיין — הגרף יתמלא
  ככל שייכנסו הזמנות."; zero revenue → flat baseline + "טרם נרשמו הכנסות." (never a
  blank box). AOV with 0 orders → "—" + tooltip "ממוצע יחושב לאחר ההזמנה הראשונה."
  Low-stock 0 → neutral calm 0.
- Activity: embed ActivityTimeline limit=5 in "פעילות אחרונה" Card + "לכל הפעילות ←".
  Empty "אין פעילות להצגה עדיין."

## B2. Products bulk actions
No row-click exists → checkbox column has NO conflict. Leading (rightmost) w-10 column;
header = tri-state select-all of CURRENT FILTERED SET ONLY with count label (never
across-pages silently). Native styled checkbox (Switch is wrong semantics);
stopPropagation. Floating bar on selection>0: fixed bottom-6 centered, z-40 rounded-full
border-line-dark bg-ink-soft/95 backdrop-blur px-4 py-2; "{n} נבחרו" + pills הפעלה/השבתה
· הבלטה/ביטול הבלטה · מחיקה (ConfirmDialog: "מחיקת {n} מוצרים" / "הפעולה תמחק {n}
מוצרים לצמיתות ואינה הפיכה.") + X "ניקוי בחירה". overlay-in/out motion. Toasts
"{n} מוצרים עודכנו/נמחקו" / "חלק מהפעולות נכשלו". Clear selection + router.refresh()
after. Mobile: full-width bottom bar + safe-area.
Batch server actions wrap existing single-item actions; each requireAdmin + logActivity.

## B3. Promotions admin (/admin/promotions)
Sidebar: new "שיווק" group, Ticket icon. Table columns (RTL): קוד (monospace
[direction:ltr]) · סוג (badge אחוז/סכום קבוע/משלוח חינם) · ערך (15% / ₪30) · שימושים
(used/limit + thin accent progress meter; unlimited "{used} · ללא הגבלה") · תוקף ·
סטטוס · פעולות (DropdownMenu עריכה/שכפול/השבתה/מחיקה).
Status DERIVED (like stock health): טיוטה outline · פעיל success · פג תוקף neutral ·
נוצל warning · מושבת danger. Filters: status chips + code search.
Create/edit: Sheet side="end" (ProductEditSheet pattern), progressive disclosure. Fields:
קוד + generator (RefreshCw ghost button → random A-Z0-9 6-8 chars excluding 0/O/1/I;
field stays editable for vanity codes; live uniqueness "הקוד כבר קיים"; Copy button →
"הקוד הועתק") · סוג · ערך (hidden for free-shipping) · תקרת שימושים · תוקף מ/עד ·
מינימום הזמנה · פעיל Switch. Empty: "עדיין לא נוצרו קופונים." + "יצירת קופון".
Toasts: הקופון נוצר/עודכן/נמחק.

## B4. Inventory UX
Low-stock surfaces in ALL THREE coherently: dashboard KPI card → bell group ("{n}
מוצרים במלאי נמוך") → products table chips (EXIST — but wire chip state to accept
initial value from searchParams; currently local useState only; deep-links must set
stock=low/out).
History drawer: Sheet side="end" from new "היסטוריית מלאי" row-action; reuse
StatusHistory timeline pattern mapped to events: "+12 (קבלת סחורה)" / "−1 (מכירה
#1234)" / "תוקן ל־40 (ספירת מלאי)". Header: name + stock badge. Empty: "אין תנועות
מלאי מתועדות למוצר זה."
Manual adjust: Dialog (not Sheet — single focused decision) from "עדכון מלאי"
row-action: current stock read-only · ± stepper (ProductCardCartControl visual pattern)
or signed input · סיבה select (קבלת סחורה/החזרה/ספירת מלאי/פחת נזק/אחר) · הערה optional
· live "מלאי חדש: {n}" preview · clamp at 0 · confirm "עדכון" → stock + InventoryEvent +
logActivity → toast "המלאי עודכן".

## B5. Notification center v2
Keep DropdownMenu bell; widen w-96. Header: "התראות" + unread Badge + "סימון הכל
כנקרא" ghost (disabled when none). Body max-h-96 overflow-y-auto, TYPE sections
(הזמנות/הרשמות/מלאי/מערכת). Item: title (bold white unread / neutral-400 read) +
subtitle + relative time (LTR tabular-nums); unread = 2px accent dot at start edge;
whole item deep-links + marks read. Bell badge = unread count (≤9 number, else 9+).
Empty: "אין התראות חדשות" (reuse); all-read: dot hidden + "אין התראות שלא נקראו".
No realtime — SSR/poll parity.

## B6. Settings IA
TABS on single route /admin/settings (?tab= deep-linkable), pill-chip strip (products-
table pattern), overflow-x-auto on mobile. Ship-now: כללי ופרטי קשר (existing
SiteSettingsForm) + שעות פתיחה (existing OpeningHoursForm) + משלוח (new: shipping fee
agorot + free-shipping threshold once promotions land) + התראות (when B5 model lands).
EXCLUDED: taxes, payments (no Tranzila), roles (cancelled), languages editor (code
config; at most read-only note linking to /admin/content). Data-driven tab list.
Unsaved-changes guard: "יש שינויים שלא נשמרו".

## Cross-cutting
- RTL: forward chevrons point LEFT (ChevronLeft); logical props everywhere (ps/pe,
  ms/me, start/end, border-s/e); admin drawer sides per existing convention.
- Money: formatAgorot only. Auth: requireAdmin+zod+logActivity in admin; ownership
  re-check in account actions (order-detail IDOR guard is the model).
- Toasts: sonner, Hebrew, present tense. Motion: reuse keyframes + motion-reduce guards.
- Keyboard (admin only): "/" focuses current screen's search (no-op in text fields);
  "g then d" → dashboard. Disabled while Dialog/Sheet open. Nothing more.

## Handoff sequencing
Blocked-on-model: A5 wishlist, A4b addresses, B3 coupons, B4 history, B5 persisted
notifications (build UI against thin typed interface). Buildable now: A1, A2, A3, A4,
B1, B2, B6. First PRs: (1) account layout+nav+tab bar; (2) account i18n namespace;
(3) A2 dashboard; then fan out. Promote ConfirmDialog to ui/.
