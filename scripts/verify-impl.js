const { chromium, devices } = require("playwright");

const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const logs = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" || msg.type() === "warning") {
      logs.push({ type: msg.type(), text });
    }
  });
  page.on("pageerror", (err) => logs.push({ type: "pageerror", text: err.message }));
  page.on("response", (res) => {
    if (res.status() >= 400) {
      console.log(`[${res.status()}] ${res.url()}`);
    }
  });

  const routes = [
    { path: "/", name: "home" },
    { path: "/schedule", name: "schedule" },
    { path: "/auth/login", name: "client-login" },
    { path: "/admin/login", name: "admin-login" },
    { path: "/admin/messages", name: "admin-messages-redirect" },
    { path: "/my/messages", name: "my-messages-redirect" },
  ];

  for (const route of routes) {
    const response = await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    console.log(`${route.path} => ${response.status()} (final: ${page.url()})`);
    await page.screenshot({ path: `scripts/verify-${route.name}.png`, fullPage: route.path === "/" });
  }

  await page.setViewportSize(devices["iPhone 12"].viewport);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "scripts/verify-home-mobile.png" });

  console.log("\n--- console errors/warnings ---");
  for (const log of logs.slice(0, 20)) {
    console.log(`[${log.type}]`, log.text);
  }
  if (logs.length === 0) console.log("No errors or warnings");

  await browser.close();
})();
