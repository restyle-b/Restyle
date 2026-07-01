import { test, expect } from "@playwright/test";

/**
 * QA רב-לשוני (Stage 2) — הפריט הפתוח האחרון ברודמאפ. מכסה: dir/lang נכונים
 * לכל שפה, מעבר שפה חי דרך LocaleSwitcher, והיעדר קישורי "חלופה ב'"
 * (חנות/התחברות) שלא נמכרה במסלול הבסיס.
 */

const LOCALES = [
  { code: "he", prefix: "", dir: "rtl" },
  { code: "en", prefix: "/en", dir: "ltr" },
  { code: "ar", prefix: "/ar", dir: "rtl" },
] as const;

const MARKETING_PATHS = [
  "",
  "/about",
  "/services",
  "/gallery",
  "/academy",
  "/locations",
  "/contact",
  "/accessibility",
  "/privacy",
  "/terms",
];

for (const { code, prefix, dir } of LOCALES) {
  test.describe(`locale: ${code}`, () => {
    test(`home page has correct lang/dir`, async ({ page }) => {
      const response = await page.goto(`${prefix}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", code);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
    });

    test(`no shop/login links in nav`, async ({ page }) => {
      await page.goto(`${prefix}/`);
      const nav = page.locator("nav").first();
      await expect(nav.getByRole("link", { name: /shop|חנות|متجر/i })).toHaveCount(0);
      await expect(nav.getByRole("link", { name: /login|התחבר|تسجيل/i })).toHaveCount(0);
    });

    test(`all marketing pages return 200`, async ({ page, request, baseURL }) => {
      for (const path of MARKETING_PATHS) {
        const url = `${baseURL}${prefix}${path || "/"}`;
        const response = await request.get(url);
        expect(response.status(), `${url} should be 200`).toBe(200);
      }
    });
  });
}

test.describe("LocaleSwitcher", () => {
  test("switching locale updates URL, lang and dir live", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    const switcher = page.getByRole("group", { name: /language|שפה|لغة/i });
    await switcher.getByRole("button", { name: "en" }).click();
    await expect(page).toHaveURL(/\/en(\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await switcher.getByRole("button", { name: "ar" }).click();
    await expect(page).toHaveURL(/\/ar(\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await switcher.getByRole("button", { name: "he" }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3100\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
  });
});
