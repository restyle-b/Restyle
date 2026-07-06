import { describe, it, expect } from "vitest";
import {
  evaluatePromotions,
  normalizeEmail,
  type EvalInput,
  type EvalLine,
  type PromotionRow,
  type CouponRow,
} from "@/lib/promotions/evaluate";

// ---------------------------------------------------------------------------
// עזרי בנייה — כל השדות עם ברירת מחדל "לא מגביל", override לפי צורך כל בדיקה.
// ---------------------------------------------------------------------------

const NOW = new Date("2026-07-06T12:00:00.000Z");

function line(overrides: Partial<EvalLine> = {}): EvalLine {
  return {
    productId: "prod-1",
    quantity: 1,
    unitPriceAgorot: 1000,
    categoryId: null,
    ...overrides,
  };
}

function promotion(overrides: Partial<PromotionRow> = {}): PromotionRow {
  return {
    id: "promo-1",
    code: null,
    name: "מבצע",
    kind: "PERCENT",
    appliesTo: "SHOP",
    percentBp: null,
    amountAgorot: null,
    minSubtotalAgorot: 0,
    freeShippingMinSubtotalAgorot: null,
    eligibleProductIds: [],
    eligibleCategoryIds: [],
    startsAt: null,
    endsAt: null,
    active: true,
    priority: 0,
    ...overrides,
  };
}

function coupon(overrides: Partial<Omit<CouponRow, "promotion">> = {}, promoOverrides: Partial<PromotionRow> = {}): CouponRow {
  return {
    id: "coupon-1",
    code: "SAVE10",
    active: true,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    perCustomerLimit: null,
    minSubtotalAgorot: null,
    promotion: promotion({ id: "promo-for-coupon", code: "SAVE10", ...promoOverrides }),
    ...overrides,
  };
}

function baseInput(overrides: Partial<EvalInput> = {}): EvalInput {
  return {
    lines: [],
    automaticPromotions: [],
    coupon: null,
    now: NOW,
    customer: { emailNormalized: "customer@example.com", userId: null },
    shipping: { method: "DELIVERY", feeAgorot: 4000 },
    usage: null,
    ...overrides,
  };
}

function sumLineDiscounts(result: ReturnType<typeof evaluatePromotions>): number {
  return result.lineDiscounts.reduce((acc, l) => acc + l.lineDiscountAgorot, 0);
}

// ---------------------------------------------------------------------------
// עיגול (§2, §7 1-5)
// ---------------------------------------------------------------------------

