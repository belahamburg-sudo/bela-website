import { expect, test } from "@playwright/test";

async function expectNoHorizontalScroll(page: import("@playwright/test").Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(hasOverflow).toBe(false);
}

test("landing page renders on desktop and mobile without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bela Goldmann baut das System/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Gratis Webinar/i }).first()).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Menü öffnen/i })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("lead form works in demo mode", async ({ page }) => {
  await page.goto("/webinar");
  await page.getByLabel("Name").fill("Demo User");
  await page.getByLabel("E-Mail").fill("demo@example.com");
  await page.getByRole("button", { name: /Zugang sichern/i }).click();
  await expect(page.getByText(/Demo-Modus/i)).toBeVisible();
});

test("demo checkout redirects to success page", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ai-goldmining-demo-user",
      JSON.stringify({ email: "demo@example.com", demo: true })
    );
  });
  await page.goto("/kurse/ai-goldmining-starter");
  await page.getByRole("button", { name: /Kurs kaufen/i }).click();
  await expect(page).toHaveURL(/\/checkout\/success/);
  await expect(page.getByRole("heading", { name: /Zugang freigeschaltet/i })).toBeVisible();
});

test("dashboard course player can mark a lesson complete", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ai-goldmining-demo-user",
      JSON.stringify({ email: "demo@example.com", demo: true })
    );
  });
  await page.goto("/dashboard/kurse/ai-goldmining-starter");
  await expect(page.getByRole("heading", { name: /Warum digitale Produkte/i })).toBeVisible();
  await page.getByRole("button", { name: /Als erledigt markieren/i }).click();
  await expect(page.getByText("33% abgeschlossen")).toBeVisible();
  await expectNoHorizontalScroll(page);
});
