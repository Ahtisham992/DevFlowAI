import { test, expect } from '@playwright/test';

test.describe.serial('Authentication Flows', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
  };

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Fill out the registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Verify successful login by checking for the welcome text
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });



  test('should login successfully with newly registered user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Verify successful login
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });
});
