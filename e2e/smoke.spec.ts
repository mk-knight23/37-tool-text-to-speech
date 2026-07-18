import { test, expect } from "@playwright/test";

/**
 * Desktop smoke of the primary, deterministic (no-AI-keys) flow:
 * landing → workspace → type text → transcript segments → local text-prep →
 * keyboard control. Headless Chromium exposes no speechSynthesis voices, so
 * this covers everything up to (and around) audible playback, which the app is
 * designed to degrade honestly without.
 */

const SAMPLE = "I have 3 cats. Dr. Smith agrees with me.";

test("landing page shows the honest footer and links to the workspace", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByText(
      "Built and maintained by Kazi Musharraf. Open source for everyone."
    )
  ).toBeVisible();

  // Navigate to the workspace via the primary nav.
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
    name: "Workspace",
  }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Voice Workspace", level: 1 })).toBeVisible();
});

test("typing text segments it into the transcript with a live character count", async ({
  page,
}) => {
  await page.goto("/");

  const textarea = page.getByLabel("Text to read aloud");
  await textarea.fill(SAMPLE);

  // Each sentence becomes a "Speak from:" button in the transcript. (Intl.Segmenter
  // treats the raw "Dr." as a boundary — that's the limitation text-prep fixes —
  // so we assert the first sentence and the trailing clause independently.)
  await expect(
    page.getByRole("button", { name: /Speak from: I have 3 cats/ })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Speak from:.*agrees with me/ })
  ).toBeVisible();

  await expect(page.getByText(`${SAMPLE.length} characters`)).toBeVisible();

  // Real product screenshot for the README (written to public/screenshots).
  await page.screenshot({ path: "public/screenshots/workspace.png" });
});

test("local text-prep rewrites the transcript deterministically (not AI)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Text to read aloud").fill(SAMPLE);

  // Baseline: raw digits/abbreviations are present.
  await expect(
    page.getByRole("button", { name: /Speak from: I have 3 cats/ })
  ).toBeVisible();

  // Expand advanced options first
  await page.getByRole("button", { name: "Advanced reader options, files & tools" }).click();

  await page.getByRole("checkbox", { name: "Expand numbers" }).check();
  await page.getByRole("checkbox", { name: "Expand abbreviations" }).check();

  // The transcript now reflects the prepared text.
  await expect(
    page.getByRole("button", { name: /Speak from: I have three cats/ })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Speak from: Doctor Smith agrees/ })
  ).toBeVisible();
});

test("keyboard pass: arrow adjusts speed and '?' opens the shortcuts dialog", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Text to read aloud").fill(SAMPLE);

  // Focus is on body, but speed slider is inside advanced setting. Let's expand first.
  await page.getByRole("button", { name: "Advanced reader options, files & tools" }).click();

  // Move focus out of the button so global shortcuts are active.
  await page.getByRole("heading", { name: "Voice Workspace", level: 1 }).click();

  // ArrowUp nudges the speed from 1.0× to 1.1× (deterministic, no voice needed).
  await expect(page.getByText("1.0×")).toBeVisible();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText("1.1×")).toBeVisible();

  // "?" opens the keyboard shortcuts dialog; Escape closes it.
  await page.keyboard.press("Shift+Slash");
  const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