describe("עיגול", () => {
  it("(1) 10% על 3×3333 → 1000, מוקצה [334,333,333]", () => {
    const input = baseInput({
      lines: [
        line({ productId: "a", unitPriceAgorot: 3333 }),
        line({ productId: "b", unitPriceAgorot: 3333 }),
        line({ productId: "c", unitPriceAgorot: 3333 }),
      ],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 1000 })],
    });
    const result = evaluatePromotions(input);
    expect(result.subtotalAgorot).toBe(9999);
    expect(result.discountAgorot).toBe(1000);
    expect(result.lineDiscounts.map((l) => l.lineDiscountAgorot)).toEqual([334, 333, 333]);
  });

  it("(2) קבוע 2000 מתוך [3000,6000] → [667,1333]", () => {
    const input = baseInput({
      lines: [line({ productId: "a", unitPriceAgorot: 3000 }), line({ productId: "b", unitPriceAgorot: 6000 })],
      automaticPromotions: [promotion({ kind: "FIXED_AMOUNT", amountAgorot: 2000 })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(2000);
    expect(result.lineDiscounts.map((l) => l.lineDiscountAgorot)).toEqual([667, 1333]);
  });

  it("(3) half-up: .5 מעוגל למעלה, .49 מעוגל למטה", () => {
    const upInput = baseInput({
      lines: [line({ unitPriceAgorot: 100 })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 550 })], // 100*0.055=5.5
    });
    expect(evaluatePromotions(upInput).discountAgorot).toBe(6);

    const downInput = baseInput({
      lines: [line({ unitPriceAgorot: 100 })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 549 })], // 100*0.0549=5.49
    });
    expect(evaluatePromotions(downInput).discountAgorot).toBe(5);
  });

  it("(4) שארית גדולה ביותר — תיקו נשבר לפי אינדקס שורה עולה", () => {
    const input = baseInput({
      lines: [line({ productId: "a", unitPriceAgorot: 100 }), line({ productId: "b", unitPriceAgorot: 100 })],
      automaticPromotions: [promotion({ kind: "FIXED_AMOUNT", amountAgorot: 1 })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(1);
    expect(result.lineDiscounts.map((l) => l.lineDiscountAgorot)).toEqual([1, 0]);
  });

  it("(5) פאזי: Σ lineDiscounts === discountAgorot תמיד", () => {
    // מחולל פסאודו-רנדומי דטרמיניסטי (mulberry32) — חוזר על עצמו בכל הרצה.
    function mulberry32(seed: number) {
      let a = seed;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(42);

    for (let iter = 0; iter < 200; iter++) {
      const lineCount = 1 + Math.floor(rand() * 5);
      const lines: EvalLine[] = [];
      for (let i = 0; i < lineCount; i++) {
        lines.push(
          line({ productId: `p${i}`, unitPriceAgorot: 1 + Math.floor(rand() * 10000), quantity: 1 + Math.floor(rand() * 5) }),
        );
      }
      const isPercent = rand() < 0.5;
      const promo = isPercent
        ? promotion({ kind: "PERCENT", percentBp: Math.floor(rand() * 10001) })
        : promotion({ kind: "FIXED_AMOUNT", amountAgorot: Math.floor(rand() * 20000) });

      const result = evaluatePromotions(baseInput({ lines, automaticPromotions: [promo] }));
      expect(sumLineDiscounts(result)).toBe(result.discountAgorot);
    }
  });
});

// ---------------------------------------------------------------------------
// זכאות (§1, §7 6-9)
// ---------------------------------------------------------------------------

describe("זכאות", () => {
  it("(6) סטים ריקים ⇒ כל העגלה זכאית", () => {
    const input = baseInput({
      lines: [line({ productId: "a", unitPriceAgorot: 1000, categoryId: "cat-x" }), line({ productId: "b", unitPriceAgorot: 2000, categoryId: "cat-y" })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 1000, eligibleProductIds: [], eligibleCategoryIds: [] })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(300); // 10% מ-3000
    expect(result.lineDiscounts.every((l) => l.lineDiscountAgorot > 0)).toBe(true);
  });

  it("(7) הגבלת מוצר בעגלה מעורבת — רק המוצר הזכאי מקבל הנחה", () => {
    const input = baseInput({
      lines: [line({ productId: "eligible", unitPriceAgorot: 1000 }), line({ productId: "other", unitPriceAgorot: 5000 })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 1000, eligibleProductIds: ["eligible"] })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(100); // 10% מ-1000 בלבד
    expect(result.lineDiscounts).toEqual([
      { productId: "eligible", lineDiscountAgorot: 100 },
      { productId: "other", lineDiscountAgorot: 0 },
    ]);
  });

  it("(8) הגבלת קטגוריה — categoryId null לעולם לא תואם", () => {
    const input = baseInput({
      lines: [
        line({ productId: "in-cat", unitPriceAgorot: 1000, categoryId: "cat-1" }),
        line({ productId: "null-cat", unitPriceAgorot: 1000, categoryId: null }),
        line({ productId: "other-cat", unitPriceAgorot: 1000, categoryId: "cat-2" }),
      ],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 1000, eligibleCategoryIds: ["cat-1"] })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(100);
    expect(result.lineDiscounts).toEqual([
      { productId: "in-cat", lineDiscountAgorot: 100 },
      { productId: "null-cat", lineDiscountAgorot: 0 },
      { productId: "other-cat", lineDiscountAgorot: 0 },
    ]);
  });

  it("(9) minSubtotal נבדק על כל העגלה, אבל ההנחה מחושבת רק על השורות הזכאיות", () => {
    const promo = promotion({
      kind: "PERCENT",
      percentBp: 1000,
      minSubtotalAgorot: 5000,
      eligibleProductIds: ["eligible"],
    });

    const qualifies = baseInput({
      lines: [line({ productId: "eligible", unitPriceAgorot: 1000 }), line({ productId: "other", unitPriceAgorot: 5000 })],
      automaticPromotions: [promo],
    });
    const resultQualifies = evaluatePromotions(qualifies);
    // subtotal כולל = 6000 >= 5000 → המבצע חל, אבל ההנחה רק על 1000 הזכאים.
    expect(resultQualifies.discountAgorot).toBe(100);

    const doesNotQualify = baseInput({
      lines: [line({ productId: "eligible", unitPriceAgorot: 1000 })],
      automaticPromotions: [promo],
    });
    const resultDoesNotQualify = evaluatePromotions(doesNotQualify);
    // subtotal כולל = 1000 < 5000 → המבצע לא חל כלל, למרות שהפריט הזכאי בעגלה.
    expect(resultDoesNotQualify.discountAgorot).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// ערימה (§3, §7 10-13)
// ---------------------------------------------------------------------------

describe("ערימה (stacking)", () => {
  it("(10) האחוז מחושב על unitPriceAgorot (מחיר sale), אין מושג נפרד של מחיר מחירון", () => {
    // unitPriceAgorot כאן *הוא* מחיר המבצע — ה-evaluator לא מודע למחיר מחירון כלל.
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 8000 })], // לדוגמה: מחיר מחירון 10000, כבר לאחר sale 20%
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 1000 })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(800); // 10% מ-8000, לא מ-10000
  });

  it("(11) מבצע אוטומטי יחיד הכי טוב נבחר; תיקו נשבר לפי priority ואז id", () => {
    const cart = [line({ unitPriceAgorot: 10000 })];
    const weaker = promotion({ id: "p-weak", kind: "PERCENT", percentBp: 500 }); // 500
    const stronger = promotion({ id: "p-strong", kind: "FIXED_AMOUNT", amountAgorot: 900 }); // 900
    const result = evaluatePromotions(baseInput({ lines: cart, automaticPromotions: [weaker, stronger] }));
    expect(result.discountAgorot).toBe(900);
    expect(result.appliedPromotions).toHaveLength(1);
    expect(result.appliedPromotions[0]?.id).toBe("p-strong");

    // תיקו בסכום ההנחה — priority גבוה יותר מנצח.
    const tieA = promotion({ id: "p-a", kind: "FIXED_AMOUNT", amountAgorot: 900, priority: 1 });
    const tieB = promotion({ id: "p-b", kind: "FIXED_AMOUNT", amountAgorot: 900, priority: 5 });
    const tieResult = evaluatePromotions(baseInput({ lines: cart, automaticPromotions: [tieA, tieB] }));
    expect(tieResult.appliedPromotions[0]?.id).toBe("p-b");

    // תיקו גם ב-priority — id עולה מנצח.
    const idA = promotion({ id: "z-later", kind: "FIXED_AMOUNT", amountAgorot: 900, priority: 1 });
    const idB = promotion({ id: "a-earlier", kind: "FIXED_AMOUNT", amountAgorot: 900, priority: 1 });
    const idResult = evaluatePromotions(baseInput({ lines: cart, automaticPromotions: [idA, idB] }));
    expect(idResult.appliedPromotions[0]?.id).toBe("a-earlier");
  });

  it("(12) קופון מחושב מעל ה-subtotal הזכאי הפוסט-אוטומטי, לא מעל הסכום המקורי", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 10000 })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 5000 })], // 50% → 5000
      coupon: coupon({}, { kind: "PERCENT", percentBp: 5000 }), // 50% נוסף — אבל מעל 5000 שנותרו
    });
    const result = evaluatePromotions(input);
    // אוטומטי: 50% מ-10000 = 5000. קופון: 50% מ-(10000-5000)=5000 → 2500.
    // סה"כ הנחה = 7500, לא 10000 (שהיה קורה עם הכפלת אחוזים נאיבית על המקור).
    expect(result.discountAgorot).toBe(7500);
    expect(result.appliedPromotions).toHaveLength(2);
  });

  it("(13) משלוח חינם אוטומטי ומבצע מוצרים אוטומטי מתקיימים בו-זמנית (אורתוגונליים)", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 10000 })],
      automaticPromotions: [
        promotion({ id: "merch", kind: "PERCENT", percentBp: 1000 }),
        promotion({ id: "ship", kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 5000 }),
      ],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(1000);
    expect(result.freeShipping).toBe(true);
    expect(result.shippingAgorot).toBe(0);
    expect(result.appliedPromotions.map((p) => p.id).sort()).toEqual(["merch", "ship"]);
  });
});

