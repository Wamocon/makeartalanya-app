import { defineConfig, devices } from "@playwright/test";

const chromiumExecutablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

/**
 * Playwright configuration for Make Art Alanya application.
 * Runs against local Next.js dev server on port 3000.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: process.env.PLAYWRIGHT_SCREENSHOT === "true" ? "on" : "only-on-failure",
    video: process.env.PLAYWRIGHT_DISABLE_VIDEO === "true" ? "off" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(chromiumExecutablePath
          ? { launchOptions: { executablePath: chromiumExecutablePath } }
          : {}),
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        ...(chromiumExecutablePath
          ? { launchOptions: { executablePath: chromiumExecutablePath } }
          : {}),
      },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
