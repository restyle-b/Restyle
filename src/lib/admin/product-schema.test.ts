import { describe, it, expect } from "vitest";
import { jerusalemLocalToUtc, utcToJerusalemLocal } from "@/lib/admin/product-schema";

describe("jerusalemLocalToUtc / utcToJerusalemLocal", () => {
  it("מחזיר null עבור קלט ריק", () => {
    expect(jerusalemLocalToUtc("")).toBeNull();
    expect(jerusalemLocalToUtc(undefined)).toBeNull();
    expect(jerusalemLocalToUtc(null)).toBeNull();
    expect(utcToJerusalemLocal(null)).toBe("");
    expect(utcToJerusalemLocal(undefined)).toBe("");
  });

  it("ממיר שעון קיץ (DST) בישראל ל-UTC בהיסט הנכון (+3)", () => {
    // 6 ביולי 2026, 14:30 שעון ישראל (קיץ) => 11:30 UTC.
    const utc = jerusalemLocalToUtc("2026-07-06T14:30");
    expect(utc).not.toBeNull();
    expect(utc!.toISOString()).toBe("2026-07-06T11:30:00.000Z");
  });

  it("ממיר שעון חורף בישראל ל-UTC בהיסט הנכון (+2)", () => {
    // 15 בינואר 2026, 09:00 שעון ישראל (חורף) => 07:00 UTC.
    const utc = jerusalemLocalToUtc("2026-01-15T09:00");
    expect(utc).not.toBeNull();
    expect(utc!.toISOString()).toBe("2026-01-15T07:00:00.000Z");
  });

  it("מבצע round-trip נכון הלוך ושוב (קיץ)", () => {
    const original = "2026-07-06T14:30";
    const utc = jerusalemLocalToUtc(original);
    expect(utcToJerusalemLocal(utc)).toBe(original);
  });

  it("מבצע round-trip נכון הלוך ושוב (חורף)", () => {
    const original = "2026-01-15T09:00";
    const utc = jerusalemLocalToUtc(original);
    expect(utcToJerusalemLocal(utc)).toBe(original);
  });

  it("לא נשבר סביב מעבר שעון קיץ בישראל (2026: יום שישי 27.3, השעון קופץ מ-02:00 ל-03:00)", () => {
    // רגע לפני המעבר — עדיין שעון חורף (+2).
    const beforeTransition = jerusalemLocalToUtc("2026-03-27T01:30");
    expect(beforeTransition!.toISOString()).toBe("2026-03-26T23:30:00.000Z");
    expect(utcToJerusalemLocal(beforeTransition)).toBe("2026-03-27T01:30");

    // אחרי המעבר, אותו יום — כבר שעון קיץ (+3).
    const afterTransition = jerusalemLocalToUtc("2026-03-27T10:00");
    expect(afterTransition!.toISOString()).toBe("2026-03-27T07:00:00.000Z");
    expect(utcToJerusalemLocal(afterTransition)).toBe("2026-03-27T10:00");
  });

  it("מחזיר null עבור מחרוזת לא תקינה", () => {
    expect(jerusalemLocalToUtc("not-a-date")).toBeNull();
  });
});