// ---------------------------------------------------------------------------
// משלוח (§3, §7 14-16)
// ---------------------------------------------------------------------------

describe("משלוח", () => {
  it("(14) הסף נבדק על subtotal טרום-הנחה — נשמר גם אחרי שקופון מוריד מתחתיו", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 10000 })],
      automaticPromotions: [promotion({ kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 9000 })],
      coupon: coupon({}, { kind: "FIXED_AMOUNT", amountAgorot: 8000 }), // מותיר subtotal נטו רק 2000
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    const result = evaluatePromotions(input);
    // subtotal טרום-הנחה = 10000 >= 9000 → משלוח חינם נשאר, למרות שאחרי ההנחה נשארו רק 2000.
    expect(result.freeShipping).toBe(true);
    expect(result.shippingAgorot).toBe(0);
  });

  it("(15) מתחת לסף / PICKUP=0", () => {
    const belowThreshold = baseInput({
      lines: [line({ unitPriceAgorot: 1000 })],
      automaticPromotions: [promotion({ kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 9000 })],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    const resultBelow = evaluatePromotions(belowThreshold);
    expect(resultBelow.freeShipping).toBe(false);
    expect(resultBelow.shippingAgorot).toBe(4000);

    const pickup = baseInput({
      lines: [line({ unitPriceAgorot: 1000 })],
      shipping: { method: "PICKUP", feeAgorot: 0 },
    });
    const resultPickup = evaluatePromotions(pickup);
    expect(resultPickup.shippingAgorot).toBe(0);
  });

  it("(16) minSubtotal של משלוח חינם נבדק טרום-הנחה", () => {
    const exactlyAtGate = baseInput({
      lines: [line({ unitPriceAgorot: 9000 })],
      automaticPromotions: [promotion({ kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 9000 })],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    expect(evaluatePromotions(exactlyAtGate).freeShipping).toBe(true);

    const justBelowGate = baseInput({
      lines: [line({ unitPriceAgorot: 8999 })],
      automaticPromotions: [promotion({ kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 9000 })],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    expect(evaluatePromotions(justBelowGate).freeShipping).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// רצפות/תקרות (§2, §3, §7 17-20)
// ---------------------------------------------------------------------------

describe("רצפות ותקרות", () => {
  it("(17) קבוע גדול מה-subtotal הזכאי נעצר בתקרת ה-subtotal", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 9000 })],
      automaticPromotions: [promotion({ kind: "FIXED_AMOUNT", amountAgorot: 15000 })],
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(9000);
    expect(result.subtotalAgorot - result.discountAgorot).toBe(0);
  });

  it("(18) קבוע מלא + משלוח חינם → total = 0", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      automaticPromotions: [
        promotion({ id: "merch", kind: "FIXED_AMOUNT", amountAgorot: 5000 }),
        promotion({ id: "ship", kind: "FREE_SHIPPING", freeShippingMinSubtotalAgorot: 0 }),
      ],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    const result = evaluatePromotions(input);
    expect(result.totalAgorot).toBe(0);
  });

  it("(19) סט זכאות ריק (אין חפיפה עם העגלה) → הנחה 0 + סיבת דחייה", () => {
    const input = baseInput({
      lines: [line({ productId: "in-cart", unitPriceAgorot: 5000 })],
      coupon: coupon({}, { kind: "PERCENT", percentBp: 1000, eligibleProductIds: ["not-in-cart"] }),
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections).toEqual([{ code: "COUPON_NO_ELIGIBLE_ITEMS", reason: expect.any(String) }]);
  });

  it("(20) הנחה של 100% → total = דמי המשלוח בלבד", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      automaticPromotions: [promotion({ kind: "PERCENT", percentBp: 10000 })],
      shipping: { method: "DELIVERY", feeAgorot: 4000 },
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(5000);
    expect(result.totalAgorot).toBe(4000);
  });
});

// ---------------------------------------------------------------------------
// תוקף/דחייה של קופון (§4, §5, §7 21-28)
// ---------------------------------------------------------------------------

describe("תוקף ודחיית קופון", () => {
  it("(21) קופון שפג תוקפו נדחה", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: coupon({ expiresAt: new Date("2026-01-01T00:00:00.000Z") }, { kind: "FIXED_AMOUNT", amountAgorot: 1000 }),
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections[0]?.code).toBe("COUPON_EXPIRED");
  });

  it("(22) קופון שעדיין לא נכנס לתוקף נדחה", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: coupon({ startsAt: new Date("2027-01-01T00:00:00.000Z") }, { kind: "FIXED_AMOUNT", amountAgorot: 1000 }),
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections[0]?.code).toBe("COUPON_NOT_STARTED");
  });

  it("(23) קופון לא פעיל (ברמת הקופון או ברמת המבצע) נדחה", () => {
    const inactiveCoupon = evaluatePromotions(
      baseInput({
        lines: [line({ unitPriceAgorot: 5000 })],
        coupon: coupon({ active: false }, { kind: "FIXED_AMOUNT", amountAgorot: 1000 }),
      }),
    );
    expect(inactiveCoupon.rejections[0]?.code).toBe("COUPON_INACTIVE");

    const inactivePromotion = evaluatePromotions(
      baseInput({
        lines: [line({ unitPriceAgorot: 5000 })],
        coupon: coupon({}, { kind: "FIXED_AMOUNT", amountAgorot: 1000, active: false }),
      }),
    );
    expect(inactivePromotion.rejections[0]?.code).toBe("COUPON_INACTIVE");
  });

  it("(24) תקרת שימוש כוללת שהושגה נדחית", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: coupon({ usageLimit: 10 }, { kind: "FIXED_AMOUNT", amountAgorot: 1000 }),
      usage: { couponTotalUsed: 10, couponPerCustomerUsed: 0 },
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections[0]?.code).toBe("COUPON_USAGE_LIMIT_REACHED");
  });

  it("(25) תקרת שימוש ללקוח שהושגה נדחית", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: coupon({ perCustomerLimit: 1 }, { kind: "FIXED_AMOUNT", amountAgorot: 1000 }),
      usage: { couponTotalUsed: 0, couponPerCustomerUsed: 1 },
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections[0]?.code).toBe("COUPON_PER_CUSTOMER_LIMIT_REACHED");
  });

  it("(26) נורמליזציית אימייל — trim + lowercase, עקבי לאורח ולרשום כאחד", () => {
    expect(normalizeEmail("  Foo@Example.COM  ")).toBe("foo@example.com");
    expect(normalizeEmail("Already@Normal.com")).toBe("already@normal.com");
    expect(normalizeEmail("nochange@x.com")).toBe("nochange@x.com");
    expect(normalizeEmail("\tTabbed@X.COM\n")).toBe("tabbed@x.com");
  });

  it("(27) מבצע עם appliesTo=COURSES מוחרג משימוש בחנות", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: coupon({}, { kind: "FIXED_AMOUNT", amountAgorot: 1000, appliesTo: "COURSES" }),
    });
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections[0]?.code).toBe("COUPON_APPLIES_TO_NOT_SHOP");
  });

  it("(28) קוד לא מוכר (coupon: null) — נתיב ריק, בלי לזרוק שגיאה", () => {
    const input = baseInput({
      lines: [line({ unitPriceAgorot: 5000 })],
      coupon: null,
    });
    expect(() => evaluatePromotions(input)).not.toThrow();
    const result = evaluatePromotions(input);
    expect(result.discountAgorot).toBe(0);
    expect(result.rejections).toEqual([]);
    expect(result.appliedPromotions).toEqual([]);
    expect(result.totalAgorot).toBe(result.subtotalAgorot + result.shippingAgorot);
  });
});
