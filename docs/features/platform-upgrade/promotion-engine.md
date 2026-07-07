# Platform Upgrade — Promotion Engine Design (Opus agent C, 2026-07-04)

> Money-critical spec for M4 (Stage A). Schema shape reconciled with agent B — final
> authoritative schema in ../platform-upgrade.md "Reconciliation"; the SEMANTICS below
> (evaluation, rounding, stacking, atomicity, failure modes, tests) are authoritative
> as-is.

## 0. Ground truth (cited from code)
- Server is the only price authority: create-order.ts:60-97 re-fetches products
  (active+available), unitPriceAgorot = getEffectivePriceAgorot (:84), subtotal summed
  (:86), shipping DELIVERY ? 4000 : 0 (:96), total = subtotal + shipping (:97). Client
  sends only {productId, quantity}.
- Sale price is ALREADY baked into unit price before any promo runs.
- Stock: checked at creation (:81-83), decremented only at verified payment in
  $transaction (handle-payment-result.ts:83-91). Last-unit race accepted by design.
- **create-order has NO $transaction around order creation today** (:108 single nested
  create; payment.create separate at :146). MUST change for coupon atomicity.
- Payment integrity already correct, does NOT recompute: handle-payment-result.ts:49-67
  compares result.amountAgorot === order.totalAgorot, FAILED on mismatch. Mock echoes
  the checkout-minted amount; Tranzila derives from server-to-server Inquire; same
  equality guard. → A discounted order survives every callback path UNCHANGED, provided
  totalAgorot is stored net-of-discount and passed to createCheckout. NO callback
  changes needed.

## 1. Evaluation semantics
Pure evaluator, zero I/O: src/lib/promotions/evaluate.ts. Called by BOTH the preview
action and create-order; callers supply DB-fetched data.

EvalLine: { productId, quantity, unitPriceAgorot (sale-applied), categoryId }
PromotionRow (normalized): { id, code|null, name, kind: PERCENT|FIXED_AMOUNT|FREE_SHIPPING,
  percentBp|null (1000=10%), amountAgorot|null, minSubtotalAgorot|null,
  freeShippingMinSubtotalAgorot|null, eligibleProductIds[], eligibleCategoryIds[]
  (empty ⇒ whole cart), startsAt|endsAt|null, active, priority }
EvalInput: { lines, automaticPromotions[], coupon|null, now, customer
  { emailNormalized, userId|null }, shipping { method, feeAgorot },
  usage { couponTotalUsed, couponPerCustomerUsed } | null }
EvalResult: { subtotalAgorot, discountAgorot (0..subtotal), lineDiscounts[] (Σ ===
  discountAgorot), freeShipping, shippingAgorot, totalAgorot, appliedPromotions[]
  ({id, code, name, kind, amountAgorot}), rejections[] ({code, reason}) }

**Line-level allocation REQUIRED in Stage A**: partial refunds later need per-line net;
item-restricted coupons on mixed carts intrinsically need attribution; OrderItem gains
lineDiscountAgorot.

Eligibility: empty restriction sets ⇒ whole cart; else productId ∈ eligibleProductIds
OR categoryId ∈ eligibleCategoryIds.

**Allocation: Largest-Remainder (Hamilton)** over eligible lines for discount D on
eligible subtotal E: exact_i = D*lineSub_i/E; assign floor_i; R = D - Σfloor_i; sort by
fractional part DESC, tie-break line index ASC; +1 agora to first R lines.
Σ lineDiscount_i === D exactly; ineligible lines get 0.

## 2. Rounding (money-critical)
**Round ONCE at the eligible-subtotal level, half-up (Math.round); NEVER per-line-then-
sum.** PERCENT: D = min(round(E*percentBp/10000), E). FIXED: D = min(amountAgorot, E).
Worked examples:
- 10% off 3×3333: E=9999, D=round(999.9)=1000, lines [334,333,333] (per-line rounding
  would give 999 — rejected).
- Fixed 2000 off A=3000/B=6000: exact 666.67/1333.33, floors 1999, R=1 → A(frac .67)
  gets +1 → [667,1333].
- Fixed 15000 off E=9000 → D=9000, merchandise total 0.

## 3. Stacking pipeline (Stage A hard-coded; stackable/priority stored dormant)
1. Sale price — already in unit price.
2. Best single automatic merchandise promo (max D; tie-break priority desc, id asc).
3. Coupon applies ON TOP, computed against POST-automatic eligible subtotal
   (lineSub_i − autoDiscount_i) — prevents >100% double-percent stacking.
4. Free shipping orthogonal: any qualifying FREE_SHIPPING auto promo OR free-shipping
   coupon → shippingAgorot = 0.
5. discountAgorot = Σ(auto+coupon); lineDiscount_i = auto_i + coupon_i;
   total = subtotal − discount + shipping.

