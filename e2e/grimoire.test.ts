import { expect, test } from '@playwright/test';

test('library filters and opens a card', async ({ page }) => {
	await page.goto('/library');
	await expect(page.getByText('78 cards')).toBeVisible();
	await page.getByRole('button', { name: 'Cups' }).click();
	await expect(page.getByText('14 cards')).toBeVisible();
	await page
		.getByRole('link', { name: /Ace of Cups/ })
		.first()
		.click();
	await expect(page.getByRole('heading', { level: 1, name: 'Ace of Cups' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Sources & further reading/ })).toBeVisible();
});

test('a card can be flipped via keyboard', async ({ page }) => {
	await page.goto('/card/the-moon');
	const card = page.getByRole('button', { name: /The Moon — activate to flip/ });
	await card.focus();
	await page.keyboard.press('Enter');
	await expect(card).toHaveClass(/flipped/);
});

test('journey advances and persists across reload', async ({ page }) => {
	await page.goto('/journey');
	await expect(page.getByRole('heading', { level: 1, name: /Step 0 · The Fool/ })).toBeVisible();
	await page.getByRole('button', { name: 'Next →' }).click();
	await expect(
		page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })
	).toBeVisible();
	await page.reload();
	await expect(
		page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })
	).toBeVisible();
});

test('journey progress never exceeds the 22 Majors after browsing minors', async ({ page }) => {
	// studying a minor card must NOT inflate the journey (Majors-only) progress
	await page.goto('/card/ace-of-cups');
	await page.goto('/journey');
	const bar = page.getByRole('progressbar');
	const now = Number(await bar.getAttribute('aria-valuenow'));
	const max = Number(await bar.getAttribute('aria-valuemax'));
	expect(max).toBe(22);
	expect(now).toBeLessThanOrEqual(max);
});

test('reading tray: add, navigate, reverse, persist, clear', async ({ page }) => {
	await page.goto('/card/the-moon');
	await page.getByRole('button', { name: /Add to reading/ }).click();
	// dock badge shows 1
	await expect(page.getByRole('button', { name: /^Reading/ })).toContainText('1');
	// open dock and jump to the card
	await page.getByRole('button', { name: /^Reading/ }).click();
	await page.getByRole('complementary', { name: 'Reading tray' }).getByText('The Moon').click();
	await expect(page).toHaveURL(/\/card\/the-moon$/);
	// open full spread, mark reversed, annotate
	await page.goto('/reading');
	await expect(page.getByRole('heading', { level: 2, name: 'The Moon' })).toBeVisible();
	await page.getByRole('button', { name: 'Upright' }).click();
	await expect(page.getByRole('button', { name: 'Reversed' })).toBeVisible();
	await page.getByLabel('Note for The Moon').fill('Present');
	// persists across reload
	await page.reload();
	await expect(page.getByLabel('Note for The Moon')).toHaveValue('Present');
	await expect(page.getByRole('button', { name: 'Reversed' })).toBeVisible();
	// clear empties it
	await page.getByRole('button', { name: 'Clear reading' }).click();
	await expect(page.getByText('Your reading is empty.')).toBeVisible();
});

test('landing card draws a random card', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Draw a random card' }).click();
	await expect(page).toHaveURL(/\/card\/[a-z-]+$/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('reading page draws a random card into the tray', async ({ page }) => {
	await page.goto('/reading');
	await expect(page.getByText('Your reading is empty.')).toBeVisible();
	await page.getByRole('button', { name: 'Draw a card' }).click();
	await expect(page.getByText(/^1 card$/)).toBeVisible();
	await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
});
