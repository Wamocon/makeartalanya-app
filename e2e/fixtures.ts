import { test as base, expect } from "@playwright/test";

/**
 * Custom fixtures for Make Art Alanya E2E tests.
 */

// Admin credentials from env (same as the app uses)
const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "admin";
const ADMIN_PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD || "***REMOVED***";

export type TestFixtures = {
  /** Navigates to the homepage and waits for hydration */
  homePage: void;
  /** Provides admin-authenticated context (cookie-based) */
  adminPage: void;
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await use();
  },
  adminPage: async ({ page, request }, use) => {
    // Login via API to get session cookie
    const loginRes = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PANEL_PASSWORD },
    });
    const cookies = loginRes.headers()["set-cookie"];
    if (cookies) {
      const match = cookies.match(/admin_session=([^;]+)/);
      if (match) {
        await page.context().addCookies([{
          name: "admin_session",
          value: decodeURIComponent(match[1]),
          domain: "localhost",
          path: "/",
        }]);
      }
    }
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await use();
  },
});

export { expect };

/** Helper: Fill the booking form with valid data */
export async function fillBookingForm(
  page: import("@playwright/test").Page,
  overrides: Partial<{
    name: string;
    email: string;
    phone: string;
    language: string;
    package: string;
    message: string;
  }> = {}
) {
  const data = {
    name: "Test User",
    email: "test@example.com",
    phone: "+90 555 123 4567",
    language: "",
    package: "",
    message: "",
    ...overrides,
  };

  const section = page.locator("#booking");
  await section.scrollIntoViewIfNeeded();

  if (data.name) {
    await section.locator('input[type="text"]').fill(data.name);
  }
  if (data.phone) {
    await section.locator('input[type="tel"]').fill(data.phone);
  }
  if (data.email) {
    await section.locator('input[type="email"]').fill(data.email);
  }
  if (data.language) {
    await section.locator("select").first().selectOption(data.language);
  }
  if (data.package) {
    await section.locator("select").nth(1).selectOption({ label: data.package });
  }
  if (data.message) {
    await section.locator("textarea").fill(data.message);
  }
}

/** Helper: Make an authenticated API request */
export function adminHeaders() {
  const credentials = Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${credentials}` };
}
