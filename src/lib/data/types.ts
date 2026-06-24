// The data contract for a single tarot card in the Moonlit Grimoire.
// See docs/superpowers/specs/2026-06-24-moonlit-grimoire-design.md (§4).

export type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit';
export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Rank =
	| 'ace'
	| 'two'
	| 'three'
	| 'four'
	| 'five'
	| 'six'
	| 'seven'
	| 'eight'
	| 'nine'
	| 'ten'
	| 'page'
	| 'knight'
	| 'queen'
	| 'king';

/** A cited, resolvable reference grounding the card's content. */
export interface Source {
	title: string;
	url: string;
	note: string;
}

/** A discrete, scannable element of the card's imagery and its meaning. */
export interface SymbolNote {
	symbol: string;
	meaning: string;
}

export interface HebrewLetter {
	letter: string;
	name: string;
	meaning: string;
}

export interface Correspondences {
	element: Element;
	zodiac?: string;
	planet?: string;
	decan?: string;
	hebrewLetter?: HebrewLetter;
	treePath?: string;
	numerology: { number: number; meaning: string };
}

/** The universal / psychological pattern the card embodies (distinct from mythology). */
export interface Archetype {
	name: string;
	description: string;
}

export interface Nature {
	herbs: string[];
	crystals: string[];
	season?: string;
	note?: string;
}

export interface LightShadow {
	light: string;
	shadow: string;
	affirmation: string;
}

export interface CardContent {
	// identity
	id: string;
	name: string;
	arcana: Arcana;
	number: number;
	suit?: Suit;
	rank?: Rank;
	image: string;

	// the heart — immersive but digestible
	essence: string;
	symbolism: SymbolNote[];
	symbolismProse: string;

	// meanings
	keywords: string[];
	keywordsReversed: string[];
	upright: string;
	reversed: string;

	// the many traditions
	correspondences: Correspondences;
	mythology: string;
	archetype: Archetype;
	nature: Nature;
	lightShadow: LightShadow;
	journey?: string;

	// trust
	sources: Source[];
}
