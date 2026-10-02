import { expect, test } from '@playwright/test';

test('collection contains all 11 games and header reflects the count', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.is-ready');

  // Verify header and exhibit counts
  await expect(page.locator('.site-header nav sup')).toHaveText('11');
  await expect(page.locator('.exhibit-number i')).toHaveText('/ 11');

  // Verify dock has 11 items
  const dockButtons = page.locator('.disc-dock button');
  await expect(dockButtons).toHaveCount(11);

  // Verify collection index dialog title
  await page.getByRole('button', { name: /^Collection/ }).click();
  await expect(page.locator('#panel-title')).toHaveText('Eleven discs.Countless memories.');
  const indexButtons = page.locator('.artifact-index button');
  await expect(indexButtons).toHaveCount(11);
  await page.getByRole('button', { name: 'Close panel' }).click();
});

const newGames = [
  {
    id: 'castlevania-sotn',
    title: 'Castlevania: Symphony of the Night',
    developer: 'Konami',
    year: '1997',
    serial: 'SLUS-00067',
    filmCaption: 'In the entrance hall of Dracula\'s castle.',
  },
  {
    id: 'silent-hill',
    title: 'Silent Hill',
    developer: 'Konami',
    year: '1999',
    serial: 'SLUS-00707',
    filmCaption: 'Searching the fog-shrouded streets of Old Silent Hill.',
  },
  {
    id: 'gran-turismo-2',
    title: 'Gran Turismo 2',
    developer: 'Polyphony Digital',
    year: '1999',
    serial: 'SCUS-94455',
    filmCaption: 'The starting grid at Grand Valley Speedway.',
  },
  {
    id: 'crash-bandicoot',
    title: 'Crash Bandicoot: Warped',
    developer: 'Naughty Dog',
    year: '1998',
    serial: 'SCUS-94244',
    filmCaption: 'Galloping across the Great Wall of China on Pura.',
  },
  {
    id: 'tony-hawk-2',
    title: "Tony Hawk's Pro Skater 2",
    developer: 'Neversoft',
    year: '2000',
    serial: 'SLUS-01066',
    filmCaption: 'Dropping into the halfpipe inside The Hangar.',
  },
];

for (const game of newGames) {
  test(`expanded artifact ${game.id} renders detail, archival film, and captures`, async ({ page }) => {
    await page.goto(`/#game/${game.id}`);
    await page.waitForSelector('.is-ready');

    // Verify detail metadata
    await expect(page.locator('.detail-copy h1')).toHaveText(game.title);
    await expect(page.locator('.detail-serial')).toContainText(game.serial);
    await expect(page.locator('.detail-copy dd').first()).toHaveText(game.year);

    // Verify entering memory room
    await page.getByRole('button', { name: 'Enter its world' }).click();
    await expect(page.locator('.memory-viewer')).toBeVisible();

    // Verify film player is loaded
    const video = page.locator('.film-player video');
    await expect(video).toHaveAttribute('src', `/films/${game.id}.mp4`);
    await expect(video).toHaveAttribute('poster', `/films/${game.id}-poster.webp`);

    // Verify captures
    await page.getByRole('button', { name: 'Captures', exact: true }).click();
    await expect(video).toHaveCount(0);
    await expect(page.locator('.memory-caption')).toContainText(game.filmCaption);

    // Close memory room
    await page.keyboard.press('Escape');
    await expect(page.locator('.memory-viewer')).toHaveCount(0);
  });
}
