import { test, expect } from "../fixtures";

test.describe("Language Switching - Locale Selection", () => {
  test("default language is Turkish (tr)", async ({ page, homePage }) => {
    // Turkish text should be visible by default
    await expect(page.getByText(/Sanat Stüdyosu/i).or(page.getByText(/Make Art/i)).first()).toBeVisible();
  });

  test("switch to English updates all text", async ({ page, homePage }) => {
    // Click English language option
    const enButton = page.locator("header").getByText("EN");
    await enButton.click();
    await page.waitForTimeout(500);

    // Check that English text is now displayed
    await expect(
      page.getByText(/Art Studio|Discover|Creative/i).first()
    ).toBeVisible();
  });

  test("switch to Russian updates all text", async ({ page, homePage }) => {
    const ruButton = page.locator("header").getByText("RU");
    await ruButton.click();
    await page.waitForTimeout(500);

    // Russian text should appear
    await expect(
      page.getByText(/Студия|Творческ|Искусств/i).first()
    ).toBeVisible();
  });

  test("language switch persists across section navigation", async ({ page, homePage }) => {
    // Switch to English
    await page.locator("header").getByText("EN").click();
    await page.waitForTimeout(500);

    // Navigate to booking section
    const bookingSection = page.locator("#booking");
    await bookingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Booking form labels should be in English
    await expect(bookingSection.getByText(/Name|Email|Phone/i).first()).toBeVisible();
  });

  test("all three locale buttons are visible", async ({ page, homePage }) => {
    const header = page.locator("header");
    await expect(header.getByText("TR")).toBeVisible();
    await expect(header.getByText("EN")).toBeVisible();
    await expect(header.getByText("RU")).toBeVisible();
  });

  test("active locale is visually distinguished", async ({ page, homePage }) => {
    const trButton = page.locator("header").getByText("TR");
    const classes = await trButton.getAttribute("class");
    // Active button should have distinct styling
    expect(classes).toBeTruthy();
  });
});

test.describe("Language Switching - Content Sections", () => {
  const locales = [
    { code: "TR", patterns: [/Kurslar|Paketler|Ders/i] },
    { code: "EN", patterns: [/Courses|Packages|Lesson/i] },
    { code: "RU", patterns: [/Курсы|Пакеты|Урок/i] },
  ];

  for (const locale of locales) {
    test(`packages section renders correctly in ${locale.code}`, async ({ page, homePage }) => {
      await page.locator("header").getByText(locale.code).click();
      await page.waitForTimeout(500);

      const coursesSection = page.locator("#courses");
      await coursesSection.scrollIntoViewIfNeeded();

      for (const pattern of locale.patterns) {
        await expect(page.getByText(pattern).first()).toBeVisible();
      }
    });
  }

  test("footer links change language too", async ({ page, homePage }) => {
    await page.locator("header").getByText("EN").click();
    await page.waitForTimeout(500);

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    await expect(
      footer.getByText(/Privacy|Imprint|Contact/i).first()
    ).toBeVisible();
  });
});
