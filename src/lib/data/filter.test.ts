import { describe, it, expect } from 'vitest';
import { CARDS } from './index';
import { filterCards, facetCounts } from './filter';

describe('filterCards', () => {
	it('returns all 78 with an empty filter', () => {
		expect(filterCards(CARDS, {}).length).toBe(78);
	});
	it('filters by arcana', () => {
		expect(filterCards(CARDS, { arcana: 'major' }).length).toBe(22);
		expect(filterCards(CARDS, { arcana: 'minor' }).length).toBe(56);
	});
	it('filters by suit', () => {
		expect(filterCards(CARDS, { suit: 'cups' }).length).toBe(14);
	});
	it('filters by element', () => {
		const fire = filterCards(CARDS, { element: 'fire' });
		expect(fire.every((c) => c.correspondences.element === 'fire')).toBe(true);
		expect(fire.length).toBeGreaterThan(0);
	});
	it('searches name and keywords case-insensitively', () => {
		const r = filterCards(CARDS, { query: 'MOON' });
		expect(r.some((c) => c.id === 'the-moon')).toBe(true);
	});
	it('combines filters (AND)', () => {
		const r = filterCards(CARDS, { suit: 'wands', query: 'king' });
		expect(r.length).toBe(1);
		expect(r[0].id).toBe('king-of-wands');
	});
});

describe('facetCounts', () => {
	it('counts elements across the deck', () => {
		const f = facetCounts(CARDS);
		const total = Object.values(f.elements).reduce((a, b) => a + b, 0);
		expect(total).toBe(78);
	});
	it('suits total 56 and cups === 14', () => {
		const f = facetCounts(CARDS);
		expect(Object.values(f.suits).reduce((a, b) => a + b, 0)).toBe(56);
		expect(f.suits.cups).toBe(14);
	});
});
