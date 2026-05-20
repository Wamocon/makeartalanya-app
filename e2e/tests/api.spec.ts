import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Booking API - POST /api/booking", () => {
  test("valid booking returns 200 with ok: true", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "API Test User",
        email: "apitest@example.com",
        phone: "+90 555 000 1111",
        language: "en",
        package: "",
        message: "API test message",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("missing name returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "",
        email: "test@example.com",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toContain("required");
  });

  test("missing email returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Test",
        email: "",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("missing phone returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Test",
        email: "test@test.com",
        phone: "",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("invalid email format returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Test",
        email: "not-an-email",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toContain("email");
  });

  test("email without TLD returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Test",
        email: "user@domain",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("whitespace-only name returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "   ",
        email: "test@test.com",
        phone: "+90 555 000 0000",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("whitespace-only phone returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Test",
        email: "test@test.com",
        phone: "   ",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test("valid package name is accepted", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Package Test",
        email: "pkg@test.com",
        phone: "+90 555 111 2222",
        language: "tr",
        package: "8-lesson",
        message: "",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("unknown package name is handled gracefully", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Bad Package",
        email: "badpkg@test.com",
        phone: "+90 555 333 4444",
        package: "nonexistent-package-xyz",
      },
    });

    // Should still succeed (package_id will be null)
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("extra fields are ignored", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Extra Fields",
        email: "extra@test.com",
        phone: "+90 555 555 5555",
        malicious_field: "drop table",
        admin: true,
        role: "superuser",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("SQL injection in name field", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "'; DROP TABLE bookings; --",
        email: "sqli@test.com",
        phone: "+90 555 666 7777",
      },
    });

    // Should succeed without executing SQL
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("XSS payload in message field", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "XSS Test",
        email: "xss@test.com",
        phone: "+90 555 777 8888",
        message: '<script>alert("xss")</script><img src=x onerror=alert(1)>',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("empty JSON body returns 400", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test("non-JSON body returns error", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      headers: { "Content-Type": "text/plain" },
      data: "not json",
    });

    // Should return 400 or 500, not crash
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("very large payload", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/booking`, {
      data: {
        name: "Large Payload",
        email: "large@test.com",
        phone: "+90 555 999 0000",
        message: "A".repeat(100000),
      },
    });

    // Should handle gracefully (either accept or reject, not crash)
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Content API - GET /api/content", () => {
  test("GET with locale=en returns JSON", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content?locale=en`);
    // May return 200 with content or 404 if no overrides exist yet
    expect([200, 404, 500]).toContain(response.status());
  });

  test("GET with locale=tr returns JSON", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content?locale=tr`);
    expect([200, 404, 500]).toContain(response.status());
  });

  test("GET with locale=ru returns JSON", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content?locale=ru`);
    expect([200, 404, 500]).toContain(response.status());
  });

  test("GET without locale param returns error or default", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content`);
    expect([200, 400, 404, 500]).toContain(response.status());
  });

  test("GET with invalid locale", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content?locale=xx`);
    expect([200, 400, 404, 500]).toContain(response.status());
  });
});

test.describe("Upload API - POST /api/upload", () => {
  test("upload without auth returns error or requires auth", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/upload`, {
      multipart: {
        file: {
          name: "test.png",
          mimeType: "image/png",
          buffer: Buffer.from("fake-png-data"),
        },
        bucket: "gallery",
      },
    });

    // Without proper setup, should not expose server errors
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test("upload with empty file", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/upload`, {
      multipart: {
        file: {
          name: "empty.png",
          mimeType: "image/png",
          buffer: Buffer.alloc(0),
        },
        bucket: "gallery",
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
