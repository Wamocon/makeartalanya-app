import { test, expect } from "../fixtures";

test.describe("Visual Regression - Sections Render Correctly", () => {
  test("homepage full page screenshot", async ({ page, homePage }) => {
    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("hero section screenshot", async ({ page, homePage }) => {
    const hero = page.locator("section").first();
    await expect(hero).toHaveScreenshot("hero-section.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("booking form screenshot", async ({ page, homePage }) => {
    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(booking).toHaveScreenshot("booking-form.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("navbar screenshot - default state", async ({ page, homePage }) => {
    const header = page.locator("header");
    await expect(header).toHaveScreenshot("navbar-default.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("navbar screenshot - scrolled state", async ({ page, homePage }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);

    const header = page.locator("header");
    await expect(header).toHaveScreenshot("navbar-scrolled.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("footer screenshot", async ({ page, homePage }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(footer).toHaveScreenshot("footer.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual Regression - Mobile Views", () => {
  test("mobile homepage", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test("mobile booking form", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const booking = page.locator("#booking");
    await booking.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(booking).toHaveScreenshot("booking-mobile.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual Regression - Language Variants", () => {
  const locales = ["TR", "EN", "RU"];

  for (const locale of locales) {
    test(`hero section in ${locale}`, async ({ page, homePage }) => {
      await page.locator("header").getByText(locale).click();
      await page.waitForTimeout(500);

      const hero = page.locator("section").first();
      await expect(hero).toHaveScreenshot(`hero-${locale.toLowerCase()}.png`, {
        maxDiffPixelRatio: 0.05,
      });
    });
  }
});
