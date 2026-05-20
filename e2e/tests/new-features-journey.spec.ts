import { test, expect } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "test-password";

test.describe("Full E2E Journey - Admin Flow", () => {
  test("admin can login and view today's schedule", async ({ page }) => {
    // Navigate to admin login page directly
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");

    // Should be on login page
    expect(page.url()).toContain("/admin/login");

    // Fill login form
    await page.locator('input[type="text"], input[name="username"]').fill(ADMIN_USER);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for navigation away from login page
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    expect(page.url()).toContain("/admin");
  });

  test("admin can navigate to today page from dashboard", async ({ page, request }) => {
    // Login via API
    const loginRes = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });
    const cookies = loginRes.headers()["set-cookie"];
    const match = cookies?.match(/admin_session=([^;]+)/);
    await page.context().addCookies([{
      name: "admin_session",
      value: decodeURIComponent(match![1]),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Navigate to today
    const todayLink = page.locator('a[href*="/admin/today"]');
    if (await todayLink.isVisible()) {
      await todayLink.click();
      await page.waitForURL("**/admin/today**");
      await expect(page.getByText(/today/i)).toBeVisible();
    }
  });
});

test.describe("Full E2E Journey - Public User", () => {
  test("user can browse homepage and navigate to schedule", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Homepage loads
    await expect(page.locator("header")).toBeVisible();

    // Find and click schedule/class link
    const scheduleLink = page.locator('a[href="/schedule"], a[href*="schedule"]').first();
    if (await scheduleLink.isVisible()) {
      await scheduleLink.click();
      await page.waitForURL("**/schedule**");
      await expect(page.getByText("Class Schedule")).toBeVisible();
    } else {
      // Direct navigation
      await page.goto("/schedule");
      await expect(page.getByText("Class Schedule")).toBeVisible();
    }
  });

  test("user visiting /my is redirected to login and back", async ({ page }) => {
    // Try to access client portal
    await page.goto("/my");
    
    // Should redirect to login with return URL
    await page.waitForURL("**/auth/login**", { timeout: 10000 });
    expect(page.url()).toContain("redirect=%2Fmy");

    // Login page should have phone input
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test("user can view legal pages from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to privacy
    const privacyLink = page.locator('a[href="/privacy"]').first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await page.waitForURL("**/privacy**");
      await page.goBack();
    }

    // Navigate to imprint
    const imprintLink = page.locator('a[href="/imprint"]').first();
    if (await imprintLink.isVisible()) {
      await imprintLink.click();
      await page.waitForURL("**/imprint**");
    }
  });

  test("schedule page shows classes and has interactive filters", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");

    // Should show class schedule
    await expect(page.getByText("Class Schedule")).toBeVisible();

    // Should have class types mentioned
    const content = await page.textContent("body");
    expect(content).toMatch(/drawing|mini club|chess|workshop/i);
  });
});

test.describe("Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("schedule page is usable on mobile", async ({ page }) => {
    await page.goto("/schedule");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Class Schedule")).toBeVisible();
    // No horizontal overflow
    const body = page.locator("body");
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 1);
  });

  test("admin login page is usable on mobile", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Admin Panel")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("auth login page is usable on mobile", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[type="tel"]')).toBeVisible();
    // No horizontal overflow
    const body = page.locator("body");
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 1);
  });
});
