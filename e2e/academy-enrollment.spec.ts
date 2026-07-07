import { test, expect } from "@playwright/test";

/**
 * מסלול הרשמה לקורס עם תשלום מקדמה: בחירת קורס עם מחיר → טופס הרשמה →
 * mock-pay → success (סטטוס DEPOSIT_PAID, יתרה מוצגת). דורש PAYMENT_PROVIDER
 * =mock + ALLOW_MOCK_CHECKOUT=true (ראה playwright.config.ts). הקורס
 * `e2e-course` נזרע מראש ב-DB המקומי הייעודי לבדיקות (מחיר 1,000₪, מקדמה 20%).
 */
test("הרשמה לקורס עם מקדמה — עד עמוד הצלחה עם יתרה", async ({ page }) => {
  await page.goto("/academy/e2e-course");
  await expect(page.getByRole("heading", { name: "קורס בדיקה" })).toBeVisible();

  await page.getByLabel("שם מלא").fill("Playwright E2E Academy");
  await page.getByLabel("אימייל").fill("playwright-e2e-academy@restyle.test");
  await page.getByLabel("טלפון").fill("0501234567");

  await page.getByRole("radio", { name: /תשלום מקדמה/ }).check();
  await page.getByRole("button", { name: "להרשמה ותשלום" }).click();

  await expect(page).toHaveURL(/\/checkout\/mock-pay/);
  await page.getByRole("button", { name: "סימולציית תשלום מוצלח" }).click();

  await expect(page).toHaveURL(/\/courses\/success/);
  await expect(page.getByText("ההרשמה התקבלה!")).toBeVisible();
  await expect(page.getByText("המקדמה שולמה והמקום שלך שמור")).toBeVisible();
  await expect(page.getByText("מספר הרשמה")).toBeVisible();
  await expect(page.getByText("יתרה לתשלום")).toBeVisible();
});
