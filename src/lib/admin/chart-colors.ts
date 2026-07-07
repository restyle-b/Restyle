/**
 * סקאלה מונוכרומטית לגרפי האדמין (ראו docs/features/platform-upgrade/ux-spec.md
 * סעיף B1) — שלושת העוגנים המדויקים מהספק, בלי תלות בספריית צ'ארטים חדשה
 * (החלטה #10 ב-platform-upgrade.md). שאר הצבעים מחושבים באינטרפולציה ליניארית.
 */
export const CHART_ACCENT_LIGHT = "#e5e5e5";
export const CHART_ACCENT_MID = "#8a8a8a";
export const CHART_ACCENT_DARK = "#5a5a5a";
export const CHART_GRID_COLOR = "#2a2a2a";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * צבע בסקאלה המונוכרומטית לפי דירוג (0 = הכי בהיר) מתוך `total` פריטים —
 * משמש לצביעת עמודות "מוצרים מובילים" לפי דירוג. total<=1 → הצבע הבהיר ביותר.
 */
export function monochromeScale(rank: number, total: number): string {
  if (total <= 1) return CHART_ACCENT_LIGHT;
  const t = Math.min(1, Math.max(0, rank / (total - 1)));
  const light = hexToRgb(CHART_ACCENT_LIGHT);
  const mid = hexToRgb(CHART_ACCENT_MID);
  const dark = hexToRgb(CHART_ACCENT_DARK);
  if (t <= 0.5) {
    const localT = t / 0.5;
    return rgbToHex([
      lerp(light[0], mid[0], localT),
      lerp(light[1], mid[1], localT),
      lerp(light[2], mid[2], localT),
    ]);
  }
  const localT = (t - 0.5) / 0.5;
  return rgbToHex([
    lerp(mid[0], dark[0], localT),
    lerp(mid[1], dark[1], localT),
    lerp(mid[2], dark[2], localT),
  ]);
}
