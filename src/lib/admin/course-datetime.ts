// המרת תאריך/שעה בין קלט <input type="datetime-local"> (שעון ישראל, ללא TZ
// בקלט עצמו) לבין UTC (מאוחסן ב-DB) ובחזרה — לשדה Course.publishAt.
// ⚠️ הבאג #1 הצפוי (per m3-catalog-plan.md "Risk callouts"): לעולם לא `new
// Date(str)` ישירות על מחרוזת datetime-local — הדפדפן/Node יפרש אותה כ-UTC
// או כשעון מקומי של השרת (תלוי סביבה), לא כשעון ישראל. הפונקציות כאן
// משתמשות ב-Intl.DateTimeFormat כדי לחשב את ה-offset בפועל של Asia/Jerusalem
// (מתחשב אוטומטית ב-DST/שעון קיץ).

const JERUSALEM_TZ = "Asia/Jerusalem";
const DATETIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** offset בדקות כך ש: זמן-מקומי = utc + offset (כלומר UTC = local - offset). */
function getTimeZoneOffsetMinutes(utcMillis: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMillis));
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUtc - utcMillis) / 60_000;
}

/**
 * ממיר מחרוזת datetime-local ("YYYY-MM-DDTHH:mm", נפרשת כשעון-קיר של ישראל)
 * ל-Date (UTC). זורק אם הפורמט לא תקין — ולידציה מלאה כבר קרתה ב-zod לפני כן.
 */
export function jerusalemDatetimeLocalToUtc(datetimeLocal: string): Date {
  const match = DATETIME_LOCAL_PATTERN.exec(datetimeLocal);
  if (!match) {
    throw new Error(`jerusalemDatetimeLocalToUtc: invalid format "${datetimeLocal}"`);
  }
  const [, year, month, day, hour, minute] = match;
  // ניחוש ראשוני: התייחסות לרכיבים כאילו הם UTC, כדי לקבל נקודת זמן לחישוב offset.
  const naiveUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0);
  const offset1 = getTimeZoneOffsetMinutes(naiveUtc, JERUSALEM_TZ);
  let utcMillis = naiveUtc - offset1 * 60_000;
  // מעבר שני — מתקן מקרי-קצה סביב מעבר שעון קיץ/חורף (offset עשוי להשתנות
  // כשמזיזים את הזמן ב-offset1 דקות).
  const offset2 = getTimeZoneOffsetMinutes(utcMillis, JERUSALEM_TZ);
  if (offset2 !== offset1) {
    utcMillis = naiveUtc - offset2 * 60_000;
  }
  return new Date(utcMillis);
}

/** ממיר Date (UTC) למחרוזת datetime-local לפי שעון ישראל, להצגה בטופס העריכה. */
export function utcToJerusalemDatetimeLocal(date: Date): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: JERUSALEM_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}
