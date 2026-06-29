import { test, expect } from '@playwright/test';

test.describe.serial('Project Flows', () => {
  let userEmail = `user_proj_${Date.now()}@example.com`;
  let userPass = 'password123';
  let workspaceName = `Workspace for Projects ${Date.now()}`;

  test('should create a new project', async ({ page }) => {
    // 1. Register a new user
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Project Tester');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', userPass);
    await page.fill('input[name="confirmPassword"]', userPass);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 2. Create a workspace first
    await page.goto('/dashboard/workspaces');
    await page.click('button:has-text("New Workspace")');
    await page.fill('input[placeholder="My Workspace"]', workspaceName);
    await page.click('button:has-text("Create")');
    await expect(page.locator(`text=${workspaceName}`)).toBeVisible();

    // 3. Go to projects page
    await page.goto('/dashboard/projects');

    // 4. Open New Project Modal
    await page.click('button:has-text("New Project")');
    await expect(page.locator('text=New Project').nth(1)).toBeVisible(); // modal title

    // 5. Fill form
    const projectName = `Test Project ${Date.now()}`;
    // Select the workspace
    await page.selectOption('select', { label: workspaceName });
    await page.fill('input[placeholder="My Project"]', projectName);
    await page.fill('input[placeholder="What are you building?"]', 'E2E Testing Project');
    
    // 6. Submit
    await page.click('button:has-text("Create")');

    // 7. Verify project appears in the list
    await expect(page.locator(`text=${projectName}`)).toBeVisible();
  });
});
