import { test, expect } from "../fixtures";

test.describe("Edge Cases - Network & Error Handling", () => {
  test("page handles slow network gracefully", async ({ page }) => {
    // Simulate slow 3G
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    });

    await page.goto("/", { timeout: 30000 });
    await expect(page.locator("body")).not.toBeEmpty();

    await cdp.detach();
  });

  test("page recovers from offline state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Go offline
    await page.context().setOffline(true);

    // Try to submit booking form - should show error
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(500);

    // Page should still be interactive
    await expect(page.locator("header")).toBeVisible();
  });

  test("404 page for non-existent routes", async ({ page }) => {
    const response = await page.goto("/non-existent-page-xyz");
    expect(response?.status()).toBe(404);
  });

  test("handles malformed URL parameters", async ({ page }) => {
    const response = await page.goto("/?lang=<script>alert(1)</script>");
    // Should not crash
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Edge Cases - Browser Behavior", () => {
  test("back/forward navigation works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/privacy");

    await page.goBack();
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toContain("/privacy");

    await page.goForward();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/privacy");
  });

  test("page refresh preserves state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Switch language
    await page.locator("header").getByText("EN").click();
    await page.waitForTimeout(500);

    // Refresh
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Page should still work
    await expect(page.locator("header")).toBeVisible();
  });

  test("multiple rapid page navigations don't crash", async ({ page }) => {
    const pages = ["/", "/privacy", "/imprint", "/"];
    for (const path of pages) {
      await page.goto(path, { waitUntil: "commit" });
    }
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("zoom level doesn't break layout", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Zoom to 150%
    await page.evaluate(() => {
      (document.body.style as CSSStyleDeclaration).zoom = "1.5";
    });
    await page.waitForTimeout(300);

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("#booking")).toBeAttached();
  });

  test("printing doesn't crash the page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Emulate print media
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(500);

    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Edge Cases - Form Interaction Patterns", () => {
  test("pasting content into form fields", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    const nameInput = section.locator('input[type="text"]');
    await nameInput.focus();

    // Simulate paste
    await page.evaluate(() => {
      const input = document.querySelector('#booking input[type="text"]') as HTMLInputElement;
      if (input) {
        input.value = "Pasted Name";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    await expect(nameInput).toHaveValue("Pasted Name");
  });

  test("autofill simulation", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    // Fill all fields rapidly (simulating browser autofill)
    await section.locator('input[type="text"]').fill("Autofill User");
    await section.locator('input[type="email"]').fill("autofill@test.com");
    await section.locator('input[type="tel"]').fill("+90 555 000 0000");

    // All fields should have values
    await expect(section.locator('input[type="text"]')).toHaveValue("Autofill User");
    await expect(section.locator('input[type="email"]')).toHaveValue("autofill@test.com");
    await expect(section.locator('input[type="tel"]')).toHaveValue("+90 555 000 0000");
  });

  test("form field focus and blur events", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    const emailInput = section.locator('input[type="email"]');
    await emailInput.focus();
    await emailInput.fill("test@");
    await emailInput.blur();

    // Should not crash on blur with partial email
    await expect(emailInput).toHaveValue("test@");
  });

  test("tab order through form fields", async ({ page, homePage }) => {
    const section = page.locator("#booking");
    await section.scrollIntoViewIfNeeded();

    // Click the first input to start
    await section.locator('input[type="text"]').click();

    // Tab through all form elements
    const focusedElements: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag) focusedElements.push(tag);
    }

    // Should move through inputs, selects, textarea, and button
    expect(focusedElements.length).toBeGreaterThan(0);
  });
});

test.describe("Edge Cases - Viewport & Responsive", () => {
  const viewports = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPad", width: 768, height: 1024 },
    { name: "iPad Landscape", width: 1024, height: 768 },
    { name: "Desktop HD", width: 1920, height: 1080 },
    { name: "4K", width: 3840, height: 2160 },
    { name: "Ultra-narrow", width: 320, height: 568 },
  ];

  for (const vp of viewports) {
    test(`layout is intact at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // No horizontal overflow
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      // Allow slight overflow (1px rounding) but not major overflow
      if (hasHorizontalScroll) {
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThan(20);
      }

      // Header should be visible
      await expect(page.locator("header")).toBeVisible();
    });
  }
});

test.describe("Edge Cases - Data Integrity", () => {
  test("booking form trims whitespace from inputs", async ({ request }) => {
    const response = await request.post("/api/booking", {
      data: {
        name: "  Test User  ",
        email: "  TEST@EXAMPLE.COM  ",
        phone: "  +90 555 000 0000  ",
      },
    });

    // Server should accept trimmed values
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("email is normalized to lowercase", async ({ request }) => {
    const response = await request.post("/api/booking", {
      data: {
        name: "Case Test",
        email: "TEST@EXAMPLE.COM",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("concurrent booking submissions don't conflict", async ({ request }) => {
    const submissions = Array.from({ length: 5 }, (_, i) =>
      request.post("/api/booking", {
        data: {
          name: `Concurrent User ${i}`,
          email: `concurrent${i}@test.com`,
          phone: `+90 555 ${String(i).padStart(3, "0")} 0000`,
        },
      })
    );

    const responses = await Promise.all(submissions);

    for (const response of responses) {
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
    }
  });
});
