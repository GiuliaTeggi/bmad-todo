import { test, expect } from "@playwright/test"

test.describe("Todo App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Wait for the add-form input to confirm the app has fully loaded
    await expect(page.getByLabel("New todo")).toBeVisible()
  })

  test("1. create a todo", async ({ page }) => {
    const text = "Buy groceries [e2e-create]"

    await page.getByLabel("New todo").fill(text)
    await page.keyboard.press("Enter")

    await expect(page.getByRole("list", { name: "Your todos" })).toContainText(
      text
    )
  })

  test("2. toggle a todo to completed", async ({ page }) => {
    const text = "Walk the dog [e2e-toggle-complete]"

    await page.getByLabel("New todo").fill(text)
    await page.keyboard.press("Enter")

    const checkbox = page.getByLabel(`Mark "${text}" as completed`)
    await checkbox.check()

    await expect(checkbox).toBeChecked()
  })

  test("3. toggle a completed todo back to active", async ({ page }) => {
    const text = "Read a book [e2e-toggle-active]"

    await page.getByLabel("New todo").fill(text)
    await page.keyboard.press("Enter")

    // Toggle to completed — aria-label is "Mark ... as completed" when active
    await page.getByLabel(`Mark "${text}" as completed`).check()
    // After toggle, aria-label becomes "Mark ... as active"
    await expect(page.getByLabel(`Mark "${text}" as active`)).toBeChecked()

    // Toggle back to active — aria-label is now "Mark ... as active"
    await page.getByLabel(`Mark "${text}" as active`).uncheck()
    // After toggle, aria-label reverts to "Mark ... as completed"
    await expect(
      page.getByLabel(`Mark "${text}" as completed`)
    ).not.toBeChecked()
  })

  test("4. delete a todo", async ({ page }) => {
    const text = "Clean the house [e2e-delete]"

    await page.getByLabel("New todo").fill(text)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("list", { name: "Your todos" })).toContainText(
      text
    )

    await page.getByRole("button", { name: `Delete: ${text}` }).click()

    await expect(
      page.getByRole("list", { name: "Your todos" })
    ).not.toContainText(text)
  })

  test("5. todo persists after page reload", async ({ page }) => {
    const text = "Persistent todo [e2e-persist]"

    await page.getByLabel("New todo").fill(text)
    await page.keyboard.press("Enter")
    await expect(page.getByRole("list", { name: "Your todos" })).toContainText(
      text
    )

    await page.reload()
    await expect(page.getByLabel("New todo")).toBeVisible()

    await expect(page.getByRole("list", { name: "Your todos" })).toContainText(
      text
    )
  })
})
