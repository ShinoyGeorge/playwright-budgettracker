import { test, expect } from '@playwright/test';

test('to have title', {tag: '@12456'}, async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Terra & Leaf — Indoor Plant Co./);
});