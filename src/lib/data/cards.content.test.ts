import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CARDS } from './index';

const ELEMENTS = ['fire', 'water', 'air', 'earth', 'spirit'];
const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

describe('card content integrity', () => {
	it('has exactly 78 unique cards', () => {
		expect(CARDS.length).toBe(78);
		expect(new Set(CARDS.map((c) => c.id)).size).toBe(78);
	});

	it('every card has all required fields populated', () => {
		for (const c of CARDS) {
			for (const f of ['name', 'essence', 'symbolismProse', 'upright', 'reversed', 'mythology'] as const) {
				expect(c[f], `${c.id}.${f}`).toBeTruthy();
			}
			expect(c.symbolism.length, `${c.id} symbolism`).toBeGreaterThanOrEqual(5);
			expect(c.symbolism.length, `${c.id} symbolism`).toBeLessThanOrEqual(9);
			expect(ELEMENTS, `${c.id} element`).toContain(c.correspondences.element);
			expect(typeof c.correspondences.numerology.number).toBe('number');
			expect(c.archetype.name && c.archetype.description, `${c.id} archetype`).toBeTruthy();
			expect(c.lightShadow.light && c.lightShadow.shadow && c.lightShadow.affirmation).toBeTruthy();
			expect(Array.isArray(c.nature.herbs) && Array.isArray(c.nature.crystals)).toBe(true);
		}
	});

	it('every card cites >=2 well-formed https sources', () => {
		for (const c of CARDS) {
			expect(c.sources.length, `${c.id} sources`).toBeGreaterThanOrEqual(2);
			for (const s of c.sources) {
				expect(s.title && s.note, `${c.id} source fields`).toBeTruthy();
				expect(() => new URL(s.url), `${c.id} url ${s.url}`).not.toThrow();
				expect(s.url.startsWith('https://'), `${c.id} https`).toBe(true);
			}
		}
	});

	it('respects digestibility caps', () => {
		for (const c of CARDS) {
			expect(wc(c.symbolismProse), `${c.id} prose`).toBeLessThanOrEqual(180);
			expect(wc(c.upright), `${c.id} upright`).toBeLessThanOrEqual(130);
			expect(wc(c.reversed), `${c.id} reversed`).toBeLessThanOrEqual(130);
		}
	});

	it('every card image exists on disk and matches id', () => {
		for (const c of CARDS) {
			expect(c.image).toBe(`/cards/${c.id}.jpg`);
			expect(existsSync(resolve('static', `cards/${c.id}.jpg`)), `${c.id} image`).toBe(true);
		}
	});

	it('every major has a journey note', () => {
		for (const c of CARDS.filter((x) => x.arcana === 'major')) {
			expect(c.journey, `${c.id} journey`).toBeTruthy();
		}
	});
});
