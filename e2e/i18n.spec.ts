import { test, expect } from "@playwright/test";

/**
 * בדיקת i18n בסיסית בשלוש השפות — סוגר את פריט ה-QA הפתוח "Playwright 3 שפות"
 * ברודמאפ (Stage 2). לא בודק תוכן מתורגם מילה-במילה (בוצע ידנית/Lighthouse
 * בעבר) — מוודא שהתשתית (routing/lang/dir/מעבר שפה) עובדת בפועל בדפדפן אמיתי.
 */

const LOCALES = [
  { code: "he", prefix: "", dir: "rtl" },
  { code: "en", prefix: "/en", dir: "ltr" },
  { code: "ar", prefix: "/ar", dir: "rtl" },
] as const;

const CORE_PATHS = [
  "/",
  "/about",
  "/academy",
  "/gallery",
  "/locations",
  "/contact",
  "/accessibility",
  "/privacy",
  "/terms",
  "/shop",
  "/login",
];

for (const locale of LOCALES) {
  test.describe(`locale ${locale.code}`, () => {
    test(`lang/dir נכונים בדף הבית`, async ({ page }) => {
      const response = await page.goto(`${locale.prefix}/`);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("html")).toHaveAttribute("lang", locale.code);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
    });

    test("כל עמודי הליבה מחזירים 200", async ({ page }) => {
      for (const path of CORE_PATHS) {
        const url = `${locale.prefix}${path}`;
        const response = await page.goto(url);
        expect(response?.status(), `${url} should return 200`).toBe(200);
      }
    });
  });
}

test("LocaleSwitcher מחליף שפה בפועל (he → en → ar)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");

  const switcher = page.getByRole("group", { name: /שפה|language|لغة/i });
  await switcher.getByRole("button", { name: "en", exact: true }).click();
  await expect(page).toHaveURL(/\/en(\/)?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

  await page.getByRole("group", { name: /שפה|language|لغة/i }).getByRole("button", { name: "ar", exact: true }).click();
  await expect(page).toHaveURL(/\/ar(\/)?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});
