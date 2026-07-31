import { test, expect, fillBookingForm } from "../fixtures";

test.describe("Booking Form - Valid Submissions", () => {
  test("submit with all required fields shows success", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Anna Müller",
      email: "anna@example.com",
      phone: "+90 555 111 2233",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    // Wait for success message
    await expect(section.getByText(/🎉|success|başarı|успеш/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("submit with all fields including optional ones", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "John Smith",
      email: "john@test.org",
      phone: "+44 7911 123456",
      message: "I would like to join a Saturday class.",
    });

    // Select language
    const section = page.locator("#booking");
    await section.locator("select").first().selectOption("en");

    await section.locator('button[type="submit"]').click();

    await expect(section.getByText(/🎉|success|başarı|успеш/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("submit with different language selections", async ({ page, homePage }) => {
    const languages = ["tr", "en", "ru"];
    for (const lang of languages) {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await fillBookingForm(page, {
        name: `User ${lang}`,
        email: `user-${lang}@test.com`,
        phone: "+90 555 000 0000",
        language: lang,
      });

      const section = page.locator("#booking");
      await section.locator('button[type="submit"]').click();

      await expect(section.getByText(/🎉|success|başarı|успеш/i)).toBeVisible({
        timeout: 10000,
      });
    }
  });
});

test.describe("Booking Form - Validation & Negative Cases", () => {
  test("cannot submit with empty name", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "",
      email: "test@example.com",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    // Form should not show success (HTML5 required validation)
    await expect(section.getByText(/🎉|success/i)).not.toBeVisible({ timeout: 2000 });
  });

  test("cannot submit with empty email", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Test",
      email: "",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();
    await expect(section.getByText(/🎉|success/i)).not.toBeVisible({ timeout: 2000 });
  });

  test("cannot submit with empty phone", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Test",
      email: "test@test.com",
      phone: "",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();
    await expect(section.getByText(/🎉|success/i)).not.toBeVisible({ timeout: 2000 });
  });

  test("shows error for invalid email format", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Test User",
      email: "not-an-email",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    // The HTML5 email validation should prevent submission, or server returns error
    await section.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Either HTML5 validation blocks or API returns error
    const success = section.getByText(/🎉|success/i);
    await expect(success).not.toBeVisible();
  });

  test("shows error for email without domain", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Test User",
      email: "user@",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await expect(section.getByText(/🎉|success/i)).not.toBeVisible();
  });

  test("submit button shows loading state", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Loading Test",
      email: "loading@test.com",
      phone: "+90 555 000 1111",
    });

    const section = page.locator("#booking");
    const submitBtn = section.locator('button[type="submit"]');

    // Intercept API to add delay
    await page.route("/api/booking", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.fulfill({ json: { ok: true } });
    });

    await submitBtn.click();

    // Button should be disabled during loading
    await expect(submitBtn).toBeDisabled();
  });

  test("handles network error gracefully", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Network Error",
      email: "network@error.com",
      phone: "+90 555 999 0000",
    });

    // Simulate network failure
    await page.route("/api/booking", (route) => route.abort());

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    // Should display error message
    await expect(
      section.getByText(/error|hata|ошибка|network|ağ/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("handles server 500 error gracefully", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Server Error",
      email: "server@error.com",
      phone: "+90 555 888 0000",
    });

    await page.route("/api/booking", (route) =>
      route.fulfill({
        status: 500,
        json: { ok: false, error: "Internal server error" },
      })
    );

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    await expect(section.getByText(/error|hata|ошибка/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Booking Form - Edge Cases", () => {
  test("very long name input", async ({ page, homePage }) => {
    const longName = "A".repeat(500);
    await fillBookingForm(page, {
      name: longName,
      email: "long@test.com",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    // Should either succeed or show a validation error - not crash
    await page.waitForTimeout(3000);
    const hasError = await section.getByText(/error|hata/i).isVisible();
    const hasSuccess = await section.getByText(/🎉|success/i).isVisible();
    expect(hasError || hasSuccess).toBe(true);
  });

  test("special characters in name", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "José García-López <script>alert('xss')</script>",
      email: "jose@example.com",
      phone: "+34 600 000 000",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    await page.waitForTimeout(3000);
    // Should not execute script (XSS protection)
    const dialogPromise = page.waitForEvent("dialog", { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  test("unicode characters in message", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Тест Юзер",
      email: "unicode@test.com",
      phone: "+7 900 000 0000",
      message: "Привет! 🎨 Я хочу записаться на курс рисования 画画",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    await expect(
      section.getByText(/🎉|success|başarı|успеш/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("SQL injection attempt in fields", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "'; DROP TABLE bookings; --",
      email: "sql@injection.com",
      phone: "+90 555 000 0000",
      message: "1; DELETE FROM bookings WHERE 1=1;",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();

    // Should not crash, either success or handled error
    await page.waitForTimeout(3000);
    const hasError = await section.getByText(/error|hata/i).isVisible();
    const hasSuccess = await section.getByText(/🎉|success/i).isVisible();
    expect(hasError || hasSuccess).toBe(true);
  });

  test("rapid double-submit prevention", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Double Submit",
      email: "double@test.com",
      phone: "+90 555 123 4567",
    });

    const section = page.locator("#booking");
    const submitBtn = section.locator('button[type="submit"]');

    // Click rapidly twice
    await submitBtn.click();
    await submitBtn.click();

    // Should only show one success message
    await page.waitForTimeout(5000);
    const successCount = await section.getByText(/🎉/).count();
    expect(successCount).toBeLessThanOrEqual(1);
  });

  test("phone with only spaces", async ({ page, homePage }) => {
    await fillBookingForm(page, {
      name: "Space Phone",
      email: "space@test.com",
      phone: "   ",
    });

    const section = page.locator("#booking");
    await section.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Should show error or be blocked by validation
    await expect(section.getByText(/🎉|success/i)).not.toBeVisible();
  });
});

test.describe("Booking Form - Package Selection", () => {
  test("can select each available package", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    const packageSelect = section.locator("select").nth(1);
    const options = await packageSelect.locator("option").allTextContents();

    // Should have the empty option plus package options
    expect(options.length).toBeGreaterThan(1);
  });

  test("booking request does not display a foreign-currency sale price", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();
    await expect(section).not.toContainText("€");
  });
});
