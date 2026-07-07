/**
 * מנוע חישוב מבצעים/קופונים — פונקציה טהורה (ZERO I/O): אין כאן קריאות DB,
 * server actions או "use server". הקורא (preview action / create-order) שולף
 * את הנתונים מה-DB, מנרמל אותם לצורות הפשוטות המוגדרות כאן, וקורא לפונקציה.
 *
 * מקור אמת סמנטי: docs/features/platform-upgrade/promotion-engine.md §1-§3.
 * אל תשנה את סמנטיקת העיגול/ההקצאה/הערימה בלי לעדכן גם את המסמך.
 */

// ---------------------------------------------------------------------------
// טיפוסים
// ---------------------------------------------------------------------------

export type PromotionKind = "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIPPING";

/**
 * appliesTo קיים בסכימה (Promotion.appliesTo) ולא הופיע במפורש ברשימת השדות
 * המקוצרת ב-§1 של המסמך, אך §7 מגדיר במפורש מקרה בדיקה (27) "appliesTo=COURSES
 * excluded" עבור המעריך הטהור — כלומר השדה כן זורם ל-PromotionRow, וה-evaluator
 * הוא זה שאוכף "רק SHOP" (קורסים/מקדמות יוצאים מהיקף שלב א, ראה §5.7).
 */
export type PromotionAppliesTo = "SHOP" | "COURSES";

export type DeliveryMethod = "PICKUP" | "DELIVERY";

/** שורת עגלה מנורמלת — unitPriceAgorot כבר אחרי מבצע/sale, זו לא בעיית ה-evaluator. */
export interface EvalLine {
  productId: string;
  quantity: number;
  unitPriceAgorot: number;
  categoryId: string | null;
}

/** מבצע מנורמל (הן עבור מבצעים אוטומטיים והן עבור המבצע שמאחורי קופון). */
export interface PromotionRow {
  id: string;
  code: string | null;
  name: string;
  kind: PromotionKind;
  appliesTo: PromotionAppliesTo;
  /** 1000 = 10% (בייסיס פוינטס — מאפשר גם 12.5%). */
  percentBp: number | null;
  amountAgorot: number | null;
  minSubtotalAgorot: number | null;
  freeShippingMinSubtotalAgorot: number | null;
  /** ריק ⇒ כל העגלה זכאית. */
  eligibleProductIds: string[];
  eligibleCategoryIds: string[];
  /** מוצרים מוחרגים — "חל על הכל חוץ מ-X". נבדק אחרי הזכאות (החרגה מנצחת הכללה). */
  excludedProductIds: string[];
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  priority: number;
}

/** קופון — מצביע על PromotionRow; מגבלות שימוש וחלון תוקף חיים על הקופון עצמו. */
export interface CouponRow {
  id: string;
  code: string;
  active: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  /** override על promotion.minSubtotalAgorot, אם מוגדר. */
  minSubtotalAgorot: number | null;
  promotion: PromotionRow;
}

export interface EvalCustomer {
  emailNormalized: string;
  userId: string | null;
}

export interface EvalShipping {
  method: DeliveryMethod;
  feeAgorot: number;
}

export interface EvalUsage {
  couponTotalUsed: number;
  couponPerCustomerUsed: number;
}

export interface EvalInput {
  lines: EvalLine[];
  automaticPromotions: PromotionRow[];
  coupon: CouponRow | null;
  now: Date;
  customer: EvalCustomer;
  shipping: EvalShipping;
  usage: EvalUsage | null;
}

export interface AppliedPromotion {
  id: string;
  code: string | null;
  name: string;
  kind: PromotionKind;
  amountAgorot: number;
}

export interface LineDiscount {
  productId: string;
  lineDiscountAgorot: number;
}

export interface Rejection {
  code: string;
  reason: string;
}

export interface EvalResult {
  subtotalAgorot: number;
  discountAgorot: number;
  lineDiscounts: LineDiscount[];
  freeShipping: boolean;
  shippingAgorot: number;
  totalAgorot: number;
  appliedPromotions: AppliedPromotion[];
  rejections: Rejection[];
}

// ---------------------------------------------------------------------------
// עזרים פנימיים
// ---------------------------------------------------------------------------

