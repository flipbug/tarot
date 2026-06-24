# Reading Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single localStorage-backed reading tray — an ordered set of `{ card, reversed, note }` entries — surfaced via an app-wide floating dock/drawer and a `/reading` spread page, with an Add-to-reading toggle on card detail and library thumbs.

**Architecture:** A dedicated SSR-safe runes store (`reading.svelte.ts`, own localStorage key) mirrors the existing `progress` store pattern. Small focused components (`AddToReading`, `ReadingDock`) consume it; a prerendered `/reading` route renders the spread and hydrates the store client-side. The dormant `favorites` API is removed from `progress`.

**Tech Stack:** SvelteKit + Svelte 5 runes, TypeScript, bun, Vitest (browser project, real localStorage), Playwright.

## Global Constraints

- Package manager: **bun** only (`bun add`, `bun run`). Never npm/yarn/pnpm.
- **Svelte 5 runes only** (`$state`, `$derived`, `$props`, `$effect`). Validate every component with the Svelte MCP `svelte-autofixer` (load via ToolSearch `select:mcp__svelte__svelte-autofixer`) until zero issues.
- **localStorage only**, no backend. Store must be **SSR-safe**: guard `localStorage` behind `browser` from `$app/env` (this SvelteKit version uses `$app/env`, not `$app/environment`); wrap reads/writes in `try/catch`. Prerender never touches `window`.
- Colors/spacing via design tokens in `src/lib/styles/tokens.css` — no raw hex in components.
- Import card data only via `$lib/data`.
- Each card id appears in the tray **at most once**; order is preserved.
- Conventional-commit messages; commit at the end of each task.

## File Structure

```
src/lib/stores/reading.svelte.ts        # CREATE — the tray store
src/lib/stores/reading.svelte.test.ts   # CREATE — store unit tests
src/lib/components/AddToReading.svelte   # CREATE — add/remove toggle (full + compact)
src/lib/components/ReadingDock.svelte    # CREATE — floating trigger + slide-in panel
src/routes/reading/+page.svelte          # CREATE — the spread page
src/lib/components/PageNav.svelte        # MODIFY — add "Reading" link
src/lib/components/CardThumb.svelte      # MODIFY — compact AddToReading overlay
src/routes/+layout.svelte                # MODIFY — mount ReadingDock
src/routes/card/[id]/+page.svelte        # MODIFY — AddToReading in the rail
src/lib/stores/progress.svelte.ts        # MODIFY — remove favorites
src/lib/stores/progress.svelte.test.ts   # MODIFY — drop favorites test
e2e/grimoire.test.ts                     # MODIFY — reading flow
```

---

### Task 1: Reading store

**Files:**

- Create: `src/lib/stores/reading.svelte.ts`
- Test: `src/lib/stores/reading.svelte.test.ts`

**Interfaces:**

- Produces: `type ReadingEntry = { id: string; reversed: boolean; note: string }`; `createReading()` factory and a `reading` singleton with: `entries: ReadingEntry[]` (getter), `count: number` (getter), `has(id): boolean`, `add(id)`, `remove(id)`, `toggle(id)`, `toggleReversed(id)`, `setNote(id, note)`, `move(id, dir: -1 | 1)`, `clear()`. localStorage key `moonlit-grimoire-reading`.

- [ ] **Step 1: Write the failing test** — `src/lib/stores/reading.svelte.test.ts`

```ts
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
		r.add('a-id-1'); // unknown ids ignored, so use real ones:
		r.clear();
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:unit -- --run src/lib/stores/reading.svelte.test.ts`
Expected: FAIL — module `./reading.svelte` not found.

- [ ] **Step 3: Implement the store** — `src/lib/stores/reading.svelte.ts`

