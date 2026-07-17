import { test, expect } from "@playwright/test";

/**
 * Mobile-viewport pass (Pixel 5). Confirms the collapsed nav opens and routes
 * into the workspace, and that the workspace is usable at a narrow width.
 */

test("mobile menu opens and navigates to the workspace", async ({ page }) => {
  await page.goto("/");

  // Desktop nav is hidden; the hamburger toggles the mobile nav.
  await page.getByRole("button", { name: "Open menu" }).click();

  const mobileNav = page.locator("#mobile-nav");
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("link", { name: "Workspace" }).click();

  await expect(page).toHaveURL(/\/tool$/);
  await expect(
    page.getByRole("heading", { name: "Workspace", level: 1 })
  ).toBeVisible();
});

test("workspace accepts text at a mobile width", async ({ page }) => {
  await page.goto("/tool");

  await page.getByLabel("Your text").fill("A short sentence for mobile.");

  await expect(
    page.getByRole("button", { name: /Speak from: A short sentence/ })
  ).toBeVisible();
});
