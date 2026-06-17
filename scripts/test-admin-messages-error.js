const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("console", (msg) => console.log("CONSOLE:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));

  await page.goto("http://localhost:3000/auth/login");
  await page.fill("input[type='email']", "admin@makeart.studio");
  await page.fill("input[type='password']", "Admin123!");
  await page.click("button[type='submit']");
  await page.waitForTimeout(3000);
  await page.goto("http://localhost:3000/admin/messages");
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());
  await browser.close();
})();
