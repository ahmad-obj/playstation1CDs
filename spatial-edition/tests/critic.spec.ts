import { test, expect } from '@playwright/test';

test('browser Back closes the memory room before leaving inspection', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.is-ready');
  await page.getByRole('button', { name: 'Inspect the disc', exact: true }).click();
  await page.getByRole('button', { name: 'Enter its world', exact: true }).click();
  await expect(page.locator('.memory-viewer[open]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.memory-viewer')).toHaveCount(0);
  await expect(page.locator('.spatial-app')).toHaveClass(/is-detail/);
  await expect(page).toHaveURL(/#game\/metal-gear-solid$/);
});

test('short landscape collection keeps its primary controls within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await page.waitForSelector('.is-ready');
  for (const name of ['Inspect the disc', 'Enter its world', 'Previous game', 'Next game', 'Select Metal Gear Solid']) {
    const control = page.getByRole('button', { name, exact: true });
    await expect(control).toBeInViewport({ ratio: 1 });
    const bounds = await control.boundingBox();
    expect(bounds?.y, name).toBeGreaterThanOrEqual(0);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0), name).toBeLessThanOrEqual(390);
  }
});
