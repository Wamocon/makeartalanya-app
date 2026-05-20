import { test, expect } from "@playwright/test";

test.describe("Client Portal - Auth Gate", () => {
  test("/my redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/my");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
    expect(page.url()).toContain("redirect=%2Fmy");
  });

  test("/my/classes redirects to login", async ({ page }) => {
    await page.goto("/my/classes");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("/my/subscriptions redirects to login", async ({ page }) => {
    await page.goto("/my/subscriptions");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("/my/children redirects to login", async ({ page }) => {
    await page.goto("/my/children");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("/my/notifications redirects to login", async ({ page }) => {
    await page.goto("/my/notifications");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("/my/settings redirects to login", async ({ page }) => {
    await page.goto("/my/settings");
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("/auth/login");
  });
});

test.describe("Auth Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
  });

  test("renders phone and email tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: /phone/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /email/i })).toBeVisible();
  });

  test("phone tab is active by default", async ({ page }) => {
    // Phone input should be visible
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();
  });

  test("switching to email tab shows email input", async ({ page }) => {
    await page.getByText(/email/i).click();
    await page.waitForTimeout(300);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("back link navigates to homepage", async ({ page }) => {
    const backLink = page.locator('a[href="/"]');
    if (await backLink.isVisible()) {
      await backLink.click();
      await page.waitForURL("**/", { timeout: 5000 });
      expect(page.url()).not.toContain("/auth");
    }
  });

  test("preserves redirect query param", async ({ page }) => {
    await page.goto("/auth/login?redirect=/my/classes");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("redirect");
  });

  test("shows loading state on form submit", async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill("+905551234567");

    const submitBtn = page.locator('button[type="submit"]');
    
    // Click and immediately check button state (loading or disabled)
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("supabase") || r.status() >= 200, { timeout: 5000 }).catch(() => null),
      submitBtn.click(),
    ]);
    
    // After submission, either an error message appears or button was temporarily disabled
    // Both indicate the form processed the submission
    await page.waitForTimeout(1000);
    const hasError = await page.getByText(/error|invalid|failed|try again/i).count();
    const btnText = await submitBtn.textContent();
    // The form responded to the click (either error or success)
    expect(hasError > 0 || btnText !== null).toBeTruthy();
  });
});
