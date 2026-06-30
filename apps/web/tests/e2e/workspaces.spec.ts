import { test, expect } from '@playwright/test';

// Use a shared state or fresh login per test
// For simplicity in this demo suite, we'll register a fresh user before the workspace test
test.describe('Workspace Flows', () => {
  let userEmail = `user_${Date.now()}@example.com`;
  let userPass = 'password123';

  test.beforeAll(async ({ browser }) => {
    // Optionally we could setup via API, but we'll just test the flow directly
  });

  test('should create a new workspace', async ({ page }) => {
    // 1. Register a new user
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Workspace Tester');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', userPass);
    await page.fill('input[name="confirmPassword"]', userPass);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Go to workspaces page
    await page.goto('/dashboard/workspaces');

    // 3. Open New Workspace Modal
    await page.click('button:has-text("New Workspace")');
    await expect(page.locator('text=New Workspace').nth(1)).toBeVisible(); // modal title

    // 4. Fill form
    const workspaceName = `Test Workspace ${Date.now()}`;
    await page.fill('input[placeholder="My Workspace"]', workspaceName);
    await page.fill('input[placeholder="What is this workspace for?"]', 'E2E Testing');
    
    // 5. Submit
    await page.click('button:has-text("Create")');

    // 6. Verify workspace appears in the list
    await expect(page.locator(`text=${workspaceName}`)).toBeVisible();
  });
});
