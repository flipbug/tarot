import type { Suit, Element, Rank } from './types';

export const SUIT_LABEL: Record<Suit, string> = {
	wands: 'Wands',
	cups: 'Cups',
	swords: 'Swords',
	pentacles: 'Pentacles'
};
export const ELEMENT_LABEL: Record<Element, string> = {
	fire: 'Fire',
	water: 'Water',
	air: 'Air',
	earth: 'Earth',
	spirit: 'Spirit'
};
export const ELEMENT_VAR: Record<Element, string> = {
	fire: '--el-fire',
	water: '--el-water',
	air: '--el-air',
	earth: '--el-earth',
	spirit: '--el-spirit'
};
export const RANK_LABEL: Record<Rank, string> = {
	ace: 'Ace',
	two: 'Two',
	three: 'Three',
	four: 'Four',
	five: 'Five',
	six: 'Six',
	seven: 'Seven',
	eight: 'Eight',
	nine: 'Nine',
	ten: 'Ten',
	page: 'Page',
	knight: 'Knight',
	queen: 'Queen',
	king: 'King'
};
