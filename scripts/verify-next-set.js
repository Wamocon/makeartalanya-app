const { chromium } = require("playwright");
const path = require("path");

const OUT = path.join(__dirname, "screenshots-next-set");

async function capture(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: name.startsWith("home") });
  console.log(`Captured ${name}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");
    await capture(page, "home-v3");

    await page.goto("http://localhost:3000/admin/login");
    await page.waitForSelector("form", { timeout: 5000 });
    await capture(page, "admin-login-v3");

    await page.goto("http://localhost:3000/auth/login");
    await page.waitForSelector("form", { timeout: 5000 });
    await capture(page, "client-login-v3");

    await page.goto("http://localhost:3000/admin/messages");
    await page.waitForLoadState("networkidle");
    await capture(page, "admin-messages-unauth-v3");

    await page.goto("http://localhost:3000/my/messages");
    await page.waitForLoadState("networkidle");
    await capture(page, "client-messages-unauth-v3");

    // Mobile viewport for client nav
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/auth/login");
    await page.waitForLoadState("networkidle");
    await capture(page, "client-login-mobile-v3");
  } catch (err) {
    console.error("Screenshot error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