/** שורה זכאה + הבסיס (agorot) שעליו מחושבת ההנחה לשורה זו. */
interface EligibleLine {
  index: number;
  base: number;
}

function lineSubtotal(line: EvalLine): number {
  return line.unitPriceAgorot * line.quantity;
}

/**
 * ריק בשני מערכי ההכללה ⇒ כל העגלה זכאית (לפני החרגה); אחרת productId או
 * categoryId (לא null) בהתאמה. החרגה נבדקת אחרונה ומנצחת תמיד — מוצר מוחרג
 * לעולם לא זכאי, גם אם הוא (או הקטגוריה שלו) מופיע ברשימת ההכללה.
 */
function isLineEligible(
  line: EvalLine,
  eligibleProductIds: string[],
  eligibleCategoryIds: string[],
  excludedProductIds: string[],
): boolean {
  if (excludedProductIds.includes(line.productId)) return false;
  if (eligibleProductIds.length === 0 && eligibleCategoryIds.length === 0) return true;
  if (eligibleProductIds.includes(line.productId)) return true;
  if (line.categoryId != null && eligibleCategoryIds.includes(line.categoryId)) return true;
  return false;
}

/**
 * מרכיב את רשימת השורות הזכאיות. `baseOf` מחשב את בסיס ההנחה לכל שורה (subtotal
 * מקורי בשלב האוטומטי, subtotal פוסט-אוטומטי בשלב הקופון) — בלי אינדוקס למערך
 * חיצוני, כדי להישאר תואם noUncheckedIndexedAccess בלי אזהרות.
 */
function eligibleLinesFor(
  lines: EvalLine[],
  baseOf: (line: EvalLine, index: number) => number,
  eligibleProductIds: string[],
  eligibleCategoryIds: string[],
  excludedProductIds: string[],
): EligibleLine[] {
  const result: EligibleLine[] = [];
  lines.forEach((currentLine, index) => {
    if (isLineEligible(currentLine, eligibleProductIds, eligibleCategoryIds, excludedProductIds)) {
      result.push({ index, base: baseOf(currentLine, index) });
    }
  });
  return result;
}

function isWithinWindow(now: Date, startsAt: Date | null, endsAt: Date | null): boolean {
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}

/**
 * עיגול פעם אחת ברמת ה-subtotal הזכאי, half-up (Math.round) — לעולם לא עיגול
 * לפי שורה ואז סכימה (§2). PERCENT: min(round(E*bp/10000), E). FIXED: min(amount, E).
 */
function computeMerchandiseDiscount(
  kind: "PERCENT" | "FIXED_AMOUNT",
  eligibleSubtotalAgorot: number,
  percentBp: number | null,
  amountAgorot: number | null,
): number {
  if (eligibleSubtotalAgorot <= 0) return 0;
  if (kind === "PERCENT") {
    const bp = percentBp ?? 0;
    const exact = (eligibleSubtotalAgorot * bp) / 10000;
    return Math.min(Math.round(exact), eligibleSubtotalAgorot);
  }
  return Math.min(amountAgorot ?? 0, eligibleSubtotalAgorot);
}

/**
 * הקצאת שיטת השארית הגדולה ביותר (Hamilton): floor לכל שורה, ואז שארית אחת
 * אגורה בכל פעם לשורות עם החלק העשרוני הגדול ביותר (תיקו ⇒ אינדקס שורה עולה).
 * מבטיח Σ === discount בדיוק. בנוי כולו על אובייקטים/Map, בלי אינדוקס גולמי
 * למערך (תואם noUncheckedIndexedAccess).
 */
function allocateLargestRemainder(
  discountAgorot: number,
  eligibleLines: EligibleLine[],
): Map<number, number> {
  const result = new Map<number, number>();
  if (discountAgorot <= 0 || eligibleLines.length === 0) return result;
  const sumBase = eligibleLines.reduce((acc, l) => acc + l.base, 0);
  if (sumBase <= 0) return result;

  const shares = eligibleLines.map((l) => {
    const exact = (discountAgorot * l.base) / sumBase;
    const floor = Math.floor(exact);
    return { lineIndex: l.index, floor, frac: exact - floor };
  });

  const flooredSum = shares.reduce((acc, s) => acc + s.floor, 0);
  const remainder = discountAgorot - flooredSum;

  const order = [...shares].sort((a, b) => b.frac - a.frac || a.lineIndex - b.lineIndex);
  const bumpIndices = new Set(order.slice(0, remainder).map((s) => s.lineIndex));

  for (const s of shares) {
    result.set(s.lineIndex, s.floor + (bumpIndices.has(s.lineIndex) ? 1 : 0));
  }
  return result;
}

