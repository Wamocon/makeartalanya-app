import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const UUID = "00000000-0000-0000-0000-000000000000";

/**
 * The gallery is admin-editable, which means every write endpoint here runs with
 * the service role and therefore bypasses RLS. These tests exist to keep that
 * the only thing standing between the public internet and the studio's gallery —
 * requireAdmin on the way in, and a strict schema behind it.
 */

test.describe("Gallery API - GET /api/gallery is public", () => {
  test("returns the ordered manifest", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/gallery`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    expect(Array.isArray(body.categories)).toBe(true);
  });

  test("every item carries what a rail needs to render without reflow", async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/api/gallery`)).json();

    for (const item of body.items.slice(0, 25)) {
      expect(item.id).toBeTruthy();
      expect(["photo", "video"]).toContain(item.kind);
      expect(item.src).toBeTruthy();
      expect(item.thumb).toBeTruthy();
      // Dimensions drive the tile aspect ratio; a zero here is a reflowing rail.
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
    }
  });

  test("never exposes a hidden item", async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/api/gallery`)).json();
    expect(body.items.every((i: { visible?: boolean }) => i.visible !== false)).toBe(true);
  });

  test("positions are dense and ascending within each category", async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/api/gallery`)).json();

    const byCategory = new Map<string, number[]>();
    for (const item of body.items) {
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item.position]);
    }

    for (const [, positions] of byCategory) {
      const sorted = [...positions].sort((a, b) => a - b);
      expect(sorted).toEqual(positions);
      expect(new Set(positions).size).toBe(positions.length);
    }
  });

  test("category counts match the items actually returned", async ({ request }) => {
    const body = await (await request.get(`${BASE_URL}/api/gallery`)).json();

    for (const category of body.categories) {
      const actual = body.items.filter(
        (i: { category: string }) => i.category === category.slug,
      ).length;
      expect(category.count).toBe(actual);
      // A category with nothing in it should not be advertised at all.
      expect(actual).toBeGreaterThan(0);
    }
  });
});

test.describe("Gallery API - admin routes reject anonymous callers", () => {
  const cases: { name: string; run: (r: import("@playwright/test").APIRequestContext) => Promise<import("@playwright/test").APIResponse> }[] = [
    { name: "list", run: (r) => r.get(`${BASE_URL}/api/admin/gallery`) },
    {
      name: "create",
      run: (r) => r.post(`${BASE_URL}/api/admin/gallery`, { data: { items: [] } }),
    },
    {
      name: "bulk",
      run: (r) => r.patch(`${BASE_URL}/api/admin/gallery`, { data: { ids: [UUID], action: "delete" } }),
    },
    {
      name: "edit",
      run: (r) => r.patch(`${BASE_URL}/api/admin/gallery/${UUID}`, { data: { visible: false } }),
    },
    { name: "delete", run: (r) => r.delete(`${BASE_URL}/api/admin/gallery/${UUID}`) },
    {
      name: "reorder",
      run: (r) =>
        r.post(`${BASE_URL}/api/admin/gallery/reorder`, { data: { category: "lessons", ids: [UUID] } }),
    },
    {
      name: "upload-url",
      run: (r) =>
        r.post(`${BASE_URL}/api/admin/gallery/upload-url`, {
          data: { category: "lessons", contentType: "image/webp" },
        }),
    },
    { name: "instructor photo read", run: (r) => r.get(`${BASE_URL}/api/admin/instructor-photo`) },
    {
      name: "instructor photo sign",
      run: (r) =>
        r.post(`${BASE_URL}/api/admin/instructor-photo`, { data: { contentType: "image/webp" } }),
    },
  ];

  for (const { name, run } of cases) {
    test(`${name} is rejected without a session`, async ({ request }) => {
      expect((await run(request)).status()).toBe(401);
    });
  }

  test("a forged admin_session cookie cannot mint an upload URL", async ({ request }) => {
    // The pre-signature scheme was base64("user:timestamp") with no HMAC, so this
    // is exactly the cookie that used to work.
    const forged = Buffer.from(`admin:${Date.now()}`).toString("base64");
    const response = await request.post(`${BASE_URL}/api/admin/gallery/upload-url`, {
      headers: { Cookie: `admin_session=${forged}` },
      data: { category: "lessons", contentType: "image/webp" },
    });
    expect(response.status()).toBe(401);
  });

  test("auth is checked before the payload, so probing is uninformative", async ({ request }) => {
    // A malformed body from an anonymous caller must still read 401, not 400 —
    // otherwise the difference tells an attacker the schema.
    const response = await request.post(`${BASE_URL}/api/admin/gallery/upload-url`, {
      data: { category: "../../etc", contentType: "application/x-evil" },
    });
    expect(response.status()).toBe(401);
  });
});
