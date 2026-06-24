import type { CardContent, Arcana, Suit, Element } from './types';

export type CardFilter = {
	arcana?: Arcana;
	suit?: Suit;
	element?: Element;
	planet?: string;
	query?: string;
};

export function filterCards(cards: CardContent[], f: CardFilter): CardContent[] {
	const q = f.query?.trim().toLowerCase();
	const re = q ? new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null;
	return cards.filter((c) => {
		if (f.arcana && c.arcana !== f.arcana) return false;
		if (f.suit && c.suit !== f.suit) return false;
		if (f.element && c.correspondences.element !== f.element) return false;
		if (f.planet && c.correspondences.planet !== f.planet) return false;
		if (q) {
			const nameHit = c.name.toLowerCase().includes(q);
			const prose = [c.essence, ...c.keywords, ...c.keywordsReversed].join(' ');
			if (!nameHit && !(re && re.test(prose))) return false;
		}
		return true;
	});
}

export function facetCounts(cards: CardContent[]) {
	const elements: Record<string, number> = {};
	const suits: Record<string, number> = {};
	const planets = new Set<string>();
	for (const c of cards) {
		const el = c.correspondences.element;
		elements[el] = (elements[el] ?? 0) + 1;
		if (c.suit) suits[c.suit] = (suits[c.suit] ?? 0) + 1;
		if (c.correspondences.planet) planets.add(c.correspondences.planet);
	}
	return { elements, suits, planets: [...planets].sort() };
}
