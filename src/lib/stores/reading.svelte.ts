import { browser } from '$app/env';
import { getCard } from '$lib/data';

export type ReadingEntry = { id: string; reversed: boolean; note: string };

const KEY = 'moonlit-grimoire-reading';
type State = { entries: ReadingEntry[] };
const empty = (): State => ({ entries: [] });

export function createReading() {
	const state = $state<State>(load());

	function load(): State {
		if (!browser) return empty();
		try {
			const raw = localStorage.getItem(KEY);
			return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
		} catch {
			return empty();
		}
	}
	function persist() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch {
			/* ignore quota */
		}
	}
	const indexOf = (id: string) => state.entries.findIndex((e) => e.id === id);

	function add(id: string) {
		if (!getCard(id) || indexOf(id) !== -1) return;
		state.entries = [...state.entries, { id, reversed: false, note: '' }];
		persist();
	}
	function remove(id: string) {
		state.entries = state.entries.filter((e) => e.id !== id);
		persist();
	}
	function toggle(id: string) {
		if (indexOf(id) === -1) {
			add(id);
		} else {
			remove(id);
		}
	}
	function toggleReversed(id: string) {
		state.entries = state.entries.map((e) => (e.id === id ? { ...e, reversed: !e.reversed } : e));
		persist();
	}
	function setNote(id: string, note: string) {
		state.entries = state.entries.map((e) => (e.id === id ? { ...e, note } : e));
		persist();
	}
	function move(id: string, dir: -1 | 1) {
		const i = indexOf(id);
		const j = i + dir;
		if (i === -1 || j < 0 || j >= state.entries.length) return;
		const next = [...state.entries];
		[next[i], next[j]] = [next[j], next[i]];
		state.entries = next;
		persist();
	}
	function clear() {
		state.entries = [];
		persist();
	}

	return {
		get entries() {
			return state.entries;
		},
		get count() {
			return state.entries.length;
		},
		has: (id: string) => indexOf(id) !== -1,
		add,
		remove,
		toggle,
		toggleReversed,
		setNote,
		move,
		clear
	};
}

export const reading = createReading();
