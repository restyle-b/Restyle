import { describe, it, expect } from "vitest";
import {
  CHART_ACCENT_DARK,
  CHART_ACCENT_LIGHT,
  CHART_ACCENT_MID,
  monochromeScale,
} from "@/lib/admin/chart-colors";

describe("monochromeScale", () => {
  it("מחזיר את הצבע הבהיר ביותר לדירוג הראשון", () => {
    expect(monochromeScale(0, 5)).toBe(CHART_ACCENT_LIGHT);
  });

  it("מחזיר את הצבע הכהה ביותר לדירוג האחרון", () => {
    expect(monochromeScale(4, 5)).toBe(CHART_ACCENT_DARK);
  });

  it("מחזיר את הצבע האמצעי בדיוק באמצע הסולם", () => {
    expect(monochromeScale(2, 5)).toBe(CHART_ACCENT_MID);
  });

  it("לא קורס כשיש פריט יחיד בלבד", () => {
    expect(monochromeScale(0, 1)).toBe(CHART_ACCENT_LIGHT);
  });
});
