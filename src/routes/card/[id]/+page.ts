import { error } from '@sveltejs/kit';
import { CARDS, getCard } from '$lib/data';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => CARDS.map((c) => ({ id: c.id }));

export const load: PageLoad = ({ params }) => {
	const card = getCard(params.id);
	if (!card) throw error(404, 'No such card');
	const order = CARDS.indexOf(card);
	return {
		card,
		prev: CARDS[(order - 1 + CARDS.length) % CARDS.length],
		next: CARDS[(order + 1) % CARDS.length]
	};
};
