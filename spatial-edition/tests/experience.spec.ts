import { expect, test } from '@playwright/test';

test('collection navigation wraps and inspection preserves its artifact', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Previous game', exact: true }).click();
  await expect(page.locator('.artifact-caption h1')).toHaveText('Final Fantasy VII');
  await page.getByRole('button', { name: 'Previous game', exact: true }).click();
  await expect(page.locator('.artifact-caption h1')).toHaveText('Resident Evil 2');
  await page.getByRole('button', { name: 'Inspect the disc' }).click();
  await expect(page).toHaveURL(/#game\/resident-evil-2$/);
  await page.keyboard.press('f');
  await expect(page.getByRole('button', { name: 'Show the artwork' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.artifact-caption h1')).toHaveText('Resident Evil 2');
});

test('memory room traps navigation, restores focus, and returns to inspection', async ({ page }) => {
  await page.goto('/#game/metal-gear-solid');
  await page.getByRole('button', { name: 'Enter its world' }).click();
  await expect(page.locator('.memory-viewer')).toBeVisible();
  await page.getByRole('button', { name: 'Captures', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.memory-caption')).toContainText('Inside the tank hangar.');
  await page.getByRole('button', { name: 'Autoplay frames' }).click();
  await expect(page.getByRole('button', { name: 'Pause sequence' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.memory-viewer')).toHaveCount(0);
  await expect(page.locator('.detail-copy h1')).toHaveText('Metal Gear Solid');
  await expect(page.getByRole('button', { name: 'Enter its world' })).toBeFocused();
});

test('index opens the selected artifact', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Collection/ }).click();
  await page.locator('.archive-panel').getByRole('button', { name: /Tekken 3/ }).click();
  await expect(page.locator('.detail-copy h1')).toHaveText('Tekken 3');
  await expect(page.locator('.archive-panel')).toHaveCount(0);
});

test('backward navigation during lazy loading cannot crash the scene', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/src\/DiscScene\.tsx/, async route => { await gate; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Previous game', exact: true }).click();
  await page.getByRole('button', { name: 'Previous game', exact: true }).click();
  release();
  await expect(page.locator('.is-ready')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.artifact-caption h1')).toHaveText('Resident Evil 2');
  expect(errors).toEqual([]);
});

test('touch-sized viewport and reduced motion retain named controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Enter its world' }).click();
  await page.getByRole('button', { name: 'Captures', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Autoplay frames' })).toBeVisible();
  await page.getByRole('button', { name: 'Close memory room' }).click();
  await page.getByRole('button', { name: 'Inspect the disc' }).click();
  await page.getByRole('button', { name: 'Turn it over' }).click();
  await expect(page.getByRole('button', { name: 'Show the artwork' })).toBeVisible();
});

test('fallback retains the exhibition when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.is-ready .fallback-scene')).toBeVisible();
  await page.getByRole('button', { name: 'Inspect the disc' }).click();
  await page.getByRole('button', { name: 'Turn it over' }).click();
  await expect(page.locator('.fallback-reverse')).toBeVisible();
});
