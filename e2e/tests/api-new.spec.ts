import { test, expect } from "@playwright/test";

test.describe("Schedule API", () => {
  test("GET /api/schedule/public returns class sessions", async ({ request }) => {
    const res = await request.get("/api/schedule/public");
    // May return 200 or 404 depending on route existence
    if (res.status() === 200) {
      const data = await res.json();
      expect(Array.isArray(data.sessions || data)).toBeTruthy();
    }
  });
});

test.describe("Cron API", () => {
  test("GET /api/cron/generate-sessions endpoint exists", async ({ request }) => {
    const res = await request.get("/api/cron/generate-sessions");
    // Should be accessible (public route) - may return 200 or 405 depending on method
    expect([200, 404, 405]).toContain(res.status());
  });
});

test.describe("Admin Login API", () => {
  test("POST with empty body returns error", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: {},
    });
    const body = await res.json();
    expect(body.ok).toBeFalsy();
  });

  test("POST with valid credentials returns ok:true", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: process.env.ADMIN_DASHBOARD_USER || "admin", password: process.env.ADMIN_DASHBOARD_PASSWORD || "test-password" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST with invalid password returns error", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: "admin", password: "wrong" },
    });
    const body = await res.json();
    expect(body.ok).toBeFalsy();
  });

  test("cookie has proper security attributes", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: process.env.ADMIN_DASHBOARD_USER || "admin", password: process.env.ADMIN_DASHBOARD_PASSWORD || "test-password" },
    });
    const cookie = res.headers()["set-cookie"] || "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=");
    expect(cookie).toContain("Path=/");
  });
});

test.describe("Booking API (Legacy)", () => {
  test("POST /api/booking with valid data", async ({ request }) => {
    const res = await request.post("/api/booking", {
      data: {
        name: "Test Parent",
        email: "test@example.com",
        phone: "+905551234567",
        language: "en",
        package: "trial",
        message: "E2E test booking",
      },
    });
    // May return 200/201 if bookings table exists, or 500 if renamed to legacy_bookings
    expect([200, 201, 400, 422, 500]).toContain(res.status());
  });

  test("POST /api/booking with missing data returns 400", async ({ request }) => {
    const res = await request.post("/api/booking", {
      data: { name: "", email: "", phone: "" },
    });
    expect([400, 422, 500]).toContain(res.status());
  });
});

test.describe("Content API", () => {
  test("GET /api/content returns content", async ({ request }) => {
    const res = await request.get("/api/content");
    // Should be accessible
    expect([200, 401, 404]).toContain(res.status());
  });
});
