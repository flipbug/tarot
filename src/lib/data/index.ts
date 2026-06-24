// Typed access to the 78-card deck. Card content lives in cards.json (generated
// by scripts/build-cards.mjs from the research workflow); this module gives it
// types and a few lookups. Filtering/search for the UI is layered on later.

import type { CardContent, Suit } from './types';
import data from './cards.json';

export const CARDS = data as CardContent[];

export const CARD_BY_ID: Map<string, CardContent> = new Map(CARDS.map((c) => [c.id, c]));
export const getCard = (id: string): CardContent | undefined => CARD_BY_ID.get(id);

export const MAJOR_ARCANA: CardContent[] = CARDS.filter((c) => c.arcana === 'major');
export const MINOR_ARCANA: CardContent[] = CARDS.filter((c) => c.arcana === 'minor');
export const bySuit = (suit: Suit): CardContent[] => CARDS.filter((c) => c.suit === suit);

export type {
	CardContent,
	Element,
	Arcana,
	Suit,
	Rank,
	Source,
	SymbolNote,
	Correspondences,
	Archetype,
	Nature,
	LightShadow
} from './types';
