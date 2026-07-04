# Platform Upgrade — Data-Model Design (Opus agent B, 2026-07-04)

> Additive-only migrations. Conventions: cuid ids, @@map snake_case, He/En/Ar trilingual,
> money Int agorot, Hebrew comments. RLS Pattern A = public content (SELECT true + admin
> write policy); Pattern B = private, ENABLE RLS with NO policies (Prisma service-role only).
> ALL new tables below are Pattern B.
> NOTE: promotions/coupons schema here was RECONCILED with agent C's design — see
> ../platform-upgrade.md "Reconciliation" for the final authoritative shape.

## Ground truth confirmed
- Product axes (Phase 8.6): active (visibility), available (purchasable), stock. Stock
  health DERIVED (getStockHealth, LOW_STOCK_THRESHOLD=5 hardcoded in lib/admin/product-schema.ts).
- Course has active Boolean @default(true). Category has active.
- Stock decrements in EXACTLY ONE place: handle-payment-result.ts:88, in $transaction, on
  PAID only. create-order only checks. Admin updateProductStock sets absolutely.
  Order cancellation does NOT restore stock today.
- getEffectivePriceAgorot: sale wins iff 0 < sale < price. Order stores snapshots.

## 1. Product lifecycle + SEO — DECISION: additive publishAt, keep booleans
Do NOT convert active→status enum (breaking; loses the availability axis). Derivation:
  draft = !active; scheduled = active && publishAt > now; published = active && (publishAt ?? past) <= now
Public catalog AND checkout AND enrollment queries must add:
  OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }]
(else scheduled items buyable via direct POST — security-relevant).

```prisma
model Product {
  publishAt DateTime?
  seoTitleHe String?  seoTitleEn String?  seoTitleAr String?
  seoDescriptionHe String? @db.Text
  seoDescriptionEn String? @db.Text
  seoDescriptionAr String? @db.Text
  @@index([active, publishAt])
}
```
Edge cases: past publishAt + active=false → still draft (active gate wins). SEO fallback
coalesce to nameHe (never empty <title>). publishAt stored UTC, admin UI displays
Asia/Jerusalem.

## 2. Category — NO schema change
active exists (visibility). Product count derived:
db.category.findMany({ include: { _count: { select: { products: { where: { active: true } } } } } })

## 3. Course lifecycle — same as Product (publishAt + 6 SEO cols + index)
Course has one axis (active). Scheduled course with price must be non-enrollable until
published — gate the enrollment action on the same predicate.

## 4. Wishlist
```prisma
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
  @@index([userId])
  @@map("wishlist_items")
}
```
Both FKs Cascade (wishlist of deleted product is meaningless — unlike Order which
snapshots + SetNull). Edge: add-when-present → catch unique violation, treat as success
(idempotent toggle). Guest wishlist: localStorage, merge on login (upsert ignore
conflicts). Hidden (active=false) product stays visible in wishlist flagged unavailable —
don't inner-join it out.

## 5. Saved addresses
```prisma
model UserAddress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label     String   // "בית" / "עבודה"
  line      String
  city      String
  notes     String?
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId])
  @@map("user_addresses")
}
```
Single-default enforced at DB level with a raw partial unique index in the migration:
  CREATE UNIQUE INDEX "user_addresses_one_default_per_user"
    ON "user_addresses"("userId") WHERE "isDefault" = true;
Set-default server action MUST be transactional (unset current, then set new). Deleting
the default → app promotes another. Checkout COPIES fields into Order snapshot, never FK.
PICKUP → address optional.

## 6. Inventory
```prisma
enum InventoryReason {
  SALE            // ירידת מלאי בתשלום מאומת (handle-payment-result)
  RESTOCK         // חידוש מלאי ידני (delta חיובי)
  MANUAL_ADJUST   // תיקון ידני
  ORDER_CANCELLED // החזרת מלאי בביטול הזמנה ששולמה
  @@map("inventory_reason")
}
model InventoryEvent {
  id             String          @id @default(cuid())
  productId      String
  product        Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  delta          Int             // חתום
  reason         InventoryReason
  resultingStock Int             // snapshot אחרי האירוע
  orderId        String?
  order          Order?          @relation(fields: [orderId], references: [id], onDelete: SetNull)
  actorEmail     String?         // אדמין / "payment" / "system"
  note           String?
  createdAt      DateTime        @default(now())
  @@index([productId, createdAt])
  @@map("inventory_events")
}
```
- Reserved stock: COMPUTE on read (orderItem aggregate over PENDING orders), do NOT
  materialize (less race surface, honors existing commit-at-PAID design).
- lowStockThreshold Int @default(5) moves to SiteSettings (global knob; constant stays
  as fallback). getStockHealth gains threshold param.
- Write points: handle-payment-result (delta=-qty, SALE, same $transaction);
  updateProductStock (delta computed from value read INSIDE transaction — else clobbers
  concurrent SALE decrement; reason RESTOCK if delta>0 else MANUAL_ADJUST).
- No CHECK(stock>=0) — would abort legitimate paid tx; negative shows as "out".
- Ledger starts empty — trustworthy from launch forward only (document).
- If cancel-restores-stock is ever built: increment + ORDER_CANCELLED event atomically.

## 7. Promotions + coupons — see reconciliation in master doc (two-model split kept)
Key points that SURVIVE reconciliation: typed columns for all money (never agorot in
JSON); conditions Json? only for stage-B payloads; restrictions via implicit M2M
relations (referential integrity + cascade — NOT String[]); Order gains discountAgorot
Int @default(0) + appliedCouponCode String? + appliedPromotionId snapshot (NOT FK);
coupons/redemptions/join tables ALL Pattern B (never leak codes/limits to anon).

## 8. Admin notifications — HYBRID
Keep live-derived pending-count bell. Persist ONLY event alerts needing read-state/dedupe:
```prisma
enum AdminNotificationType {
  NEW_ORDER LOW_STOCK PAYMENT_FAILED NEW_ENROLLMENT CONTACT_MESSAGE
  @@map("admin_notification_type")
}
model AdminNotification {
  id        String                @id @default(cuid())
  type      AdminNotificationType
  title     String
  body      String?
  href      String?
  dedupeKey String?               @unique // "low_stock:{productId}" — upsert מונע ספאם
  readAt    DateTime?
  createdAt DateTime              @default(now())
  @@index([readAt])
  @@index([type, createdAt])
  @@map("admin_notifications")
}
```
Dedupe via upsert on dedupeKey ("low_stock:{productId}", "payment_failed:{orderId}").
On threshold re-cross: set readAt=null (re-surface). Postgres unique ignores NULLs —
CONTACT_MESSAGE rows can be null-key. Fire LOW_STOCK upsert from the same transactions
that change stock when resultingStock <= threshold. Dead href after entity deletion —
soft-tolerate.

## 9. Customer profile — NO schema change (User.phone exists; completion computed).
## 10. Recently viewed — localStorage ONLY, no table (privacy, guests, zero DB burden).
Cap ~10 entries [{productId, viewedAt}].

## Migration order & risk (all additive, no backfill)
1 product_course_lifecycle_seo (Low — must also gate checkout/enrollment queries)
2 wishlist (Low)
3 user_addresses (Low — partial-unique needs transactional set-default)
4 inventory (Medium — ledger must join existing transactions)
5 promotions_coupons (Medium-High — reconciled shape; atomic redemption; RLS private)
6 admin_notifications (Low)

Cross-cutting: total recompute stays server-authoritative; coupon applies AFTER sale
price; every stock mutation co-writes InventoryEvent in same tx; RLS Pattern B for all
six; rounding centralized in evaluator.