function mergeDiscountMaps(target: Map<number, number>, source: Map<number, number>): void {
  for (const [index, amount] of source) {
    target.set(index, (target.get(index) ?? 0) + amount);
  }
}

// ---------------------------------------------------------------------------
// שלב 1: בחירת המבצע האוטומטי הטוב ביותר (עבור מוצרים, לא משלוח חינם)
// ---------------------------------------------------------------------------

interface AutoCandidate {
  promo: PromotionRow;
  discount: number;
  eligibleLines: EligibleLine[];
}

function evaluateAutomaticMerchandiseCandidate(
  promo: PromotionRow,
  lines: EvalLine[],
  subtotalAgorot: number,
  now: Date,
): AutoCandidate | null {
  if (promo.kind !== "PERCENT" && promo.kind !== "FIXED_AMOUNT") return null;
  if (!promo.active) return null;
  if (promo.appliesTo !== "SHOP") return null;
  if (!isWithinWindow(now, promo.startsAt, promo.endsAt)) return null;
  if (subtotalAgorot < (promo.minSubtotalAgorot ?? 0)) return null;

  const eligibleLines = eligibleLinesFor(
    lines,
    (currentLine) => lineSubtotal(currentLine),
    promo.eligibleProductIds,
    promo.eligibleCategoryIds,
    promo.excludedProductIds,
  );
  const eligibleSubtotal = eligibleLines.reduce((acc, l) => acc + l.base, 0);
  const discount = computeMerchandiseDiscount(promo.kind, eligibleSubtotal, promo.percentBp, promo.amountAgorot);
  return { promo, discount, eligibleLines };
}

/** מקסימום הנחה; תיקו ⇒ priority יורד, ואז id עולה. */
function pickBestAutomaticMerchandisePromo(candidates: AutoCandidate[]): AutoCandidate | null {
  const withDiscount = candidates.filter((c) => c.discount > 0);
  if (withDiscount.length === 0) return null;
  withDiscount.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    if (b.promo.priority !== a.promo.priority) return b.promo.priority - a.promo.priority;
    return a.promo.id < b.promo.id ? -1 : a.promo.id > b.promo.id ? 1 : 0;
  });
  return withDiscount[0] ?? null;
}

function isFreeShippingPromoQualified(promo: PromotionRow, preDiscountSubtotalAgorot: number, now: Date): boolean {
  if (promo.kind !== "FREE_SHIPPING") return false;
  if (!promo.active) return false;
  if (promo.appliesTo !== "SHOP") return false;
  if (!isWithinWindow(now, promo.startsAt, promo.endsAt)) return false;
  const gate = promo.freeShippingMinSubtotalAgorot ?? promo.minSubtotalAgorot ?? 0;
  return preDiscountSubtotalAgorot >= gate;
}

// ---------------------------------------------------------------------------
// שלב 2: קופון (מעל ה-subtotal הזכאי הפוסט-אוטומטי)
// ---------------------------------------------------------------------------

interface CouponEvaluation {
  discount: number;
  lineMap: Map<number, number>;
  freeShipping: boolean;
  applied: AppliedPromotion | null;
  rejection: Rejection | null;
}

function rejectedCoupon(code: string, reason: string): CouponEvaluation {
  return { discount: 0, lineMap: new Map(), freeShipping: false, applied: null, rejection: { code, reason } };
}

