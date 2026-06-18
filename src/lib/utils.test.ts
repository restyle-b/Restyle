import { describe, it, expect } from "vitest";
import { cn, safeRedirectPath } from "@/lib/utils";

describe("cn", () => {
  it("ממזג מחלקות ומסיר כפילויות Tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("מטפל בערכים מותנים", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

describe("safeRedirectPath", () => {
  it("מקבל נתיב יחסי תקין", () => {
    expect(safeRedirectPath("/account", "/login")).toBe("/account");
  });

  it("חוסם open redirect דרך protocol-relative URL", () => {
    expect(safeRedirectPath("//evil.com", "/login")).toBe("/login");
  });

  it("חוסם URL מוחלט חיצוני", () => {
    expect(safeRedirectPath("https://evil.com", "/login")).toBe("/login");
  });

  it("חוזר ל-fallback כשערך ריק/null", () => {
    expect(safeRedirectPath(null, "/login")).toBe("/login");
    expect(safeRedirectPath("", "/login")).toBe("/login");
  });
});
