import { describe, it, expect, beforeEach } from 'vitest';
import { createProgress } from './progress.svelte';

describe('progress store', () => {
	let p: ReturnType<typeof createProgress>;
	beforeEach(() => {
		localStorage.clear();
		p = createProgress();
	});

	it('marks a card studied idempotently', () => {
		p.markStudied('the-moon');
		p.markStudied('the-moon');
		expect(p.isStudied('the-moon')).toBe(true);
		expect(p.studied.filter((x) => x === 'the-moon').length).toBe(1);
	});
	it('tracks last card and journey index', () => {
		p.markStudied('the-sun');
		expect(p.lastCardId).toBe('the-sun');
		p.setJourneyIndex(5);
		expect(p.journeyIndex).toBe(5);
	});
	it('persists across instances', () => {
		p.markStudied('death');
		const p2 = createProgress();
		expect(p2.isStudied('death')).toBe(true);
	});
});
