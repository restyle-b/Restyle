import { test, expect } from "@playwright/test";

/**
 * מסלול checkout מלא לאורח: הוספה לעגלה → מילוי טופס → mock-pay → success.
 * דורש PAYMENT_PROVIDER=mock + ALLOW_MOCK_CHECKOUT=true (מוגדר ב-
 * playwright.config.ts webServer.env — לא נוגע בסביבת Vercel של המשתמש).
 * המוצר `e2e-product` נזרע מראש ב-DB המקומי הייעודי לבדיקות (ראה README/
 * הרצת הבדיקות).
 */
test("צ'קאאוט אורח מלא — עד עמוד הצלחה עם מספר הזמנה", async ({ page }) => {
  await page.goto("/shop/e2e-product");
  await expect(page.getByRole("heading", { name: "מוצר בדיקה" })).toBeVisible();

  await page.getByRole("button", { name: "הוספה לעגלה", exact: true }).click();

  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "מוצר בדיקה" })).toBeVisible();
  await page.getByRole("link", { name: "מעבר לתשלום" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel("שם מלא").fill("Playwright E2E");
  await page.getByLabel("אימייל").fill("playwright-e2e@restyle.test");
  await page.getByLabel("טלפון").fill("0501234567");

  await page.getByRole("button", { name: "מעבר לתשלום" }).click();

  await expect(page).toHaveURL(/\/checkout\/mock-pay/);
  await page.getByRole("button", { name: "סימולציית תשלום מוצלח" }).click();

  await expect(page).toHaveURL(/\/checkout\/success/);
  await expect(page.getByText("התשלום התקבל בהצלחה")).toBeVisible();
  await expect(page.getByText("מספר הזמנה")).toBeVisible();
});
