import { describe, it, expect } from "vitest";
import {
  percentToBp,
  bpToPercentInput,
  shekelsToAgorotOrNull,
  agorotToShekelsInput,
  intInputToNullable,
  promotionDetailsSchema,
  couponDetailsSchema,
  generateCouponsSchema,
  simpleCouponSchema,
} from "@/lib/admin/promotion-schema";

describe("percentToBp / bpToPercentInput", () => {
  it("ממיר אחוז שלם לנקודות בסיס", () => {
    expect(percentToBp("10")).toBe(1000);
    expect(bpToPercentInput(1000)).toBe("10");
  });

  it("ממיר אחוז עשרוני לנקודות בסיס (10.5% → 1050)", () => {
    expect(percentToBp("10.5")).toBe(1050);
    expect(bpToPercentInput(1050)).toBe("10.5");
  });

  it("מבצע round-trip הלוך ושוב", () => {
    for (const percent of ["0", "5", "12.5", "100"]) {
      const bp = percentToBp(percent);
      expect(bpToPercentInput(bp)).toBe(percent);
    }
  });

  it("null/undefined → מחרוזת ריקה", () => {
    expect(bpToPercentInput(null)).toBe("");
    expect(bpToPercentInput(undefined)).toBe("");
  });
});

describe("shekelsToAgorotOrNull / agorotToShekelsInput", () => {
  it("ממיר שקלים לאגורות, מעגל לשלם", () => {
    expect(shekelsToAgorotOrNull("50")).toBe(5000);
    expect(shekelsToAgorotOrNull("50.5")).toBe(5050);
  });

  it("מחרוזת ריקה/undefined → null", () => {
    expect(shekelsToAgorotOrNull("")).toBeNull();
    expect(shekelsToAgorotOrNull(undefined)).toBeNull();
  });

  it("null/undefined אגורות → מחרוזת ריקה", () => {
    expect(agorotToShekelsInput(null)).toBe("");
    expect(agorotToShekelsInput(undefined)).toBe("");
  });

  it("מבצע round-trip נכון מבחינה מספרית (עשרוני תמיד מוצג בשתי ספרות, כמו formatShekels בשאר האדמין)", () => {
    for (const shekels of ["10", "50.5", "199.99"]) {
      const agorot = shekelsToAgorotOrNull(shekels);
      expect(Number(agorotToShekelsInput(agorot))).toBe(Number(shekels));
    }
  });

  it("שלם מוצג בלי עשרוניות, לא-שלם מוצג בשתי ספרות", () => {
    expect(agorotToShekelsInput(1000)).toBe("10");
    expect(agorotToShekelsInput(5050)).toBe("50.50");
  });
});

describe("intInputToNullable", () => {
  it("מחרוזת ריקה → null", () => {
    expect(intInputToNullable("")).toBeNull();
    expect(intInputToNullable(undefined)).toBeNull();
  });
  it("מחרוזת מספר → Int", () => {
    expect(intInputToNullable("5")).toBe(5);
  });
});

describe("promotionDetailsSchema", () => {
  const base = {
    name: "מבצע קיץ",
    description: "",
    automatic: true,
    appliesTo: "SHOP" as const,
    percentInput: "",
    amountShekels: "",
    freeShippingMinSubtotalShekels: "",
    minSubtotalShekels: "",
    appliesToSaleItems: true,
    startsAt: "",
    endsAt: "",
    active: true,
  };

  it("PERCENT דורש percentInput תקין", () => {
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "PERCENT", percentInput: "" }).success).toBe(false);
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "PERCENT", percentInput: "10" }).success).toBe(true);
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "PERCENT", percentInput: "150" }).success).toBe(false);
  });

  it("FIXED_AMOUNT דורש amountShekels", () => {
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "FIXED_AMOUNT", amountShekels: "" }).success).toBe(
      false,
    );
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "FIXED_AMOUNT", amountShekels: "50" }).success).toBe(
      true,
    );
  });

  it("FREE_SHIPPING לא דורש שדה כסף (ריק = ללא סף)", () => {
    expect(promotionDetailsSchema.safeParse({ ...base, kind: "FREE_SHIPPING" }).success).toBe(true);
  });

  it("דוחה endsAt לפני startsAt", () => {
    const result = promotionDetailsSchema.safeParse({
      ...base,
      kind: "FREE_SHIPPING",
      startsAt: "2026-08-01T00:00",
      endsAt: "2026-07-01T00:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("couponDetailsSchema", () => {
  it("דוחה קוד קצר מדי או עם תווים לא חוקיים", () => {
    expect(couponDetailsSchema.safeParse({ code: "AB", active: true }).success).toBe(false);
    expect(couponDetailsSchema.safeParse({ code: "קוד-בעברית", active: true }).success).toBe(false);
  });

  it("מקבל קוד תקין", () => {
    expect(couponDetailsSchema.safeParse({ code: "SUMMER10", active: true }).success).toBe(true);
  });

  it("דוחה expiresAt לפני startsAt", () => {
    const result = couponDetailsSchema.safeParse({
      code: "SUMMER10",
      active: true,
      startsAt: "2026-08-01T00:00",
      expiresAt: "2026-07-01T00:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("simpleCouponSchema", () => {
  it("מקבל קופון אחוז בסיסי בלי הגדרות מתקדמות", () => {
    const result = simpleCouponSchema.safeParse({
      code: "friends10",
      discountType: "PERCENT",
      percentInput: "10",
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it("דורש percentInput תקין כש-discountType=PERCENT", () => {
    expect(
      simpleCouponSchema.safeParse({ code: "friends10", discountType: "PERCENT", active: true }).success,
    ).toBe(false);
    expect(
      simpleCouponSchema.safeParse({
        code: "friends10",
        discountType: "PERCENT",
        percentInput: "150",
        active: true,
      }).success,
    ).toBe(false);
  });

  it("דורש amountShekels כש-discountType=FIXED_AMOUNT", () => {
    expect(
      simpleCouponSchema.safeParse({ code: "SAVE20", discountType: "FIXED_AMOUNT", active: true }).success,
    ).toBe(false);
    expect(
      simpleCouponSchema.safeParse({
        code: "SAVE20",
        discountType: "FIXED_AMOUNT",
        amountShekels: "20",
        active: true,
      }).success,
    ).toBe(true);
  });

  it("מקבל הגדרות מתקדמות אופציונליות (תפוגה/סכום מינימום/תקרה/החרגות)", () => {
    const result = simpleCouponSchema.safeParse({
      code: "friends10",
      discountType: "PERCENT",
      percentInput: "10",
      active: true,
      expiresAt: "2026-12-31T00:00",
      minSubtotalShekels: "100",
      usageLimitInput: "50",
      excludedProductIds: ["prod-1", "prod-2"],
    });
    expect(result.success).toBe(true);
  });
});

describe("generateCouponsSchema", () => {
  it("דוחה count מעל 500", () => {
    expect(generateCouponsSchema.safeParse({ count: 501 }).success).toBe(false);
    expect(generateCouponsSchema.safeParse({ count: 500 }).success).toBe(true);
  });

  it("דוחה count מתחת ל-1", () => {
    expect(generateCouponsSchema.safeParse({ count: 0 }).success).toBe(false);
  });

  it("דוחה קידומת עם תווים לא חוקיים", () => {
    expect(generateCouponsSchema.safeParse({ count: 5, prefix: "קיץ" }).success).toBe(false);
    expect(generateCouponsSchema.safeParse({ count: 5, prefix: "SUMMER" }).success).toBe(true);
  });
});
