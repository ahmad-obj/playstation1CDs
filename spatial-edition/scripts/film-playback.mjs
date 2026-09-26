import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
const external = [];
const results = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (/youtube|ytimg|googlevideo/.test(request.url())) external.push(request.url()); });

for (const game of ['metal-gear-solid', 'final-fantasy-vii', 'ridge-racer', 'tekken-3', 'wipeout', 'resident-evil-2']) {
  await page.goto(`http://localhost:5174/#game/${game}`);
  await page.getByRole('button', { name: 'Enter its world' }).click();
  const player = page.locator('.film-player video');
  await player.waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const video = document.querySelector('.film-player video');
    return video instanceof HTMLVideoElement && video.currentTime > .5 && video.readyState >= 2;
  }, null, { timeout: 25000 });
  const first = await player.evaluate(video => ({ src: video.currentSrc, duration: video.duration, time: video.currentTime, paused: video.paused, ready: video.readyState, error: video.error?.message || null }));
  await player.evaluate(video => { video.currentTime = Math.min(video.duration * .5, video.duration - 1); });
  await page.waitForFunction(() => {
    const video = document.querySelector('.film-player video');
    return video instanceof HTMLVideoElement && video.currentTime > 3 && video.readyState >= 2;
  }, null, { timeout: 15000 });
  const seek = await player.evaluate(video => ({ time: video.currentTime, ready: video.readyState, error: video.error?.message || null }));
  const result = { game, ...first, seek };
  results.push(result);
  console.log(JSON.stringify(result));
  await page.getByRole('button', { name: 'Close memory room' }).click();
}

console.log(JSON.stringify({ externalRequests: external, runtimeErrors: errors, verified: results.length }, null, 2));
await browser.close();
if (errors.length || external.length || results.some(result => !result.src.endsWith(`/films/${result.game}.mp4`) || result.paused || result.ready < 2 || result.error || result.seek.ready < 2 || result.seek.error)) process.exitCode = 1;
