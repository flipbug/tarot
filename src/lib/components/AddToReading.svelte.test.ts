import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AddToReading from './AddToReading.svelte';
import { reading } from '$lib/stores/reading.svelte';

describe('AddToReading', () => {
	beforeEach(() => { reading.clear(); });

	it('toggles a card into and out of the reading', async () => {
		const screen = render(AddToReading, { id: 'the-moon' });
		const btn = screen.getByRole('button');
		await expect.element(btn).toHaveAttribute('aria-pressed', 'false');
		await btn.click();
		expect(reading.has('the-moon')).toBe(true);
		await expect.element(btn).toHaveAttribute('aria-pressed', 'true');
		await btn.click();
		expect(reading.has('the-moon')).toBe(false);
	});
});
