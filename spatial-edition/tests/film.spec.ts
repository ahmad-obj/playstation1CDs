import { expect, test } from '@playwright/test';

test('memory room opens on a locally playing film before captures', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (/youtube|ytimg|googlevideo/.test(request.url())) external.push(request.url()); });
  await page.goto('/#game/metal-gear-solid');
  await page.getByRole('button', { name: 'Enter its world' }).click();
  await expect(page.getByRole('button', { name: 'Film', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const video = page.locator('.film-player video');
  await expect(video).toHaveAttribute('src', '/films/metal-gear-solid.mp4');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 20000 }).toBeGreaterThan(0.5);
  expect(external).toEqual([]);
  await page.getByRole('button', { name: 'Pause film', exact: true }).click();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  const seek = page.getByRole('slider', { name: 'Seek film' });
  await expect(seek).toBeEnabled();
  const track = await seek.boundingBox();
  if (!track) throw new Error('Seek track is not laid out');
  await page.mouse.click(track.x + track.width * .13, track.y + track.height / 2);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(10);
  await page.getByRole('button', { name: 'Captures', exact: true }).click();
  await expect(video).toHaveCount(0);
  await page.getByRole('button', { name: 'Next frame' }).click();
  await expect(page.locator('.memory-caption')).toContainText('Inside the tank hangar.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Enter its world' })).toBeFocused();
});

test('missing local film can be retried without losing access to captures', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.route('**/films/tekken-3.mp4', route => route.abort());
  await page.goto('/#game/tekken-3');
  await page.getByRole('button', { name: 'Enter its world' }).click();
  await expect(page.getByRole('button', { name: 'Retry film' })).toBeVisible({ timeout: 20000 });
  await page.unroute('**/films/tekken-3.mp4');
  await page.getByRole('button', { name: 'Retry film' }).click();
  await expect.poll(() => page.locator('.film-player video').evaluate((video: HTMLVideoElement) => video.currentTime), { timeout: 20000 }).toBeGreaterThan(0.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Captures', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next frame' })).toBeVisible();
});

test('reduced motion waits for an explicit play request', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#game/ridge-racer');
  await page.getByRole('button', { name: 'Enter its world' }).click();
  const video = page.locator('.film-player video');
  await expect(video).toBeVisible();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play film', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 20000 }).toBeGreaterThan(0.5);
});

test('film ending offers the next physical artifact without auto-advancing', async ({ page }) => {
  await page.goto('/#game/metal-gear-solid');
  await page.getByRole('button', { name: 'Enter its world' }).click();
  const video = page.locator('.film-player video');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.duration), { timeout: 20000 }).toBeGreaterThan(0);
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = element.duration - .2; });
  await expect(page.getByRole('button', { name: 'Next memory: R4: Ridge Racer Type 4' })).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.memory-viewer')).toBeVisible();
  await page.getByRole('button', { name: 'Next memory: R4: Ridge Racer Type 4' }).click();
  await expect(page.locator('.memory-viewer')).toHaveCount(0);
  await expect(page.locator('.detail-copy h1')).toHaveText('R4: Ridge Racer Type 4');
});
