import { describe, it, expect, beforeEach } from 'vitest';
import { createReading } from './reading.svelte';

describe('reading store', () => {
	let r: ReturnType<typeof createReading>;
	beforeEach(() => {
		localStorage.clear();
		r = createReading();
	});

	it('adds a card once and ignores unknown ids', () => {
		r.add('the-moon');
		r.add('the-moon');
		r.add('not-a-card');
		expect(r.entries.map((e) => e.id)).toEqual(['the-moon']);
		expect(r.count).toBe(1);
		expect(r.has('the-moon')).toBe(true);
		expect(r.entries[0]).toEqual({ id: 'the-moon', reversed: false, note: '' });
	});
	it('toggle adds then removes', () => {
		r.toggle('the-sun');
		expect(r.has('the-sun')).toBe(true);
		r.toggle('the-sun');
		expect(r.has('the-sun')).toBe(false);
	});
	it('toggles reversed and sets a note', () => {
		r.add('death');
		r.toggleReversed('death');
		r.setNote('death', 'Past');
		expect(r.entries[0].reversed).toBe(true);
		expect(r.entries[0].note).toBe('Past');
	});
	it('moves an entry and clamps at the ends', () => {
		['the-fool', 'the-magician', 'the-star'].forEach((id) => r.add(id));
		r.move('the-star', -1);
		expect(r.entries.map((e) => e.id)).toEqual(['the-fool', 'the-star', 'the-magician']);
		r.move('the-fool', -1); // already first — no change
		expect(r.entries.map((e) => e.id)).toEqual(['the-fool', 'the-star', 'the-magician']);
	});
	it('clears and persists across instances', () => {
		r.add('the-tower');
		const r2 = createReading();
		expect(r2.has('the-tower')).toBe(true);
		r2.clear();
		expect(createReading().count).toBe(0);
	});
});