function evaluateCoupon(
  coupon: CouponRow,
  lines: EvalLine[],
  autoDiscountByLine: Map<number, number>,
  preDiscountSubtotalAgorot: number,
  now: Date,
  usage: EvalUsage | null,
): CouponEvaluation {
  const promo = coupon.promotion;

  if (promo.appliesTo !== "SHOP") {
    return rejectedCoupon("COUPON_APPLIES_TO_NOT_SHOP", "הקופון אינו תקף לרכישות מהחנות.");
  }

  if (!coupon.active || !promo.active) {
    return rejectedCoupon("COUPON_INACTIVE", "הקופון אינו פעיל.");
  }

  const effectiveStart = coupon.startsAt && promo.startsAt
    ? (coupon.startsAt > promo.startsAt ? coupon.startsAt : promo.startsAt)
    : coupon.startsAt ?? promo.startsAt;
  const effectiveEnd = coupon.expiresAt && promo.endsAt
    ? (coupon.expiresAt < promo.endsAt ? coupon.expiresAt : promo.endsAt)
    : coupon.expiresAt ?? promo.endsAt;

  if (effectiveStart && now < effectiveStart) {
    return rejectedCoupon("COUPON_NOT_STARTED", "הקופון עדיין לא נכנס לתוקף.");
  }
  if (effectiveEnd && now > effectiveEnd) {
    return rejectedCoupon("COUPON_EXPIRED", "תוקף הקופון פג.");
  }

  const totalUsed = usage?.couponTotalUsed ?? 0;
  const perCustomerUsed = usage?.couponPerCustomerUsed ?? 0;
  if (coupon.usageLimit != null && totalUsed >= coupon.usageLimit) {
    return rejectedCoupon("COUPON_USAGE_LIMIT_REACHED", "הקופון מוצה.");
  }
  if (coupon.perCustomerLimit != null && perCustomerUsed >= coupon.perCustomerLimit) {
    return rejectedCoupon("COUPON_PER_CUSTOMER_LIMIT_REACHED", "כבר מימשת את הקופון הזה.");
  }

  // שער minSubtotal — תמיד על subtotal טרום-הנחה של כל העגלה, גם לקופון עם הגבלת מוצרים (§3).
  const effectiveMinSubtotal = coupon.minSubtotalAgorot ?? promo.minSubtotalAgorot ?? 0;
  if (preDiscountSubtotalAgorot < effectiveMinSubtotal) {
    return rejectedCoupon("COUPON_MIN_SUBTOTAL_NOT_MET", "סכום ההזמנה אינו מגיע לסף הנדרש למימוש הקופון.");
  }

  if (promo.kind === "FREE_SHIPPING") {
    const gate = promo.freeShippingMinSubtotalAgorot ?? effectiveMinSubtotal;
    if (preDiscountSubtotalAgorot < gate) {
      return rejectedCoupon("COUPON_MIN_SUBTOTAL_NOT_MET", "סכום ההזמנה אינו מגיע לסף הנדרש למשלוח חינם.");
    }
    return {
      discount: 0,
      lineMap: new Map(),
      freeShipping: true,
      applied: { id: promo.id, code: coupon.code, name: promo.name, kind: promo.kind, amountAgorot: 0 },
      rejection: null,
    };
  }

  // PERCENT | FIXED_AMOUNT — מחושב מעל ה-subtotal הזכאי הפוסט-אוטומטי (§3 שלב 3).
  const eligibleLines = eligibleLinesFor(
    lines,
    (currentLine, index) => lineSubtotal(currentLine) - (autoDiscountByLine.get(index) ?? 0),
    promo.eligibleProductIds,
    promo.eligibleCategoryIds,
    promo.excludedProductIds,
  );
  const eligibleSubtotal = eligibleLines.reduce((acc, l) => acc + l.base, 0);
  if (eligibleSubtotal <= 0) {
    return rejectedCoupon("COUPON_NO_ELIGIBLE_ITEMS", "הקופון אינו חל על הפריטים שבעגלה שלך.");
  }

  const discount = computeMerchandiseDiscount(promo.kind, eligibleSubtotal, promo.percentBp, promo.amountAgorot);
  const lineMap = allocateLargestRemainder(discount, eligibleLines);

  return {
    discount,
    lineMap,
    freeShipping: false,
    applied: { id: promo.id, code: coupon.code, name: promo.name, kind: promo.kind, amountAgorot: discount },
    rejection: null,
  };
}

// ---------------------------------------------------------------------------
// הפונקציה הראשית
// ---------------------------------------------------------------------------

/**
 * מעריך מבצעים/קופונים טהור. הצינור (§3): מחיר sale כבר בתוך unitPriceAgorot →
 * מבצע אוטומטי יחיד הכי טוב על מוצרים → קופון מעל ה-subtotal הזכאי הפוסט-אוטומטי →
 * משלוח חינם אורתוגונלי (מבצע אוטומטי FREE_SHIPPING כשיר או קופון משלוח חינם) →
 * total = subtotal − discount + shipping.
 */