```ts
import { browser } from '$app/env';
import { getCard } from '$lib/data';

export type ReadingEntry = { id: string; reversed: boolean; note: string };

const KEY = 'moonlit-grimoire-reading';
type State = { entries: ReadingEntry[] };
const empty = (): State => ({ entries: [] });

export function createReading() {
	let state = $state<State>(load());

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
		indexOf(id) === -1 ? add(id) : remove(id);
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test:unit -- --run src/lib/stores/reading.svelte.test.ts`
Expected: PASS (5 tests; runs in the browser project where `localStorage` and `browser` are real). If it lands in a node project without `localStorage`, the `.svelte.test.ts` suffix should route it to the browser project — confirm it ran there.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/reading.svelte.ts src/lib/stores/reading.svelte.test.ts
git commit -m "feat: localStorage-backed reading tray store"
```

---

### Task 2: Remove favorites from the progress store

**Files:**

- Modify: `src/lib/stores/progress.svelte.ts`
- Modify: `src/lib/stores/progress.svelte.test.ts`

**Interfaces:**

- Produces: `progress` without `favorites` / `isFavorite` / `toggleFavorite`. `studied`, `journeyIndex`, `lastCardId`, `markStudied`, `setJourneyIndex`, `reset` unchanged.

- [ ] **Step 1: Remove the favorites test case**

In `src/lib/stores/progress.svelte.test.ts`, delete the entire `it('toggles favorites', ...)` block. Leave the other cases.

- [ ] **Step 2: Remove favorites from the store**

In `src/lib/stores/progress.svelte.ts`: remove `favorites: string[];` from the `State` type; remove `favorites: []` from `empty()`; remove the `get favorites()` getter; remove the `isFavorite` and `toggleFavorite` methods. Resulting `State`:

```ts
type State = {
	studied: string[];
	journeyIndex: number;
	lastCardId: string | null;
};
const empty = (): State => ({ studied: [], journeyIndex: 0, lastCardId: null });
```

(The `load()` spread `{ ...empty(), ...JSON.parse(raw) }` harmlessly ignores any `favorites` key left in old saved state.)

- [ ] **Step 3: Verify no references remain**

Run: `grep -rn "favorite\|isFavorite\|toggleFavorite" src/`
Expected: no matches.

- [ ] **Step 4: Run the progress tests + svelte-check**

Run: `bun run test:unit -- --run src/lib/stores/progress.svelte.test.ts && bun run check`
Expected: progress tests PASS; svelte-check 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/progress.svelte.ts src/lib/stores/progress.svelte.test.ts
git commit -m "refactor: remove unused favorites API from progress store"
```

---

### Task 3: AddToReading component + card-detail integration

**Files:**

- Create: `src/lib/components/AddToReading.svelte`
- Test: `src/lib/components/AddToReading.svelte.test.ts`
- Modify: `src/routes/card/[id]/+page.svelte`

**Interfaces:**

- Consumes: `reading` from `$lib/stores/reading.svelte`.
- Produces: `<AddToReading id={string} compact?={boolean} />`. Toggles `reading.has(id)`; `aria-pressed` reflects membership.

- [ ] **Step 1: Write the failing component test** — `src/lib/components/AddToReading.svelte.test.ts`

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AddToReading from './AddToReading.svelte';
import { reading } from '$lib/stores/reading.svelte';

