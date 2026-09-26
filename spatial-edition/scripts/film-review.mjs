import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://localhost:5174/#game/metal-gear-solid');
await page.getByRole('button', { name: 'Enter its world' }).click();
await page.waitForFunction(() => document.querySelector('.film-player video')?.currentTime > .5);
await page.locator('.film-player video').evaluate(video => { video.currentTime = 25; });
await page.waitForTimeout(700);
await page.screenshot({ path: '.impeccable/review/film-desktop-local.png' });
await page.getByRole('button', { name: 'Captures', exact: true }).click();
await page.waitForFunction(() => {
  const image = document.querySelector('.memory-image');
  return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
});
await page.waitForTimeout(1600);
await page.screenshot({ path: '.impeccable/review/captures-final.png' });
await page.getByRole('button', { name: 'Film', exact: true }).click();
for (const [width, height] of [[390, 844], [320, 740], [768, 1024], [844, 390]]) {
  await page.setViewportSize({ width, height });
  await page.locator('.film-player video').evaluate(video => { video.currentTime = 25; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `.impeccable/review/film-local-${width}.png` });
  console.log('Layout', width, await page.locator('.film-player').boundingBox(), 'overflow:', await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
}
await page.getByRole('button', { name: 'Captures', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.memory-image')?.complete);
await page.waitForTimeout(1600);
await page.screenshot({ path: '.impeccable/review/captures-landscape-local.png' });
console.log('Runtime errors:', errors);
await browser.close();
if (errors.length) process.exitCode = 1;
