const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const shots = [
    ["http://localhost:3000", "scripts/screenshot-home.png", true],
    ["http://localhost:3000/admin/login", "scripts/screenshot-admin-login.png", false],
    ["http://localhost:3000/auth/login", "scripts/screenshot-client-login.png", false],
    ["http://localhost:3000/schedule", "scripts/screenshot-schedule.png", false],
  ];

  for (const [url, path, fullPage] of shots) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await page.screenshot({ path, fullPage });
    console.log(`${path} saved`);
  }

  await browser.close();
})();
