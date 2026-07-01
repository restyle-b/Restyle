import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * בסביבת הפיתוח (sandbox) יש כרום מותקן מראש בנתיב קבוע — נעדיף אותו כדי
 * לחסוך הורדה. אם הוא לא קיים (למשל ב-CI רגיל), נופלים חזרה לברירת המחדל
 * של Playwright (דורש `npx playwright install chromium`, ראה ci.yml).
 */
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    // he-IL — קהל היעד האמיתי; מבטיח שנתיב "/" ללא prefix (ברירת המחדל,
    // localePrefix "as-needed") ינותב בפועל לעברית ולא ל-en לפי Accept-Language
    // כברירת מחדל של הדפדפן.
    locale: "he-IL",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
