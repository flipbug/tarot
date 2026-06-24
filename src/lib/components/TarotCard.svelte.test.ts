import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TarotCard from './TarotCard.svelte';
import { getCard } from '$lib/data';

const moon = getCard('the-moon')!;

describe('TarotCard', () => {
	it('renders the card art with descriptive alt text', async () => {
		const screen = render(TarotCard, { card: moon, size: 'hero' });
		const img = screen.getByRole('img', { name: /The Moon tarot card/ });
		await expect.element(img).toBeInTheDocument();
		await expect.element(img).toHaveAttribute('src', '/cards/the-moon.jpg');
	});

	it('exposes a button affordance when flippable', async () => {
		const screen = render(TarotCard, { card: moon, size: 'hero', flippable: true });
		await expect.element(screen.getByRole('button')).toBeInTheDocument();
	});
});