describe('AddToReading', () => {
	beforeEach(() => {
		reading.clear();
	});

	it('toggles a card into and out of the reading', async () => {
		const screen = render(AddToReading, { id: 'the-moon' });
		const btn = screen.getByRole('button');
		await expect.element(btn).toHaveAttribute('aria-pressed', 'false');
		await btn.click();
		expect(reading.has('the-moon')).toBe(true);
		await expect.element(btn).toHaveAttribute('aria-pressed', 'true');
		await btn.click();
		expect(reading.has('the-moon')).toBe(false);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:unit -- --run src/lib/components/AddToReading.svelte.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement AddToReading.svelte**

```svelte
<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	let { id, compact = false }: { id: string; compact?: boolean } = $props();
	const inReading = $derived(reading.has(id));
</script>

<button
	class="add"
	class:compact
	class:on={inReading}
	aria-pressed={inReading}
	title={inReading ? 'In reading — click to remove' : 'Add to reading'}
	onclick={() => reading.toggle(id)}
>
	{#if compact}
		<span aria-hidden="true">{inReading ? '✓' : '+'}</span>
		<span class="sr-only">{inReading ? 'In reading' : 'Add to reading'}</span>
	{:else}
		{inReading ? 'In reading ✓' : '＋ Add to reading'}
	{/if}
</button>

<style>
	.add {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		background: var(--veil);
		color: var(--moon-200);
		cursor: pointer;
		transition:
			color 0.18s ease,
			border-color 0.18s ease,
			background 0.18s ease;
	}
	.add:hover {
		color: var(--moon-100);
		border-color: var(--candle-soft);
	}
	.add.on {
		color: var(--candle);
		border-color: var(--candle);
	}
	.add.compact {
		padding: 0;
		width: 26px;
		height: 26px;
		display: grid;
		place-items: center;
		font-size: 1rem;
		border-radius: 50%;
		background: var(--veil);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:unit -- --run src/lib/components/AddToReading.svelte.test.ts`
Expected: PASS.

- [ ] **Step 5: Add it to the card-detail rail**

In `src/routes/card/[id]/+page.svelte`: import it and place it in the rail, just before the `<nav class="rail-pager">`:

```svelte
import AddToReading from '$lib/components/AddToReading.svelte';
```

```svelte
			<div class="rail-add"><AddToReading id={card.id} /></div>
			<nav class="rail-pager" aria-label="Browse cards">
```

Add to the page's `<style>`:

```css
.rail-add {
	display: flex;
}
```

- [ ] **Step 6: Validate with Svelte MCP**

Run `svelte-autofixer` on `AddToReading.svelte` and `card/[id]/+page.svelte`; fix until clean.

- [ ] **Step 7: Verify build**

Run: `bun run build`
Expected: clean; `/card/the-moon` still prerenders.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: AddToReading toggle on the card detail page"
```

---

### Task 4: Compact AddToReading on library thumbs

**Files:**

- Modify: `src/lib/components/CardThumb.svelte`

**Interfaces:**

- Consumes: `<AddToReading id compact />`.

- [ ] **Step 1: Wrap the thumb so the button isn't nested in the link**

Replace `src/lib/components/CardThumb.svelte` (a `<button>` must not live inside the `<a>` — wrap both in a container and overlay the add control):

```svelte
<script lang="ts">
	import type { CardContent } from '$lib/data';
	import TarotCard from './TarotCard.svelte';
	import AddToReading from './AddToReading.svelte';
	let { card }: { card: CardContent } = $props();
</script>

<div class="thumb-wrap">
	<a class="thumb" href="/card/{card.id}">
		<TarotCard {card} size="thumb" />
		<span class="name">{card.name}</span>
	</a>
	<div class="add-overlay"><AddToReading id={card.id} compact /></div>
</div>

<style>
	.thumb-wrap {
		position: relative;
		display: grid;
	}
	.thumb {
		display: grid;
		gap: var(--space-2);
		justify-items: center;
		transition: transform 0.2s;
	}
	.thumb:hover {
		transform: translateY(-4px);
	}
	.name {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
		color: var(--moon-200);
		text-align: center;
	}
	.add-overlay {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		opacity: 0;
		transition: opacity 0.18s ease;
	}
	.thumb-wrap:hover .add-overlay,
	.add-overlay:focus-within {
		opacity: 1;
	}
	@media (hover: none) {
		.add-overlay {
			opacity: 1;
		}
	}
</style>
```

(Keep any existing `.thumb`/`.name` rules consistent with the current file; the structure above preserves them and adds the overlay.)

- [ ] **Step 2: Validate with Svelte MCP**

Run `svelte-autofixer` on `CardThumb.svelte`; fix until clean.

- [ ] **Step 3: Verify build & behavior**

Run: `bun run build`
Expected: clean; `/library` prerenders. In `bun run dev`, hovering a library card reveals a `+` that adds it to the reading without navigating; touch devices show it always.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: quick add-to-reading control on library thumbs"
```

---

### Task 5: ReadingDock (floating trigger + slide-in panel)

**Files:**

- Create: `src/lib/components/ReadingDock.svelte`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**

- Consumes: `reading` from `$lib/stores/reading.svelte`, `getCard` from `$lib/data`.

- [ ] **Step 1: Implement ReadingDock.svelte**

```svelte
<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	import { getCard } from '$lib/data';

	let open = $state(false);
	let panelEl: HTMLElement | undefined = $state();

	const entries = $derived(reading.entries.map((e) => ({ ...e, card: getCard(e.id)! })));

	function onWindowKey(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
	$effect(() => {
		if (open) panelEl?.focus();
	});
</script>

<svelte:window onkeydown={onWindowKey} />

<button
	class="trigger"
	aria-expanded={open}
	aria-controls="reading-dock"
	onclick={() => (open = !open)}
>
	Reading
	{#if reading.count > 0}<span class="badge">{reading.count}</span>{/if}
</button>

{#if open}
	<aside
		id="reading-dock"
		class="panel"
		tabindex="-1"
		bind:this={panelEl}
		aria-label="Reading tray"
	>
		<header>
			<h2>Reading</h2>
			<button class="close" onclick={() => (open = false)} aria-label="Close">×</button>
		</header>

		{#if entries.length === 0}
			<p class="empty">Add cards from the deck or any card's page to build your reading.</p>
		{:else}
			<ul>
				{#each entries as e (e.id)}
					<li>
						<a class="go" href="/card/{e.id}" onclick={() => (open = false)}>
							<img src={e.card.image} alt={e.card.name} class:reversed={e.reversed} />
							<span class="nm"
								>{e.card.name}{#if e.reversed}<em> reversed</em>{/if}</span
							>
						</a>
						<div class="ops">
							<button onclick={() => reading.move(e.id, -1)} aria-label="Move up">↑</button>
							<button onclick={() => reading.move(e.id, 1)} aria-label="Move down">↓</button>
							<button onclick={() => reading.toggleReversed(e.id)} aria-label="Toggle reversed"
								>⤢</button
							>
							<button onclick={() => reading.remove(e.id)} aria-label="Remove">×</button>
						</div>
					</li>
				{/each}
			</ul>
			<footer>
				<a href="/reading" onclick={() => (open = false)}>Open full spread →</a>
				<button class="clear" onclick={() => reading.clear()}>Clear</button>
			</footer>
		{/if}
	</aside>
{/if}

<style>
	.trigger {
		position: fixed;
		right: var(--space-6);
		bottom: var(--space-6);
		z-index: 60;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		background: var(--ink-800);
		color: var(--moon-100);
		cursor: pointer;
		box-shadow: var(--glow-moon);
	}
	.badge {
		min-width: 1.3em;
		padding: 0 0.35em;
		border-radius: 999px;
		background: var(--candle);
		color: var(--ink-900);
		font-size: 0.7rem;
		text-align: center;
	}
	.panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(360px, 90vw);
		z-index: 61;
		background: var(--ink-800);
		border-left: 1px solid var(--ink-600);
		padding: var(--space-6);
		overflow-y: auto;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: var(--space-4);
		animation: slide-in 0.25s ease;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	header h2 {
		margin: 0;
		font-size: 1.4rem;
	}
	.close {
		background: none;
		border: 0;
		color: var(--moon-300);
		font-size: 1.5rem;
		cursor: pointer;
	}
	.empty {
		color: var(--moon-300);
		font-size: 0.9rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		align-content: start;
	}
	li {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-2);
	}
	.go {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}
	.go img {
		width: 34px;
		border-radius: 3px;
		box-shadow: 0 0 0 1px var(--edge-line);
	}
	.go img.reversed {
		transform: rotate(180deg);
	}
	.nm {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--moon-100);
	}
	.nm em {
		color: var(--candle);
		font-style: normal;
		font-size: 0.7rem;
	}
	.ops {
		display: flex;
		gap: 2px;
	}
	.ops button {
		background: none;
		border: 0;
		color: var(--moon-300);
		cursor: pointer;
		padding: 2px 4px;
		font-size: 0.9rem;
	}
	.ops button:hover {
		color: var(--moon-100);
	}
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		border-top: 1px solid var(--ink-700);
		padding-top: var(--space-4);
	}
	footer a {
		color: var(--candle);
	}
	.clear {
		background: none;
		border: 0;
		color: var(--moon-300);
		cursor: pointer;
	}
	@keyframes slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
```

- [ ] **Step 2: Mount it in the layout**

In `src/routes/+layout.svelte`, import and render it after `<Backdrop />`:

```svelte
import ReadingDock from '$lib/components/ReadingDock.svelte';
```

```svelte
<Backdrop />
<ReadingDock />
<a class="skip" href="#main">Skip to content</a>
```

- [ ] **Step 3: Validate with Svelte MCP**

Run `svelte-autofixer` on `ReadingDock.svelte` and `+layout.svelte`; fix until clean.

- [ ] **Step 4: Verify build & behavior**

Run: `bun run build`
Expected: clean; all routes prerender (the dock renders client-side; the trigger is in the prerendered HTML with no count badge when empty). In `bun run dev`: the trigger floats bottom-right on every page; adding cards updates the badge; opening shows entries; Escape/close dismiss; reversed entries show rotated thumbnails.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: app-wide reading dock with slide-in tray panel"
```

---

### Task 6: The /reading spread page + nav link

**Files:**

- Create: `src/routes/reading/+page.svelte`
- Modify: `src/lib/components/PageNav.svelte`

**Interfaces:**

- Consumes: `reading`, `getCard`, `PageNav`.

- [ ] **Step 1: Add the nav link**

In `src/lib/components/PageNav.svelte`: extend the `current` prop type and the `links` array.

```svelte
	let { current }: { current?: 'home' | 'library' | 'journey' | 'tree' | 'reading' } = $props();
	const links = [
		{ href: '/', key: 'home', label: 'Home' },
		{ href: '/library', key: 'library', label: 'Deck' },
		{ href: '/journey', key: 'journey', label: 'Journey' },
		{ href: '/tree', key: 'tree', label: 'Tree of Life' },
		{ href: '/reading', key: 'reading', label: 'Reading' }
	] as const;
```

- [ ] **Step 2: Implement the /reading page** — `src/routes/reading/+page.svelte`

```svelte
<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	import { getCard } from '$lib/data';
	import PageNav from '$lib/components/PageNav.svelte';

	const entries = $derived(reading.entries.map((e) => ({ ...e, card: getCard(e.id)! })));
</script>

<svelte:head><title>Reading · The Tarot</title></svelte:head>

<section class="container reading">
	<PageNav current="reading" />
	<h1>Your reading</h1>

	{#if entries.length === 0}
		<p class="empty">
			Your reading is empty. Add cards from the deck or any card's page, and they gather here as a
			spread you can lay out, mark reversed, and annotate.
		</p>
	{:else}
		<div class="bar">
			<span class="count">{entries.length} {entries.length === 1 ? 'card' : 'cards'}</span>
			<button class="clear" onclick={() => reading.clear()}>Clear reading</button>
		</div>
		<div class="spread">
			{#each entries as e (e.id)}
				<article class="entry">
					<a class="art" href="/card/{e.id}">
						<img src={e.card.image} alt={e.card.name} class:reversed={e.reversed} />
					</a>
					<h2>{e.card.name}</h2>
					<input
						class="note"
						placeholder="Position or note…"
						value={e.note}
						oninput={(ev) => reading.setNote(e.id, ev.currentTarget.value)}
						aria-label="Note for {e.card.name}"
					/>
					<div class="ops">
						<button onclick={() => reading.move(e.id, -1)} aria-label="Move earlier">←</button>
						<button
							class="rev"
							aria-pressed={e.reversed}
							onclick={() => reading.toggleReversed(e.id)}
							>{e.reversed ? 'Reversed' : 'Upright'}</button
						>
						<button onclick={() => reading.move(e.id, 1)} aria-label="Move later">→</button>
						<a class="study" href="/card/{e.id}">Study</a>
						<button onclick={() => reading.remove(e.id)} aria-label="Remove">Remove</button>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.reading {
		display: grid;
		gap: var(--space-6);
	}
	.empty {
		color: var(--moon-300);
		max-width: 60ch;
		font-style: italic;
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--moon-300);
	}
	.clear {
		background: none;
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		padding: var(--space-1) var(--space-4);
		color: var(--moon-200);
		cursor: pointer;
	}
	.spread {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-8) var(--space-6);
	}
	.entry {
		display: grid;
		gap: var(--space-2);
		justify-items: center;
		text-align: center;
	}
	.art img {
		width: 100%;
		max-width: 180px;
		border-radius: var(--radius);
		box-shadow: var(--glow-moon);
	}
	.art img.reversed {
		transform: rotate(180deg);
	}
	.entry h2 {
		margin: 0;
		font-size: 1.2rem;
	}
	.note {
		width: 100%;
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: var(--radius);
		padding: var(--space-2) var(--space-3);
		color: var(--moon-100);
		font-family: var(--font-ui);
		font-size: 0.82rem;
		text-align: center;
	}
	.ops {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-ui);
		font-size: 0.74rem;
	}
	.ops button,
	.ops .study {
		background: none;
		border: 0;
		color: var(--moon-300);
		cursor: pointer;
	}
	.ops .rev[aria-pressed='true'] {
		color: var(--candle);
	}
	.ops .study {
		color: var(--candle);
	}
	.ops button:hover,
	.ops .study:hover {
		color: var(--moon-100);
	}
</style>
```

- [ ] **Step 3: Validate with Svelte MCP**

Run `svelte-autofixer` on `reading/+page.svelte` and `PageNav.svelte`; fix until clean.

- [ ] **Step 4: Verify build prerenders /reading**

Run: `bun run build`
Expected: clean; `build/reading.html` exists (empty-state markup prerendered). In `bun run dev`, `/reading` shows the spread once cards are added; the note input persists; reversed rotates the image; the nav shows "Reading."

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: /reading spread page and nav link"
```

---

### Task 7: End-to-end flow + final verification

**Files:**

- Modify: `e2e/grimoire.test.ts`

- [ ] **Step 1: Add the e2e flow**

Append to `e2e/grimoire.test.ts`:

```ts
test('reading tray: add, navigate, reverse, persist, clear', async ({ page }) => {
	await page.goto('/card/the-moon');
	await page.getByRole('button', { name: /Add to reading/ }).click();
	// dock badge shows 1
	await expect(page.getByRole('button', { name: /^Reading/ })).toContainText('1');
	// open dock and jump to the card
	await page.getByRole('button', { name: /^Reading/ }).click();
	await page.getByRole('complementary', { name: 'Reading tray' }).getByText('The Moon').click();
	await expect(page).toHaveURL(/\/card\/the-moon$/);
	// open full spread, mark reversed, annotate
	await page.goto('/reading');
	await expect(page.getByRole('heading', { level: 2, name: 'The Moon' })).toBeVisible();
	await page.getByRole('button', { name: 'Upright' }).click();
	await expect(page.getByRole('button', { name: 'Reversed' })).toBeVisible();
	await page.getByLabel('Note for The Moon').fill('Present');
	// persists across reload
	await page.reload();
	await expect(page.getByLabel('Note for The Moon')).toHaveValue('Present');
	await expect(page.getByRole('button', { name: 'Reversed' })).toBeVisible();
	// clear empties it
	await page.getByRole('button', { name: 'Clear reading' }).click();
	await expect(page.getByText('Your reading is empty.')).toBeVisible();
});
```

- [ ] **Step 2: Run e2e**

Run: `bun run test:e2e`
Expected: all tests PASS (existing 4 + this one). Fix selectors to match the real DOM if needed — never weaken an assertion to a no-op.

- [ ] **Step 3: Full verification suite**

Run: `bun run lint && bun run check && bun run test:unit -- --run && bun run build`
Expected: lint clean, svelte-check 0 errors, all unit tests pass, build prerenders all routes including `/reading`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: end-to-end coverage for the reading tray"
```

---

## Self-Review

**Spec coverage:**

- Reading store `{id,reversed,note}`, key, ops → Task 1. ✓
- Remove favorites + test → Task 2. ✓
- AddToReading (full + compact), detail + thumb entry points → Tasks 3, 4. ✓
- ReadingDock (always-visible trigger, non-modal slide-in, count, jump/remove/reorder/reversed/clear/open-spread, Escape, focus, reduced-motion) + layout mount → Task 5. ✓
- `/reading` spread (reversed rotation, editable note, reversed toggle, reorder, remove, study link, empty state, clear) → Task 6. ✓
- "Reading" in PageNav → Task 6. ✓
- localStorage-only, SSR-safe, prerendered → Tasks 1, 5, 6 (store guards `browser`; pages prerender empty state). ✓
- Unit tests (store) + e2e flow → Tasks 1, 7. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code; the Task 4 note ("keep existing rules consistent") restates the full component so it's self-contained. ✓

**Type consistency:** `ReadingEntry` and the `reading` API (`entries`, `count`, `has`, `add`, `remove`, `toggle`, `toggleReversed`, `setNote`, `move(id, dir)`, `clear`) are defined in Task 1 and used identically in Tasks 3, 5, 6, 7. `AddToReading` props (`id`, `compact`) consistent across Tasks 3, 4. `PageNav` `current` union extended with `'reading'` (Task 6) matches `current="reading"` usage on the reading page. ✓
