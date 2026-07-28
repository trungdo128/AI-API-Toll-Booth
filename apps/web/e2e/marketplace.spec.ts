import { expect, test } from "@playwright/test";

test("browses marketplace and receives a Testnet payment challenge", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pay only when the API answers." })).toBeVisible();
  await expect(page.getByText("Stellar Testnet", { exact: false }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
  await page.getByRole("link", { name: "Explore APIs" }).click();
  await expect(page).toHaveURL(/\/marketplace\/?$/);
  await page.getByRole("link", { name: "Open API →" }).first().click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("HTTP 402", { exact: false }).last()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("marketplace.png"), fullPage: true });
});

test("keeps the primary workflow usable on a mobile viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Explore APIs" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();
  await page.getByRole("link", { name: "Explore APIs" }).click();
  await expect(page.getByRole("heading", { name: "API marketplace" })).toBeVisible();
});
