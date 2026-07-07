import { describe, expect, it } from "vitest";
import { jerusalemDatetimeLocalToUtc, utcToJerusalemDatetimeLocal } from "./course-datetime";

describe("course-datetime (Jerusalem ⇄ UTC round-trip)", () => {
  it("round-trips a winter (standard time, UTC+2) datetime-local value", () => {
    const local = "2026-01-15T10:30";
    const utc = jerusalemDatetimeLocalToUtc(local);
    // ינואר = שעון חורף (UTC+2) — 10:30 בישראל = 08:30 UTC.
    expect(utc.toISOString()).toBe("2026-01-15T08:30:00.000Z");
    expect(utcToJerusalemDatetimeLocal(utc)).toBe(local);
  });

  it("round-trips a summer (daylight saving, UTC+3) datetime-local value", () => {
    const local = "2026-07-15T10:30";
    const utc = jerusalemDatetimeLocalToUtc(local);
    // יולי = שעון קיץ (UTC+3) — 10:30 בישראל = 07:30 UTC.
    expect(utc.toISOString()).toBe("2026-07-15T07:30:00.000Z");
    expect(utcToJerusalemDatetimeLocal(utc)).toBe(local);
  });

  it("round-trips midnight and end-of-day boundary values", () => {
    for (const local of ["2026-03-01T00:00", "2026-11-30T23:59"]) {
      const utc = jerusalemDatetimeLocalToUtc(local);
      expect(utcToJerusalemDatetimeLocal(utc)).toBe(local);
    }
  });

  it("throws on malformed input", () => {
    expect(() => jerusalemDatetimeLocalToUtc("not-a-date")).toThrow();
    expect(() => jerusalemDatetimeLocalToUtc("2026-01-15 10:30")).toThrow();
  });
});
