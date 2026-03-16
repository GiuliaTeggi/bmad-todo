import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility (WCAG AA)", () => {
  test("empty state page has no critical WCAG violations", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("textbox", { name: "New todo" })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test("page with todos has no critical WCAG violations", async ({ page }) => {
    await page.goto("/")
    const input = page.getByRole("textbox", { name: "New todo" })
    await expect(input).toBeVisible()

    await input.fill("Accessibility audit todo [a11y]")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("list", { name: "Your todos" })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test("page with a completed todo has no critical WCAG violations", async ({
    page
  }) => {
    await page.goto("/")
    const input = page.getByRole("textbox", { name: "New todo" })
    await expect(input).toBeVisible()

    const text = "Completed accessibility todo [a11y-done]"
    await input.fill(text)
    await page.keyboard.press("Enter")
    await page.getByLabel(`Mark "${text}" as completed`).check()

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
