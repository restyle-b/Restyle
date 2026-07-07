import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

// שימוש בכרום שכבר מותקן בסביבה (ראה AGENTS/README) במקום הורדה מחדש —
// נופל בחזרה ל-executable המנוהל של Playwright אם הנתיב לא קיים (לדוגמה
// בסביבת פיתוח אחרת מהסנדבוקס הזה).
const bundledChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(bundledChromium) ? bundledChromium : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    locale: "he-IL",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "chromium" }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      // ⚠️ mock provider חסום ב-production כברירת מחדל (fail-closed, ראה
      // mock-allowed.ts) — נדרש אישור מפורש רק בתהליך ה-e2e המקומי הזה,
      // לא בסביבת Vercel של המשתמש (ראה .env.example).
      ALLOW_MOCK_CHECKOUT: "true",
    },
  },
});
