import { test, expect } from "@playwright/test";

/**
 * בדיקת פריסה ויזואלית RTL מול LTR — הרכיבים הצפים (`floating-contact.tsx`,
 * `accessibility-menu.tsx`) משתמשים ב-CSS logical properties (`start-4`/
 * `end-4`) שאמורות להתחלף צד אוטומטית לפי `dir`, וכותרת המובייל הופכת
 * כיווניות (site-header.tsx, ראה Session Log 2026-06-23). כאן מוודאים
 * שההיפוך אכן קורה בפועל בדפדפן, לא רק בקוד.
 */

test.describe("Floating widgets mirror correctly between RTL and LTR", () => {
  test("Hebrew (RTL): accessibility button on the right, contact buttons on the left", async ({
    page,
  }) => {
    await page.goto("/");
    const a11yButton = page.getByRole("button", { name: /נגישות/i });
    const contactLink = page.getByRole("link", { name: /whatsapp|וואטסאפ/i }).first();

    const a11yBox = await a11yButton.boundingBox();
    const contactBox = await contactLink.boundingBox();
    expect(a11yBox).not.toBeNull();
    expect(contactBox).not.toBeNull();

    // start-4 ב-RTL = ימין; end-4 ב-RTL = שמאל.
    expect(a11yBox!.x).toBeGreaterThan(contactBox!.x);
  });

  test("English (LTR): accessibility button on the left, contact buttons on the right", async ({
    page,
  }) => {
    await page.goto("/en");
    const a11yButton = page.getByRole("button", { name: /accessibility/i });
    const contactLink = page.getByRole("link", { name: /whatsapp/i }).first();

    const a11yBox = await a11yButton.boundingBox();
    const contactBox = await contactLink.boundingBox();
    expect(a11yBox).not.toBeNull();
    expect(contactBox).not.toBeNull();

    // start-4 ב-LTR = שמאל; end-4 ב-LTR = ימין.
    expect(a11yBox!.x).toBeLessThan(contactBox!.x);
  });
});

test.describe("Mobile header order flips between RTL and LTR", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("Hebrew (RTL, mobile): logo on the left, hamburger on the right", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("link", { name: /ReStyle/i }).first();
    const menuButton = page.getByRole("button", { name: "פתיחת תפריט", exact: true });

    const logoBox = await logo.boundingBox();
    const menuBox = await menuButton.boundingBox();
    expect(logoBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    expect(logoBox!.x).toBeLessThan(menuBox!.x);
  });

  test("English (LTR, mobile): hamburger on the left, logo on the right", async ({ page }) => {
    await page.goto("/en");
    const logo = page.getByRole("link", { name: /ReStyle/i }).first();
    const menuButton = page.getByRole("button", { name: "Open menu", exact: true });

    const logoBox = await logo.boundingBox();
    const menuBox = await menuButton.boundingBox();
    expect(logoBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    expect(menuBox!.x).toBeLessThan(logoBox!.x);
  });
});
