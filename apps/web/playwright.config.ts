import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  use: {
    baseURL: "http://127.0.0.1:3107",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1536, height: 960 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: "set PORT=3107&& corepack pnpm --filter @toll-booth/api start",
    cwd: "../..",
    url: "http://127.0.0.1:3107/health",
    reuseExistingServer: true,
  },
});
