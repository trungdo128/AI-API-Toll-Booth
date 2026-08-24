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
    // Passing PORT through `env` keeps this working off Windows, where `set VAR=`
    // is not how a POSIX shell exports a variable and the API would bind 3000.
    command: "corepack pnpm --filter @toll-booth/api start",
    env: { PORT: "3107" },
    cwd: "../..",
    url: "http://127.0.0.1:3107/health",
    reuseExistingServer: true,
  },
});
