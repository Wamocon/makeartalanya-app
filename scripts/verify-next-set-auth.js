const { chromium } = require("playwright");
const path = require("path");

const OUT = path.join(__dirname, "screenshots-next-set");

async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  console.log(`Captured ${name}`);
}

async function loginSupabase(page, email, password) {
  await page.goto("http://localhost:3000/auth/login");
  await page.waitForSelector("input[type='email']", { timeout: 5000 });
  await page.fill("input[type='email']", email);
  await page.fill("input[type='password']", password);
  await page.click("button[type='submit']");
  await page.waitForTimeout(3000);
  if (page.url().includes("/auth/login")) {
    throw new Error(`Login failed for ${email}: ${page.url()}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    // Admin via Supabase auth then navigate to admin
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const adminPage = await adminContext.newPage();
    await loginSupabase(adminPage, "admin@makeart.studio", "Admin123!");
    await adminPage.goto("http://localhost:3000/admin");
    await adminPage.waitForTimeout(2000);
    await capture(adminPage, "admin-dashboard-v3");
    await adminPage.goto("http://localhost:3000/admin/messages");
    await adminPage.waitForLoadState("networkidle");
    await capture(adminPage, "admin-messages-v3");

    // Client via Supabase auth
    const clientContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const clientPage = await clientContext.newPage();
    await loginSupabase(clientPage, "user@makeart.studio", "User1234");
    await clientPage.waitForLoadState("networkidle");
    await capture(clientPage, "client-dashboard-v3");
    await clientPage.goto("http://localhost:3000/my/messages");
    await clientPage.waitForLoadState("networkidle");
    await capture(clientPage, "client-messages-v3");

    // Client mobile bottom nav
    await clientPage.setViewportSize({ width: 390, height: 844 });
    await clientPage.goto("http://localhost:3000/my");
    await clientPage.waitForLoadState("networkidle");
    await capture(clientPage, "client-dashboard-mobile-v3");
  } catch (err) {
    console.error("Auth screenshot error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
