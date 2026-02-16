import { test, expect } from '@playwright/test';

test('blocks next when no plan is selected', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /continue|next/i }).click();
  await expect(page.getByText(/select a plan/i)).toBeVisible();
});

test('can go from plan -> account', async ({ page }) => {
  await page.goto('/');

  // Select any plan radio
  const firstRadio = page.locator('input[type="radio"]').first();
  await firstRadio.check();

  await page.getByRole('button', { name: /continue|next/i }).click();
  await expect(page.getByRole('heading')).toContainText(/account|login/i);
});

test('validates inputs then shows success when valid', async ({ page }) => {
  await page.goto('/');

  // Plan step
  await page.locator('input[type="radio"]').first().check();
  await page.getByRole('button', { name: /continue|next/i }).click();

  // Account step - invalid first
  await page.getByLabel(/email/i).fill('bad');
  await page.getByLabel(/password/i).fill('123');
  await page.getByRole('button', { name: /start membership|join now/i }).click();

  await expect(page.getByText(/valid email/i)).toBeVisible();
  await expect(page.getByText(/at least 8/i)).toBeVisible();

  // Fix inputs
  await page.getByLabel(/email/i).fill('you@example.com');
  await page.getByLabel(/password/i).fill('12345678');
  await page.getByRole('button', { name: /start membership|join now/i }).click();

  await expect(page.getByRole('heading')).toContainText(/success/i);
});
