import { test, expect } from "../fixtures";

const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "***REMOVED***";

test.describe("Admin Dashboard - Today Page", () => {
  test.beforeEach(async ({ page, request }) => {
    // Authenticate as admin
    const loginRes = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });
    const cookies = loginRes.headers()["set-cookie"];
    const match = cookies?.match(/admin_session=([^;]+)/);
    if (match) {
      await page.context().addCookies([{
        name: "admin_session",
        value: decodeURIComponent(match[1]),
        domain: "localhost",
        path: "/",
      }]);
    }
  });

  test("admin today page loads", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /today/i })).toBeVisible();
  });

  test("shows stats cards (classes, students, completed)", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/classes/i).first()).toBeVisible();
    await expect(page.getByText(/students/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test("displays date header", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    // Should show current date
    const today = new Date();
    const dayName = today.toLocaleDateString("en", { weekday: "long" });
    await expect(page.getByText(new RegExp(dayName, "i"))).toBeVisible();
  });

  test("shows session timeline or list", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    // Page should have some content structure
    const mainContent = page.locator("main, [role='main'], .space-y-6").first();
    await expect(mainContent).toBeVisible();
  });
});

test.describe("Admin Sidebar Navigation", () => {
  test.beforeEach(async ({ page, request }) => {
    const loginRes = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });
    const cookies = loginRes.headers()["set-cookie"];
    const match = cookies?.match(/admin_session=([^;]+)/);
    if (match) {
      await page.context().addCookies([{
        name: "admin_session",
        value: decodeURIComponent(match[1]),
        domain: "localhost",
        path: "/",
      }]);
    }
  });

  test("sidebar is visible on admin/today", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    // Should have nav/sidebar with links
    const sidebar = page.locator("nav, aside, [role='navigation']").first();
    await expect(sidebar).toBeVisible();
  });

  test("sidebar has navigation links", async ({ page }) => {
    await page.goto("/admin/today");
    await page.waitForLoadState("networkidle");

    // Should have links to admin sections
    const links = page.locator("nav a, aside a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Admin API Endpoints", () => {
  test("GET /admin without auth redirects", async ({ request }) => {
    const res = await request.get("/admin", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/admin/login");
  });

  test("admin login sets HttpOnly cookie", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const cookie = res.headers()["set-cookie"];
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("admin_session");
  });
});
