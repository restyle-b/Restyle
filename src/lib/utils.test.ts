import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("ממזג מחלקות ומסיר כפילויות Tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("מטפל בערכים מותנים", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