export function evaluatePromotions(input: EvalInput): EvalResult {
  const { lines, automaticPromotions, coupon, now, shipping, usage } = input;

  const subtotalAgorot = lines.reduce((acc, l) => acc + lineSubtotal(l), 0);

  const rejections: Rejection[] = [];
  const appliedPromotions: AppliedPromotion[] = [];
  const lineDiscountMap = new Map<number, number>();

  // --- שלב 1: מבצע אוטומטי יחיד הכי טוב (מוצרים) ---
  const autoCandidates = automaticPromotions
    .map((p) => evaluateAutomaticMerchandiseCandidate(p, lines, subtotalAgorot, now))
    .filter((c): c is AutoCandidate => c !== null);
  const bestAuto = pickBestAutomaticMerchandisePromo(autoCandidates);

  let autoDiscountAgorot = 0;
  if (bestAuto) {
    autoDiscountAgorot = bestAuto.discount;
    const autoLineMap = allocateLargestRemainder(bestAuto.discount, bestAuto.eligibleLines);
    mergeDiscountMaps(lineDiscountMap, autoLineMap);
    appliedPromotions.push({
      id: bestAuto.promo.id,
      code: bestAuto.promo.code,
      name: bestAuto.promo.name,
      kind: bestAuto.promo.kind,
      amountAgorot: bestAuto.discount,
    });
  }

  // --- שלב 1b: משלוח חינם אוטומטי (אורתוגונלי לבחירת המבצע הממוצע) ---
  let freeShippingFromAuto = false;
  let freeShippingAutoPromo: PromotionRow | null = null;
  for (const promo of automaticPromotions) {
    if (isFreeShippingPromoQualified(promo, subtotalAgorot, now)) {
      freeShippingFromAuto = true;
      if (!freeShippingAutoPromo || promo.priority > freeShippingAutoPromo.priority) {
        freeShippingAutoPromo = promo;
      }
    }
  }
  if (freeShippingAutoPromo) {
    appliedPromotions.push({
      id: freeShippingAutoPromo.id,
      code: freeShippingAutoPromo.code,
      name: freeShippingAutoPromo.name,
      kind: freeShippingAutoPromo.kind,
      amountAgorot: shipping.feeAgorot,
    });
  }

  // --- שלב 2: קופון מעל ה-subtotal הזכאי הפוסט-אוטומטי ---
  let couponDiscountAgorot = 0;
  let freeShippingFromCoupon = false;

  if (coupon) {
    const evalResult = evaluateCoupon(coupon, lines, lineDiscountMap, subtotalAgorot, now, usage);
    if (evalResult.rejection) {
      rejections.push(evalResult.rejection);
    }
    if (evalResult.applied) {
      appliedPromotions.push(evalResult.applied);
    }
    couponDiscountAgorot = evalResult.discount;
    freeShippingFromCoupon = evalResult.freeShipping;
    mergeDiscountMaps(lineDiscountMap, evalResult.lineMap);
  }

  const discountAgorot = autoDiscountAgorot + couponDiscountAgorot;
  const freeShipping = freeShippingFromAuto || freeShippingFromCoupon;
  const shippingAgorot = freeShipping ? 0 : shipping.feeAgorot;
  const totalAgorot = Math.max(0, subtotalAgorot - discountAgorot) + shippingAgorot;

  const lineDiscounts: LineDiscount[] = lines.map((currentLine, index) => ({
    productId: currentLine.productId,
    lineDiscountAgorot: lineDiscountMap.get(index) ?? 0,
  }));

  return {
    subtotalAgorot,
    discountAgorot,
    lineDiscounts,
    freeShipping,
    shippingAgorot,
    totalAgorot,
    appliedPromotions,
    rejections,
  };
}

/**
 * נורמליזציית אימייל למפתח לקוח עקבי (אורח ורשום כאחד) — §5.6: customerKey =
 * email.trim().toLowerCase(). מיוצא כאן (ולא משוכפל ב-create-order) כדי שספירת
 * perCustomerLimit תמיד תתבסס על אותה נורמליזציה בדיוק כמו ה-evaluator.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
