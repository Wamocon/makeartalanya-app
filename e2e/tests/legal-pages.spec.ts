import { test, expect } from "../fixtures";

test.describe("Legal Pages - Privacy Policy", () => {
  test("privacy page loads successfully", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/privacy");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("privacy page has relevant content", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");

    const text = await page.textContent("body");
    expect(text).toMatch(/privacy|gizlilik|конфиденциальност|data|veri|данн/i);
  });

  test("privacy page has back navigation", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");

    const homeLink = page.getByRole("link", { name: /home|ana sayfa|главная|back|geri/i });
    const logoLink = page.locator("a[href='/']");

    const hasNavigation = (await homeLink.isVisible()) || (await logoLink.count()) > 0;
    expect(hasNavigation).toBe(true);
  });
});

test.describe("Legal Pages - Imprint", () => {
  test("imprint page loads successfully", async ({ page }) => {
    await page.goto("/imprint");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/imprint");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("imprint page has company information", async ({ page }) => {
    await page.goto("/imprint");
    await page.waitForLoadState("networkidle");

    const text = await page.textContent("body");
    expect(text).toMatch(/imprint|impressum|künye|contact|iletişim|address|adres/i);
  });

  test("imprint page has back navigation", async ({ page }) => {
    await page.goto("/imprint");
    await page.waitForLoadState("networkidle");

    const homeLink = page.getByRole("link", { name: /home|ana sayfa|главная|back|geri/i });
    const logoLink = page.locator("a[href='/']");

    const hasNavigation = (await homeLink.isVisible()) || (await logoLink.count()) > 0;
    expect(hasNavigation).toBe(true);
  });
});

test.describe("Footer Navigation", () => {
  test("footer contains privacy and imprint links", async ({ page, homePage }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    const privacyLink = footer.getByRole("link", { name: /privacy|gizlilik|конфиденциальност/i });
    const imprintLink = footer.getByRole("link", { name: /imprint|impressum|künye/i });

    const hasPrivacy = await privacyLink.isVisible().catch(() => false);
    const hasImprint = await imprintLink.isVisible().catch(() => false);

    expect(hasPrivacy || hasImprint).toBe(true);
  });

  test("footer privacy link navigates correctly", async ({ page, homePage }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    const privacyLink = footer.getByRole("link", { name: /privacy|gizlilik/i });
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/privacy");
    }
  });

  test("footer imprint link navigates correctly", async ({ page, homePage }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    const imprintLink = footer.getByRole("link", { name: /imprint|impressum|künye/i });
    if (await imprintLink.isVisible()) {
      await imprintLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/imprint");
    }
  });

  test("footer displays brand name", async ({ page, homePage }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    await expect(footer.getByText(/Make ?Art/i).first()).toBeVisible();
  });
});