**Free-shipping threshold evaluates on PRE-discount subtotal** (avoids "your coupon
removed free shipping"; generous, dispute-safe). **minSubtotalAgorot gate also checks
whole-cart pre-discount subtotal** even for item-restricted coupons (the discount still
computes only on eligible lines).

## 4. Integrity & redemption atomicity
Authoritative evaluation happens EXACTLY ONCE: inside create-order, in ONE interactive
transaction, re-fetching promotion rows AND product prices.

create-order changes — wrap in db.$transaction(async (tx) => {...}):
1. Re-fetch products & recompute (existing logic).
2. Re-fetch coupon by code (active, window, appliesTo=SHOP) + active automatic promos.
3. Lock coupon row: tx.$queryRaw`SELECT id FROM coupons WHERE id=${id} FOR UPDATE`.
4. Inside lock: count totalUsed + perCustomerUsed (by emailNormalized), evaluate,
   enforce limits.
5. Compute total NET of discount; order.create with discount fields; couponRedemption
   create (orderId @unique backstop); usedCount increment.
6. THEN payment.create + createCheckout receive the discounted totalAgorot.

**Reserve-at-creation, release-on-terminal-failure** (NOT commit-at-payment): the slot
must be secured before the provider charges the discounted amount. Release in
handle-payment-result FAILED/mismatch branches + admin cancel: decrement usedCount,
delete redemption — same transaction.

FOR UPDATE serializes both total and per-customer limits. Lighter alternative for total
only: conditional UPDATE ... SET usedCount=usedCount+1 WHERE usedCount<usageLimit,
check affected rows. orderId @unique = double-submit backstop.

## 5. Failure modes
1 expired between preview/submit → tx re-checks window → HARD-FAIL checkout with
  couponExpired (never silently charge full price).
2 usage limit hit between preview/submit → guarded increment fails → abort tx, no order.
3 price changed mid-session → prices always re-fetched; recompute on new prices.
4 eligible product removed → re-evaluate; reject coupon with reason (not silent).
5 fixed discount > subtotal → clamp; total never < 0; with free shipping → total 0.
6 guest per-customer limit → customerKey = email.trim().toLowerCase() for guest AND
  logged-in; redemption stores userId? + emailNormalized; count matches on email.
7 courses/enrollments → OUT of Stage A (deposit/balance split makes discount semantics
  ambiguous); Promotion.appliesTo = SHOP now, COURSES later (no reshape needed).
8 double-submit → rate limit 5/min + fresh orderId each + orderId @unique + payment
  status guard.

## 6. API contract
- applyCouponPreview(input, locale) — NON-authoritative, rate-limited. zod: code 1-40,
  items[{productId, quantity 1-99}] 1-50, deliveryMethod enum. Returns {ok, discount,
  freeShipping, total, appliedPromotions, reason?} | {ok:false, reason}.
- createCheckoutSchema gains couponCode: z.string().trim().max(40).optional().or(z.literal("")).
- Order: discountAgorot Int @default(0), appliedCouponCode String?, appliedPromotions
  Json? (display snapshot [{id,name,kind,amountAgorot}]), freeShipping Boolean @default(false).
- OrderItem: lineDiscountAgorot Int @default(0).
- Invariants: subtotal = Σ lineTotal (pre-discount); total = subtotal − discount +
  shipping. lookup-order returns the new fields.
- Admin CRUD (requireAdmin + logActivity + revalidate): getPromotions, getPromotion,
  createPromotion, updatePromotion, deletePromotion, togglePromotionActive,
  getPromotionRedemptions. (+ coupon CRUD + bulk code generation per reconciliation.)

## 7. Vitest plan (pure evaluator) — 28 cases
Rounding: (1) 10%/3×3333 → 1000/[334,333,333]; (2) fixed 2000/[3000,6000] → [667,1333];
(3) half-up at .49/.5; (4) largest-remainder tie determinism; (5) Σ lines === discount
fuzz. Eligibility: (6) whole-cart; (7) product-restricted mixed cart; (8) category
restricted, null categoryId never matches; (9) minSubtotal whole-cart gate + eligible-
only discount. Stacking: (10) percent on sale price not list; (11) best single auto,
tie-break; (12) coupon on post-auto subtotal; (13) free-ship + merchandise coexist.
Shipping: (14) pre-discount threshold held after coupon drop; (15) below threshold /
PICKUP=0; (16) minSubtotal pre-discount. Floors: (17) cap at eligible subtotal; (18)
fixed+freeship → total 0; (19) empty eligible set → 0 + reason; (20) 100% → total =
shipping. Validity: (21) expired; (22) not-started; (23) inactive; (24) total limit;
(25) per-customer limit; (26) email normalization; (27) appliesTo=COURSES excluded;
(28) unknown code → null path, no throw.
Integration (DB): concurrent FOR UPDATE respects limit; release-on-FAILED decrements;
discounted total passes handle-payment-result unchanged.

## Build risks
1. create-order lacks a transaction — wrapping it is the core structural change.
2. Reserve-at-creation diverges from commit-at-PAID stock model — intentional.
3. No callback changes needed — amountAgorot === totalAgorot guard already protects.
