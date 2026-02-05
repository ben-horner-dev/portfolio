import { expect, test } from "@chromatic-com/playwright";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile layout has 5 snap sections when panels are toggled on", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Login
  const loginButton = page.locator('a:has-text("Login")').first();
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  await page.waitForURL(/benhorner-portfolio\.au\.auth0\.com/, {
    timeout: 10000,
  });

  await page.fill(
    'input[name="email"], input[name="username"]',
    process.env.TEST_EMAIL || "",
  );
  await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "");
  await page.click('button[type="submit"], button[name="submit"]');

  await page.waitForURL(/^((?!auth0).)*$/, { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  // Navigate to explore section and wait for chat
  await page.locator('a[href="#explore"]').first().click();
  const toggleButton = page.locator('button[aria-label="Show panels"]');
  await expect(toggleButton).toBeVisible({ timeout: 10000 });

  // Get chat window dimensions before toggling (locate by heading inside)
  const chatWindow = page.locator(
    'div.rounded-2xl:has(h2:text("Explore Ben"))',
  );
  await expect(chatWindow).toBeVisible();
  const sizeBefore = await chatWindow.boundingBox();

  // Toggle panels on
  await toggleButton.click();
  await page.waitForTimeout(400);

  // Scroll back to chat window and get dimensions after toggling
  const hideButton = page.locator('button[aria-label="Hide panels"]');
  await hideButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const sizeAfter = await chatWindow.boundingBox();

  // Chat window width and height should remain the same
  expect(sizeAfter?.width).toBe(sizeBefore?.width);
  expect(sizeAfter?.height).toBe(sizeBefore?.height);

  // Should have exactly 5 snap sections within the chat layout
  const chatLayout = page.locator('[data-testid="chat-layout-wrapper"]');
  const snapSections = chatLayout.locator(".snap-start");
  await expect(snapSections).toHaveCount(5);

  // Scroll to each section and verify it becomes visible
  for (let i = 0; i < 5; i++) {
    const section = snapSections.nth(i);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  }
});
