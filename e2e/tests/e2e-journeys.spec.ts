import { test, expect } from "../fixtures";

test.describe("End-to-End User Journey - New Student Booking", () => {
  test("complete flow: visit → browse → select package → book", async ({ page }) => {
    // Step 1: Land on homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header")).toBeVisible();

    // Step 2: Browse packages
    const coursesLink = page.locator("header").getByRole("link", { name: /courses|kurslar/i });
    if (await coursesLink.isVisible()) {
      await coursesLink.click();
      await page.waitForTimeout(800);
    }

    const courses = page.locator("#courses");
    await courses.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(courses).toBeVisible();

    // Step 3: View gallery for inspiration
    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(gallery).toBeVisible();

    // Step 4: Navigate to booking
    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Step 5: Fill out booking form
    await booking.locator('input[type="text"]').fill("Maria Schmidt");
    await booking.locator('input[type="email"]').fill("maria@example.com");
    await booking.locator('input[type="tel"]').fill("+49 170 123 4567");
    await booking.locator("select").first().selectOption("en");

    // Select a package
    const packageSelect = booking.locator("select").nth(1);
    const options = await packageSelect.locator("option").allTextContents();
    if (options.length > 1) {
      await packageSelect.selectOption({ index: 1 });
    }

    await booking.locator("textarea").fill("Looking forward to my first art class!");

    // Step 6: Submit
    await booking.locator('button[type="submit"]').click();

    // Step 7: Verify success
    await expect(booking.getByText(/🎉|success|başarı|успеш/i)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("End-to-End User Journey - Language Discovery", () => {
  test("Russian speaker discovers the site and books in Russian", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Switch to Russian
    await page.locator("header").getByText("RU").click();
    await page.waitForTimeout(500);

    // Verify Russian content appears
    await expect(page.getByText(/Студия|Искусств|Творчес/i).first()).toBeVisible();

    // Navigate to booking
    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();

    // Fill form
    await booking.locator('input[type="text"]').fill("Иван Петров");
    await booking.locator('input[type="email"]').fill("ivan@example.ru");
    await booking.locator('input[type="tel"]').fill("+7 900 123 4567");
    await booking.locator("select").first().selectOption("ru");

    await booking.locator('button[type="submit"]').click();

    await expect(booking.getByText(/🎉|success|başarı|успеш/i)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("End-to-End User Journey - Admin Workflow", () => {
  test("admin logs in and views bookings", async ({ page }) => {
    const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "admin";
    const credentials = Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64");

    await page.setExtraHTTPHeaders({ Authorization: `Basic ${credentials}` });

    // Visit admin dashboard
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Should see booking management
    await expect(page.locator("body")).not.toBeEmpty();

    // Navigate to content management
    const contentLink = page.getByRole("link", { name: /content/i });
    if (await contentLink.isVisible()) {
      await contentLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/admin/content");
    }

    // Navigate to media management
    await page.goto("/admin/media");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/admin/media");
  });

  test("admin manages content across languages", async ({ page }) => {
    const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "admin";
    const credentials = Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64");

    await page.setExtraHTTPHeaders({ Authorization: `Basic ${credentials}` });
    await page.goto("/admin/content");
    await page.waitForLoadState("networkidle");

    // Look for locale switcher in admin
    const localeOptions = page.getByText(/TR|EN|RU/i);
    const count = await localeOptions.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("End-to-End - Cross-Page Navigation", () => {
  test("navigate from homepage to privacy to imprint and back", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Go to privacy
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    const privacyLink = footer.getByRole("link", { name: /privacy|gizlilik/i });
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/privacy");
    } else {
      await page.goto("/privacy");
      await page.waitForLoadState("networkidle");
    }

    // Go to imprint
    await page.goto("/imprint");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/imprint");

    // Go back to homepage
    const homeLink = page.getByRole("link", { name: /home|ana sayfa|Make ?Art/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
    } else {
      await page.goto("/");
    }
    await page.waitForURL(/\/$/);
    expect(page.url()).not.toContain("/imprint");
  });
});
