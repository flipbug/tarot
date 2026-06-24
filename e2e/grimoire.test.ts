import { expect, test } from '@playwright/test';

test('library filters and opens a card', async ({ page }) => {
	await page.goto('/library');
	await expect(page.getByText('78 cards')).toBeVisible();
	await page.getByRole('button', { name: 'Cups' }).click();
	await expect(page.getByText('14 cards')).toBeVisible();
	await page.getByRole('link', { name: /Ace of Cups/ }).first().click();
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
	await expect(page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })).toBeVisible();
	await page.reload();
	await expect(page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })).toBeVisible();
});
