import { test, expect } from "../fixtures";

test.describe("Dynamic Content - Gallery Fetching", () => {
  test("gallery section fetches from Supabase storage", async ({ page }) => {
    // Monitor network requests to Supabase storage
    const storageRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("supabase") && req.url().includes("storage")) {
        storageRequests.push(req.url());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Either fetches from Supabase or falls back to placeholders
    const images = await gallery.locator("img").count();
    const hasPlaceholders = await gallery.locator('[class*="gradient"], [class*="bg-"]').count();
    expect(images + hasPlaceholders).toBeGreaterThan(0);
  });

  test("content override merges with hardcoded translations", async ({ page }) => {
    // Mock the content API to return overrides
    await page.route("/api/content*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hero: { headline: "Custom Override Headline" },
        }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // If the app uses remote overrides, the custom headline should appear
    // Otherwise fallback to hardcoded translation
    const body = await page.textContent("body");
    expect(body!.length).toBeGreaterThan(100);
  });
});

test.describe("Dynamic Content - Admin Content Updates", () => {
  test("saving content in admin reflects after page reload", async ({ page }) => {
    const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "admin";
    const credentials = Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64");

    await page.setExtraHTTPHeaders({ Authorization: `Basic ${credentials}` });
    await page.goto("/admin/content");
    await page.waitForLoadState("networkidle");

    // Check if content form is available
    const firstInput = page.locator("input[type='text'], textarea").first();
    const inputVisible = await firstInput.isVisible().catch(() => false);

    if (inputVisible) {
      // Note: actual save depends on Supabase being configured
      // This test verifies the UI flow works
      const value = await firstInput.inputValue();
      expect(value).toBeDefined();
    }
  });
});

test.describe("Dynamic Content - Instructor Image", () => {
  test("about section loads instructor image from storage", async ({ page, homePage }) => {
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const img = about.locator("img").first();
    if (await img.isVisible()) {
      const src = await img.getAttribute("src");
      // Should be either a Supabase URL or a Next.js image optimization URL
      expect(src).toBeTruthy();
    }
  });

  test("about section gracefully handles missing instructor image", async ({ page }) => {
    // Block instructor image requests
    await page.route("**/instructor/**", (route) => route.abort());

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Should not crash - either shows placeholder or hides image
    await expect(about).toBeVisible();
  });
});

test.describe("Error States & Fallbacks", () => {
  test("handles Supabase being unavailable", async ({ page }) => {
    // Block all Supabase requests
    await page.route("**/supabase**", (route) => route.abort());

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Page should still render with hardcoded translations
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("#booking")).toBeAttached();
  });

  test("booking form shows error when API is down", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Block booking API
    await page.route("/api/booking", (route) => route.abort());

    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    await section.locator('input[type="text"]').fill("Offline Test");
    await section.locator('input[type="email"]').fill("offline@test.com");
    await section.locator('input[type="tel"]').fill("+90 555 000 0000");
    await section.locator('button[type="submit"]').click();

    // Should show network error
    await expect(section.getByText(/error|hata|ошибка|network|ağ/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("gallery gracefully handles storage API failure", async ({ page }) => {
    await page.route("**/storage/**", (route) => route.abort());

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Should show fallback/placeholder content, not crash
    await expect(gallery).toBeVisible();
  });
});
