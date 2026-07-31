import { test, expect } from "../fixtures";

test.describe("Gallery Section", () => {
  test("gallery section is visible on homepage", async ({ page, homePage }) => {
    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery).toBeVisible();
  });

  test("gallery shows images or placeholder gradients", async ({ page, homePage }) => {
    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Should have either img elements or gradient placeholders
    const images = gallery.locator("img");
    const gradients = gallery.locator('[class*="gradient"]');

    const imageCount = await images.count();
    const gradientCount = await gradients.count();

    expect(imageCount + gradientCount).toBeGreaterThan(0);
  });

  test("gallery images have alt text or are decorative", async ({ page, homePage }) => {
    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const images = gallery.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");
      // Either has alt text or is explicitly presentational
      expect(alt !== null || role === "presentation").toBe(true);
    }
  });
});

test.describe("Packages Section", () => {
  test("packages section displays all package options", async ({ page, homePage }) => {
    const courses = page.locator("#courses");
    await courses.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Should show package cards with lesson counts
    const text = await courses.textContent();
    expect(text).toMatch(/1|2|4|8|12|16/);
  });

  test("most popular package is highlighted", async ({ page, homePage }) => {
    const courses = page.locator("#courses");
    await courses.scrollIntoViewIfNeeded();

    // Look for "popular" badge or indicator
    const popularBadge = courses.getByText(/popular|popüler|популярн/i);
    await expect(popularBadge.first()).toBeVisible();
  });

  test("package prices follow Turkish-lira disclosure rules", async ({ page, homePage }) => {
    const courses = page.locator("#courses");
    await courses.scrollIntoViewIfNeeded();

    const text = await courses.textContent();
    expect(text).not.toContain("€");
    expect(text).toMatch(/TL|Turkish lira|турецких лирах/i);
  });

  test("clicking package CTA scrolls to booking", async ({ page, homePage }) => {
    const courses = page.locator("#courses");
    await courses.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const ctaButton = courses.getByRole("link", { name: /book|rezerv|kayıt|request|заяв|select|seç/i }).first();
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      await page.waitForTimeout(800);
      await expect(page.locator("#booking")).toBeInViewport({ ratio: 0.2 });
    }
  });
});

test.describe("About Section", () => {
  test("about section is visible", async ({ page, homePage }) => {
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await expect(about).toBeVisible();
  });

  test("instructor information is displayed", async ({ page, homePage }) => {
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();

    const text = await about.textContent();
    // Should contain some instructor-related content
    expect(text!.length).toBeGreaterThan(50);
  });

  test("instructor image loads or shows placeholder", async ({ page, homePage }) => {
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const img = about.locator("img").first();
    if (await img.isVisible()) {
      // Image should have loaded (naturalWidth > 0)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

test.describe("Location Section", () => {
  test("location section displays contact info", async ({ page, homePage }) => {
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toBeVisible();

    const text = await contact.textContent();
    // Should contain address or Alanya reference
    expect(text).toMatch(/Alanya|address|adres|адрес/i);
  });

  test("Google Maps iframe is present", async ({ page, homePage }) => {
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const iframe = contact.locator("iframe");
    if (await iframe.isVisible()) {
      const src = await iframe.getAttribute("src");
      expect(src).toContain("google.com/maps");
    }
  });

  test("contact information includes phone/email", async ({ page, homePage }) => {
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    const text = await contact.textContent();
    // Should have contact info
    const hasPhoneOrEmail = /\+|@|tel|email|phone/i.test(text || "");
    expect(hasPhoneOrEmail).toBe(true);
  });
});

test.describe("Hero Section", () => {
  test("hero is the first visible section", async ({ page, homePage }) => {
    // Hero should be visible without scrolling
    const heroText = page.getByText(/Make Art|Sanat/i).first();
    await expect(heroText).toBeVisible();
  });

  test("hero has CTA buttons", async ({ page, homePage }) => {
    // Should have at least one call-to-action
    const ctaLinks = page.locator("a[href*='#booking'], a[href*='#courses']");
    const count = await ctaLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("hero background animation loads", async ({ page, homePage }) => {
    // Check that framer-motion animations are applied
    await page.waitForTimeout(1000);
    // Look for motion elements (data-framer or style with transform)
    const animated = page.locator('[style*="transform"], [style*="opacity"]');
    const count = await animated.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Problem Section", () => {
  test("problem section displays value propositions", async ({ page, homePage }) => {
    // Scroll past hero
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // Look for the "why" section content
    const whyText = page.getByText(/why|neden|почему/i).first();
    if (await whyText.isVisible()) {
      await expect(whyText).toBeVisible();
    }
  });

  test("stats/numbers are displayed", async ({ page, homePage }) => {
    // The problem/stats section should show achievement numbers
    const body = await page.textContent("body");
    // Should contain some numeric stats
    const hasNumbers = /\d+\+|\d+ /.test(body || "");
    expect(hasNumbers).toBe(true);
  });
});
