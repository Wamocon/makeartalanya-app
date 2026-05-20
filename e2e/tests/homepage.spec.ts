import { test, expect } from "../fixtures";

test.describe("Homepage - Full Page Load", () => {
  test("should load the homepage successfully", async ({ page, homePage }) => {
    await expect(page).toHaveTitle(/Make Art/i);
  });

  test("should display all main sections", async ({ page, homePage }) => {
    // Navbar
    await expect(page.locator("header")).toBeVisible();

    // Hero section
    await expect(page.locator("text=Make Art").first()).toBeVisible();

    // Sections by ID
    await expect(page.locator("#courses")).toBeAttached();
    await expect(page.locator("#gallery")).toBeAttached();
    await expect(page.locator("#about")).toBeAttached();
    await expect(page.locator("#booking")).toBeAttached();
    await expect(page.locator("#contact")).toBeAttached();
  });

  test("should have meta description", async ({ page, homePage }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /.+/);
  });
});

test.describe("Homepage - Navigation", () => {
  test("clicking logo scrolls to top", async ({ page, homePage }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    // Click logo
    await page.locator("header a").first().click();
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test("navigation links scroll to correct sections", async ({ page, homePage }) => {
    const navLinks = [
      { text: /courses|kurslar|курсы/i, target: "#courses" },
      { text: /gallery|galeri|галерея/i, target: "#gallery" },
      { text: /about|hakkında|о нас/i, target: "#about" },
      { text: /contact|iletişim|контакт/i, target: "#contact" },
    ];

    for (const link of navLinks) {
      const navLink = page.locator("header").getByRole("link", { name: link.text });
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(800);
        const section = page.locator(link.target);
        await expect(section).toBeInViewport({ ratio: 0.3 });
      }
    }
  });

  test("Book Now CTA in navbar navigates to booking section", async ({ page, homePage }) => {
    const bookNow = page.locator("header").getByRole("link", { name: /book|rezerv|бронир/i });
    if (await bookNow.isVisible()) {
      await bookNow.click();
      await page.waitForTimeout(800);
      await expect(page.locator("#booking")).toBeInViewport({ ratio: 0.3 });
    }
  });
});

test.describe("Homepage - Responsive Behavior", () => {
  test("mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Menu items should become visible
      const mobileNav = page.locator('[class*="fixed"]').filter({ hasText: /courses|kurslar/i });
      await expect(mobileNav.or(page.locator("nav")).first()).toBeVisible();
    }
  });

  test("navbar becomes opaque on scroll", async ({ page, homePage }) => {
    const header = page.locator("header");

    // Initially transparent
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);

    // Should have glass/shadow class
    const classes = await header.getAttribute("class");
    expect(classes).toContain("glass");
  });
});
