const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3000/admin/login");
  console.log("Loaded:", page.url());
  await page.fill("input#username", "admin");
  await page.fill("input#password", "MakeArt2026!");
  await page.click("button[type='submit']");
  await page.waitForTimeout(3000);
  const cookies = await page.context().cookies();
  console.log("Cookies:", cookies);
  console.log("After submit:", page.url());
  await browser.close();
})();
