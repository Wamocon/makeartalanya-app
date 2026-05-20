import { test, expect } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_DASHBOARD_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD || "test-password";

test.describe("Admin Authentication (Cookie-Based)", () => {
  test("accessing /admin without cookie redirects to /admin/login", async ({ page }) => {
    // Use request API to avoid page-level redirect issues
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    // If we can visit /admin/login, verify that /admin redirects there
    const response = await page.request.get("/admin", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/admin/login");
  });

  test("admin login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");

    // Should have username and password fields
    await expect(page.locator('input[type="text"], input[name="username"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Should have Admin Panel title
    await expect(page.getByText("Admin Panel")).toBeVisible();
  });

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="text"], input[name="username"]').fill("wrong");
    await page.locator('input[type="password"]').fill("wrong");
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid|error|wrong/i)).toBeVisible({ timeout: 5000 });
  });

  test("login with correct credentials redirects to /admin", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="text"], input[name="username"]').fill(ADMIN_USER);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/admin", { timeout: 10000 });
    expect(page.url()).toContain("/admin");
    expect(page.url()).not.toContain("/login");
  });

  test("POST /api/admin/login returns cookie", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toContain("admin_session=");
    expect(setCookie).toContain("HttpOnly");
  });

  test("POST /api/admin/login rejects bad credentials", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: "bad", password: "bad" },
    });

    const body = await res.json();
    expect(body.ok).toBeFalsy();
  });

  test("admin page accessible with valid session cookie", async ({ page, request }) => {
    // Login via API
    const loginRes = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });
    const cookies = loginRes.headers()["set-cookie"];
    const match = cookies?.match(/admin_session=([^;]+)/);
    expect(match).toBeTruthy();

    // Set cookie and navigate
    await page.context().addCookies([{
      name: "admin_session",
      value: decodeURIComponent(match![1]),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Should NOT redirect to login
    expect(page.url()).not.toContain("/login");
  });
});
