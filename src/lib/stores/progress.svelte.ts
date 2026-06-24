import { browser } from '$app/environment';

const KEY = 'moonlit-grimoire';

type State = { studied: string[]; favorites: string[]; journeyIndex: number; lastCardId: string | null };
const empty = (): State => ({ studied: [], favorites: [], journeyIndex: 0, lastCardId: null });

export function createProgress() {
	let state = $state<State>(load());

	function load(): State {
		if (!browser) return empty();
		try {
			const raw = localStorage.getItem(KEY);
			return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
		} catch { return empty(); }
	}
	function persist() {
		if (!browser) return;
		try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore quota */ }
	}

	return {
		get studied() { return state.studied; },
		get favorites() { return state.favorites; },
		get journeyIndex() { return state.journeyIndex; },
		get lastCardId() { return state.lastCardId; },
		isStudied: (id: string) => state.studied.includes(id),
		isFavorite: (id: string) => state.favorites.includes(id),
		markStudied(id: string) {
			if (!state.studied.includes(id)) state.studied = [...state.studied, id];
			state.lastCardId = id;
			persist();
		},
		toggleFavorite(id: string) {
			state.favorites = state.favorites.includes(id)
				? state.favorites.filter((x) => x !== id)
				: [...state.favorites, id];
			persist();
		},
		setJourneyIndex(n: number) { state.journeyIndex = n; persist(); },
		reset() { state = empty(); persist(); }
	};
}

export const progress = createProgress();
