# Moonlit Grimoire — App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive tarot study app — a browsable, filterable library of all 78 cards, each with a 3D animated card and rich multi-tradition content, plus a guided Fool's Journey — atop the already-built data layer.

**Architecture:** Prerendered SvelteKit (Svelte 5 runes) static site. Card content is a typed JSON module (`src/lib/data`). UI is composed of small focused components; the signature piece is a pure-CSS-3D `<TarotCard>`. State (study progress, favorites, journey position) lives in an SSR-safe `localStorage`-backed runes store. A centralized design-token system delivers the "moonlit witch's altar" aesthetic.

**Tech Stack:** SvelteKit + Svelte 5 (runes), TypeScript, bun, `@sveltejs/adapter-static`, Vitest (+ vitest-browser-svelte), Playwright. Self-hosted fonts (Aktura, Sentient) from Fontshare.

## Global Constraints

- **Package manager:** bun (`bun add`, `bun run`). Never npm/yarn/pnpm.
- **Svelte 5 runes only:** `$state`, `$derived`, `$props`, `$effect`. No Svelte 4 stores/`export let`. Validate every component with the Svelte MCP `svelte-autofixer` before considering it done; keep calling it until zero issues.
- **Fully static:** all routes prerendered; no server-only code, no runtime data fetching. `src/lib/data` is the single source of card data.
- **Data contract:** the `CardContent` type in `src/lib/data/types.ts` is authoritative. Import card data only through `src/lib/data` (never read `cards.json` directly elsewhere).
- **Accessibility:** every interactive element keyboard-operable with visible focus; all motion gated behind `prefers-reduced-motion`; all card art has descriptive `alt`.
- **Design tokens:** all color/space/type values come from CSS custom properties in `src/lib/styles/tokens.css`. No hard-coded hex values in components.
- **Aesthetic:** "moonlit witch's altar" — twilight indigo/violet, silver moonlight, candle-amber accents, sage green; deep and glowing, never flat black.
- **Commits:** conventional-commit messages; commit at the end of each task.

---

## File Structure

```
svelte.config.js                      # MODIFY: adapter-static
src/routes/+layout.ts                 # CREATE: prerender = true
src/routes/+layout.svelte             # MODIFY: global shell, atmosphere, fonts
src/routes/+page.svelte               # MODIFY: the Altar (home)
src/routes/library/+page.svelte       # CREATE: the Deck (grid + filters)
src/routes/card/[id]/+page.ts         # CREATE: prerender entries + load
src/routes/card/[id]/+page.svelte     # CREATE: card detail
src/routes/journey/+page.svelte       # CREATE: Fool's Journey
src/routes/about/+page.svelte         # CREATE: sources & attribution
src/routes/demo/                      # DELETE: scaffold demo routes

src/lib/styles/tokens.css             # CREATE: design tokens
src/lib/styles/fonts.css              # CREATE: @font-face
src/lib/styles/global.css             # CREATE: base/reset/typography

src/lib/data/{types.ts,cards.json,index.ts}  # EXISTS
src/lib/data/filter.ts                # CREATE: pure filter/search/facets
src/lib/data/labels.ts                # CREATE: display labels for suits/elements/ranks

src/lib/stores/progress.svelte.ts     # CREATE: localStorage-backed runes store

src/lib/components/TarotCard.svelte    # CREATE: 3D card
src/lib/components/CardThumb.svelte    # CREATE: grid item (wraps TarotCard, links)
src/lib/components/CardGrid.svelte     # CREATE: responsive grid
src/lib/components/FilterBar.svelte    # CREATE: filters + search
src/lib/components/SymbolList.svelte   # CREATE: symbolism notes
src/lib/components/CorrespondencePanel.svelte  # CREATE: correspondences
src/lib/components/SourceList.svelte   # CREATE: sources & further reading
src/lib/components/MoonPhase.svelte    # CREATE: ambient moon motif
src/lib/components/MistLayer.svelte    # CREATE: ambient mist background
src/lib/components/ProgressTracker.svelte  # CREATE: journey progress

scripts/fetch-fonts.sh                 # CREATE: download woff2 from Fontshare
src/lib/data/cards.content.test.ts     # CREATE: content-integrity unit test
src/lib/data/filter.test.ts            # CREATE: filter unit tests
src/lib/stores/progress.test.ts        # CREATE: store unit tests
e2e/grimoire.test.ts                   # CREATE: Playwright e2e
```

---

### Task 1: Static-site configuration & scaffold cleanup

**Files:**

- Modify: `svelte.config.js`
- Create: `src/routes/+layout.ts`
- Delete: `src/routes/demo/` (and `src/lib/vitest-examples/`)
- Modify: `package.json` (add adapter-static dev dep via bun)

**Interfaces:**

- Produces: a static, prerendered build; `prerender = true` inherited by all routes.

- [ ] **Step 1: Install the static adapter**

Run: `bun add -d @sveltejs/adapter-static@next`
Expected: adds `@sveltejs/adapter-static` to devDependencies.

- [ ] **Step 2: Point svelte.config.js at adapter-static**

Replace the adapter import/usage in `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({ fallback: undefined, strict: true })
	}
};

export default config;
```

- [ ] **Step 3: Create root layout load enabling prerender**

Create `src/routes/+layout.ts`:

```ts
export const prerender = true;
export const ssr = true;
```

- [ ] **Step 4: Remove scaffold demo content**

Run: `rm -rf src/routes/demo src/lib/vitest-examples`

- [ ] **Step 5: Verify the build is clean & static**

Run: `bun run build`
Expected: build completes; output written to `build/` with prerendered `index.html`. No "could not be prerendered" errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure static adapter, enable prerender, remove demo scaffold"
```

---

### Task 2: Design tokens, fonts, and global styles

**Files:**

- Create: `scripts/fetch-fonts.sh`
- Create: `src/lib/styles/tokens.css`, `src/lib/styles/fonts.css`, `src/lib/styles/global.css`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**

- Produces: CSS custom properties (`--moon-*`, `--ink-*`, `--space-*`, `--font-*`), `@font-face` for Aktura + Sentient, and a global shell importing all three stylesheets.

- [ ] **Step 1: Write the font-fetch script**

Create `scripts/fetch-fonts.sh` (queries the Fontshare API for the woff2 URLs, then self-hosts them under `static/fonts/`):

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/static/fonts"; mkdir -p "$DEST"
UA="MoonlitGrimoire/1.0"
# Aktura 400 (display) + Sentient 400/500 (body). The API returns @font-face CSS
# with cdn.fontshare.com woff2 URLs; extract and download them.
for q in "aktura@400" "sentient@400,500"; do
  css=$(curl -sS -A "$UA" "https://api.fontshare.com/v2/css?f[]=${q}&display=swap")
  echo "$css" | grep -oE 'https?:[^)]+\.woff2' | while read -r url; do
    fn=$(basename "${url%%\?*}")
    curl -sS -A "$UA" -o "$DEST/$fn" "https:${url#https:}" 2>/dev/null || curl -sS -A "$UA" -o "$DEST/$fn" "$url"
    echo "downloaded $fn"
  done
done
ls -1 "$DEST"
```

- [ ] **Step 2: Run it and record the filenames**

Run: `bash scripts/fetch-fonts.sh`
Expected: one or more `.woff2` files in `static/fonts/`. Note the exact filenames for the next step.

- [ ] **Step 3: Write fonts.css**

Create `src/lib/styles/fonts.css` (replace the `url(...)` filenames with the ones downloaded in Step 2):

```css
@font-face {
	font-family: 'Aktura';
	src: url('/fonts/Aktura-Regular.woff2') format('woff2');
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'Sentient';
	src: url('/fonts/Sentient-Regular.woff2') format('woff2');
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'Sentient';
	src: url('/fonts/Sentient-Medium.woff2') format('woff2');
	font-weight: 500;
	font-style: normal;
	font-display: swap;
}
```

- [ ] **Step 4: Write tokens.css**

Create `src/lib/styles/tokens.css`:

```css
:root {
	/* twilight base */
	--ink-900: #0b0a1a;
	--ink-800: #14122b;
	--ink-700: #1d1a3b;
	--ink-600: #2a2552;
	--veil: rgba(20, 18, 43, 0.72);

	/* moonlight & accents */
	--moon-100: #f4f1ff;
	--moon-200: #d9d2f5;
	--moon-300: #b8aee0;
	--silver: #c9d4e8;
	--candle: #f0c27b; /* warm amber */
	--candle-soft: #e8b35e;
	--sage: #9bbf9e;
	--amethyst: #9a6cf0;

	/* elemental hues (for chips/filters) */
	--el-fire: #e08c5a;
	--el-water: #6aa9d6;
	--el-air: #c9b56a;
	--el-earth: #8aa777;
	--el-spirit: #b89cf0;

	/* type */
	--font-display: 'Aktura', 'Cormorant Garamond', Georgia, serif;
	--font-body: 'Sentient', Georgia, 'Times New Roman', serif;
	--font-ui: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;

	/* spacing scale */
	--space-1: 0.25rem;
	--space-2: 0.5rem;
	--space-3: 0.75rem;
	--space-4: 1rem;
	--space-6: 1.5rem;
	--space-8: 2rem;
	--space-12: 3rem;
	--space-16: 4rem;

	/* radius, glow */
	--radius: 14px;
	--radius-lg: 22px;
	--glow-moon: 0 0 30px rgba(201, 212, 232, 0.35);
	--glow-candle: 0 0 26px rgba(240, 194, 123, 0.4);

	--maxw: 72rem;
}
```

- [ ] **Step 5: Write global.css**

Create `src/lib/styles/global.css`:

```css
*,
*::before,
*::after {
	box-sizing: border-box;
}
html,
body {
	margin: 0;
	padding: 0;
}
body {
	background:
		radial-gradient(1200px 800px at 50% -10%, var(--ink-700), var(--ink-900) 70%), var(--ink-900);
	color: var(--moon-200);
	font-family: var(--font-body);
	font-size: 1.05rem;
	line-height: 1.65;
	min-height: 100vh;
	-webkit-font-smoothing: antialiased;
}
h1,
h2,
h3 {
	font-family: var(--font-display);
	font-weight: 400;
	color: var(--moon-100);
	line-height: 1.1;
	letter-spacing: 0.01em;
}
h1 {
	font-size: clamp(2.4rem, 6vw, 4rem);
}
a {
	color: var(--silver);
	text-decoration: none;
}
a:hover {
	color: var(--moon-100);
}
:focus-visible {
	outline: 2px solid var(--candle);
	outline-offset: 3px;
	border-radius: 4px;
}
.container {
	max-width: var(--maxw);
	margin: 0 auto;
	padding: var(--space-8) var(--space-6);
}
.eyebrow {
	font-family: var(--font-ui);
	text-transform: uppercase;
	letter-spacing: 0.22em;
	font-size: 0.72rem;
	color: var(--moon-300);
}
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.001ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.001ms !important;
	}
}
```

- [ ] **Step 6: Wire styles into the root layout**

Replace `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/fonts.css';
	import '$lib/styles/global.css';
	let { children } = $props();
</script>

<a class="skip" href="#main">Skip to content</a>
<main id="main">
	{@render children()}
</main>

<style>
	.skip {
		position: absolute;
		left: -9999px;
	}
	.skip:focus {
		left: var(--space-4);
		top: var(--space-4);
		z-index: 10;
		background: var(--ink-700);
		padding: var(--space-2) var(--space-4);
		border-radius: 8px;
	}
</style>
```

- [ ] **Step 7: Validate the layout component with Svelte MCP**

Use the `svelte-autofixer` tool on `+layout.svelte`. Fix any reported issues; repeat until clean.

- [ ] **Step 8: Verify it renders**

Run: `bun run dev` and load `/`. Expected: dark twilight background, no console errors, Aktura visible on any heading.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: moonlit design tokens, self-hosted fonts, global styles"
```

---

### Task 3: Display labels + filter/search logic (pure, tested)

**Files:**

- Create: `src/lib/data/labels.ts`
- Create: `src/lib/data/filter.ts`
- Test: `src/lib/data/filter.test.ts`

**Interfaces:**

- Produces:
  - `labels.ts`: `SUIT_LABEL: Record<Suit,string>`, `ELEMENT_LABEL: Record<Element,string>`, `RANK_LABEL: Record<Rank,string>`, `ELEMENT_VAR: Record<Element,string>` (maps element → CSS var name).
  - `filter.ts`: `type CardFilter = { arcana?: Arcana; suit?: Suit; element?: Element; planet?: string; query?: string }`; `filterCards(cards: CardContent[], f: CardFilter): CardContent[]`; `facetCounts(cards: CardContent[]): { elements: Record<string,number>; suits: Record<string,number>; planets: string[] }`.

- [ ] **Step 1: Write labels.ts**

```ts
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
```

- [ ] **Step 2: Write the failing filter test**

Create `src/lib/data/filter.test.ts`:

```ts
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
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `bun run test:unit -- --run src/lib/data/filter.test.ts`
Expected: FAIL — `filter.ts` does not exist / exports missing.

- [ ] **Step 4: Implement filter.ts**

```ts
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
	return cards.filter((c) => {
		if (f.arcana && c.arcana !== f.arcana) return false;
		if (f.suit && c.suit !== f.suit) return false;
		if (f.element && c.correspondences.element !== f.element) return false;
		if (f.planet && c.correspondences.planet !== f.planet) return false;
		if (q) {
			const hay = [c.name, c.essence, ...c.keywords, ...c.keywordsReversed].join(' ').toLowerCase();
			if (!hay.includes(q)) return false;
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test:unit -- --run src/lib/data/filter.test.ts`
Expected: PASS (all cases).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: card display labels and tested filter/search logic"
```

---

### Task 4: Content-integrity test (guards the data)

**Files:**

- Test: `src/lib/data/cards.content.test.ts`

**Interfaces:**

- Consumes: `CARDS` from `src/lib/data`, `static/cards/*.jpg` on disk.

- [ ] **Step 1: Write the content-integrity test**

Create `src/lib/data/cards.content.test.ts` (this is the executable form of `scripts/check-cards.mjs`, run in CI):

```ts
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
			for (const f of [
				'name',
				'essence',
				'symbolismProse',
				'upright',
				'reversed',
				'mythology'
			] as const) {
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
```

- [ ] **Step 2: Run it**

Run: `bun run test:unit -- --run src/lib/data/cards.content.test.ts`
Expected: PASS. (If the image test fails, the art download — `scripts/fetch-art.sh` — must finish first.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: content-integrity guard for the 78-card data set"
```

---

### Task 5: The `<TarotCard>` 3D component

**Files:**

- Create: `src/lib/components/TarotCard.svelte`
- Test: `src/lib/components/TarotCard.svelte.test.ts`

**Interfaces:**

- Consumes: `CardContent` (uses `image`, `name`, `arcana`).
- Produces: `<TarotCard card={CardContent} size?='thumb'|'hero' flippable?=boolean />`. Renders an `<img>` with descriptive `alt`; pointer-tilt + holographic sheen on `hero`; flip on click/Enter when `flippable`.

- [ ] **Step 1: Write a render/behavior test**

Create `src/lib/components/TarotCard.svelte.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TarotCard from './TarotCard.svelte';
import { getCard } from '$lib/data';

const moon = getCard('the-moon')!;

describe('TarotCard', () => {
	it('renders the card art with descriptive alt text', async () => {
		const screen = render(TarotCard, { card: moon, size: 'hero' });
		const img = screen.getByRole('img');
		await expect.element(img).toHaveAttribute('alt', /The Moon/);
		await expect.element(img).toHaveAttribute('src', '/cards/the-moon.jpg');
	});

	it('exposes a button affordance when flippable', async () => {
		const screen = render(TarotCard, { card: moon, size: 'hero', flippable: true });
		await expect.element(screen.getByRole('button')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:unit -- --run src/lib/components/TarotCard.svelte.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement TarotCard.svelte**

```svelte
<script lang="ts">
	import type { CardContent } from '$lib/data';

	let {
		card,
		size = 'thumb',
		flippable = false
	}: {
		card: CardContent;
		size?: 'thumb' | 'hero';
		flippable?: boolean;
	} = $props();

	let rx = $state(0); // rotateX
	let ry = $state(0); // rotateY
	let gx = $state(50); // glare x %
	let gy = $state(50);
	let flipped = $state(false);
	let active = $state(false);

	function onmove(e: PointerEvent) {
		if (size !== 'hero') return;
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		ry = (px - 0.5) * 18;
		rx = (0.5 - py) * 18;
		gx = px * 100;
		gy = py * 100;
		active = true;
	}
	function reset() {
		rx = 0;
		ry = 0;
		gx = 50;
		gy = 50;
		active = false;
	}
	function flip() {
		if (flippable) flipped = !flipped;
	}
	function onkey(e: KeyboardEvent) {
		if (flippable && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			flip();
		}
	}
</script>

<div
	class="card {size}"
	class:active
	class:flipped
	role={flippable ? 'button' : undefined}
	tabindex={flippable ? 0 : undefined}
	aria-label={flippable ? `${card.name} — activate to flip` : undefined}
	onpointermove={onmove}
	onpointerleave={reset}
	onclick={flip}
	onkeydown={onkey}
	style="--rx:{rx}deg; --ry:{ry}deg; --gx:{gx}%; --gy:{gy}%;"
>
	<div class="inner">
		<div class="face front">
			<img
				src={card.image}
				alt="The {card.name} tarot card, Rider–Waite–Smith deck"
				loading="lazy"
			/>
			<div class="foil" aria-hidden="true"></div>
			<div class="edge" aria-hidden="true"></div>
		</div>
		<div class="face back" aria-hidden="true">
			<div class="sigil">☽</div>
		</div>
	</div>
</div>

<style>
	.card {
		perspective: 1000px;
		width: 100%;
		aspect-ratio: 0.585;
	}
	.hero {
		max-width: 360px;
	}
	.inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 0.25s ease;
		border-radius: var(--radius);
	}
	.active .inner {
		transition: transform 0.05s linear;
	}
	.flipped .inner {
		transform: rotateY(180deg);
	}
	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--glow-moon);
	}
	.front img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.foil {
		position: absolute;
		inset: 0;
		mix-blend-mode: color-dodge;
		opacity: 0;
		transition: opacity 0.2s;
		background: radial-gradient(
			circle at var(--gx) var(--gy),
			rgba(240, 194, 123, 0.5),
			rgba(154, 108, 240, 0.25) 40%,
			transparent 70%
		);
	}
	.active .foil {
		opacity: 0.9;
	}
	.edge {
		position: absolute;
		inset: 0;
		border-radius: var(--radius);
		box-shadow: inset 0 0 0 1px rgba(201, 212, 232, 0.35);
	}
	.back {
		transform: rotateY(180deg);
		display: grid;
		place-items: center;
		background: radial-gradient(circle, var(--ink-600), var(--ink-800));
	}
	.sigil {
		font-size: 3rem;
		color: var(--silver);
		text-shadow: var(--glow-moon);
	}
	@media (prefers-reduced-motion: reduce) {
		.inner,
		.active .inner {
			transition: none;
			transform: none;
		}
		.flipped .inner {
			transform: rotateY(180deg);
		}
		.foil {
			display: none;
		}
	}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:unit -- --run src/lib/components/TarotCard.svelte.test.ts`
Expected: PASS.

- [ ] **Step 5: Validate with Svelte MCP**

Run `svelte-autofixer` on `TarotCard.svelte`; fix until clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 3D TarotCard with tilt, holographic foil, flip, reduced-motion"
```

---

### Task 6: Ambient atmosphere — MoonPhase & MistLayer

**Files:**

- Create: `src/lib/components/MoonPhase.svelte`, `src/lib/components/MistLayer.svelte`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**

- Produces: `<MoonPhase size?=number />` (decorative SVG moon with glow); `<MistLayer />` (fixed, `aria-hidden` drifting gradient haze behind content). MistLayer renders nothing animated under `prefers-reduced-motion`.

- [ ] **Step 1: Implement MistLayer.svelte**

```svelte
<div class="mist" aria-hidden="true">
	<span class="cloud a"></span>
	<span class="cloud b"></span>
	<span class="cloud c"></span>
</div>

<style>
	.mist {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}
	.cloud {
		position: absolute;
		width: 60vw;
		height: 60vw;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.22;
	}
	.a {
		background: var(--amethyst);
		top: -10%;
		left: -10%;
		animation: drift 38s ease-in-out infinite alternate;
	}
	.b {
		background: var(--el-water);
		bottom: -15%;
		right: -10%;
		animation: drift 52s ease-in-out infinite alternate-reverse;
	}
	.c {
		background: var(--sage);
		top: 30%;
		left: 40%;
		opacity: 0.12;
		animation: drift 64s ease-in-out infinite alternate;
	}
	@keyframes drift {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(6%, -8%, 0) scale(1.15);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cloud {
			animation: none;
		}
	}
</style>
```

- [ ] **Step 2: Implement MoonPhase.svelte**

```svelte
<script lang="ts">
	let { size = 120 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 100 100" class="moon" aria-hidden="true">
	<defs>
		<radialGradient id="mg" cx="40%" cy="35%">
			<stop offset="0%" stop-color="var(--moon-100)" />
			<stop offset="100%" stop-color="var(--moon-300)" />
		</radialGradient>
	</defs>
	<circle cx="50" cy="50" r="38" fill="url(#mg)" />
	<circle cx="62" cy="44" r="6" fill="rgba(20,18,43,0.12)" />
	<circle cx="44" cy="62" r="4" fill="rgba(20,18,43,0.1)" />
</svg>

<style>
	.moon {
		filter: drop-shadow(var(--glow-moon));
	}
</style>
```

- [ ] **Step 3: Mount MistLayer globally**

In `src/routes/+layout.svelte`, add the import and render it above `<main>`:

```svelte
<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/fonts.css';
	import '$lib/styles/global.css';
	import MistLayer from '$lib/components/MistLayer.svelte';
	let { children } = $props();
</script>

<MistLayer />
<a class="skip" href="#main">Skip to content</a>
<main id="main">
	{@render children()}
</main>
```

- [ ] **Step 4: Validate both components with Svelte MCP**

Run `svelte-autofixer` on `MistLayer.svelte` and `MoonPhase.svelte`; fix until clean.

- [ ] **Step 5: Verify visually**

Run: `bun run dev`, load `/`. Expected: soft drifting colored haze behind content; no layout shift; no console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ambient MistLayer and MoonPhase atmosphere"
```

---

### Task 7: Library — CardThumb, CardGrid, FilterBar, /library route

**Files:**

- Create: `src/lib/components/CardThumb.svelte`, `src/lib/components/CardGrid.svelte`, `src/lib/components/FilterBar.svelte`
- Create: `src/routes/library/+page.svelte`

**Interfaces:**

- Consumes: `CARDS`, `filterCards`, `facetCounts`, `CardFilter`, labels, `TarotCard`.
- Produces: `<CardThumb card />` (links to `/card/{id}`, shows TarotCard thumb + name); `<CardGrid cards />`; `<FilterBar bind:filter />` emitting a `CardFilter`.

- [ ] **Step 1: Implement CardThumb.svelte**

```svelte
<script lang="ts">
	import type { CardContent } from '$lib/data';
	import TarotCard from './TarotCard.svelte';
	let { card }: { card: CardContent } = $props();
</script>

<a class="thumb" href="/card/{card.id}">
	<TarotCard {card} size="thumb" />
	<span class="name">{card.name}</span>
</a>

<style>
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
</style>
```

- [ ] **Step 2: Implement CardGrid.svelte**

```svelte
<script lang="ts">
	import type { CardContent } from '$lib/data';
	import CardThumb from './CardThumb.svelte';
	let { cards }: { cards: CardContent[] } = $props();
</script>

{#if cards.length === 0}
	<p class="empty">No cards match this filter. Clear it to wander freely.</p>
{:else}
	<div class="grid">
		{#each cards as card (card.id)}
			<CardThumb {card} />
		{/each}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--space-8) var(--space-6);
	}
	.empty {
		color: var(--moon-300);
		font-style: italic;
		text-align: center;
		padding: var(--space-16) 0;
	}
</style>
```

- [ ] **Step 3: Implement FilterBar.svelte**

```svelte
<script lang="ts">
	import type { CardFilter } from '$lib/data/filter';
	import type { Arcana, Suit, Element } from '$lib/data';
	import { SUIT_LABEL, ELEMENT_LABEL } from '$lib/data/labels';

	let { filter = $bindable() }: { filter: CardFilter } = $props();

	const arcana: Arcana[] = ['major', 'minor'];
	const suits: Suit[] = ['wands', 'cups', 'swords', 'pentacles'];
	const elements: Element[] = ['fire', 'water', 'air', 'earth', 'spirit'];

	function toggle<K extends keyof CardFilter>(key: K, value: CardFilter[K]) {
		filter = { ...filter, [key]: filter[key] === value ? undefined : value };
	}
	function clearAll() {
		filter = {};
	}
</script>

<div class="bar">
	<input
		class="search"
		type="search"
		placeholder="Search the deck…"
		value={filter.query ?? ''}
		oninput={(e) => (filter = { ...filter, query: e.currentTarget.value })}
		aria-label="Search cards by name or keyword"
	/>
	<div class="groups">
		<fieldset>
			<legend>Arcana</legend>
			{#each arcana as a}
				<button class:on={filter.arcana === a} onclick={() => toggle('arcana', a)}>{a}</button>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Suit</legend>
			{#each suits as s}
				<button class:on={filter.suit === s} onclick={() => toggle('suit', s)}
					>{SUIT_LABEL[s]}</button
				>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Element</legend>
			{#each elements as el}
				<button class:on={filter.element === el} onclick={() => toggle('element', el)}
					>{ELEMENT_LABEL[el]}</button
				>
			{/each}
		</fieldset>
	</div>
	<button class="clear" onclick={clearAll}>Clear</button>
</div>

<style>
	.bar {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	.search {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: var(--radius);
		color: var(--moon-100);
		font-family: var(--font-ui);
	}
	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	legend {
		float: left;
		margin-right: var(--space-2);
		font-family: var(--font-ui);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.66rem;
		color: var(--moon-300);
	}
	button {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		padding: var(--space-1) var(--space-3);
		background: transparent;
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-200);
		cursor: pointer;
		text-transform: capitalize;
	}
	button.on {
		background: var(--candle);
		color: var(--ink-900);
		border-color: var(--candle);
		box-shadow: var(--glow-candle);
	}
	.clear {
		justify-self: start;
	}
</style>
```

- [ ] **Step 4: Implement /library route**

Create `src/routes/library/+page.svelte`:

```svelte
<script lang="ts">
	import { CARDS } from '$lib/data';
	import { filterCards, type CardFilter } from '$lib/data/filter';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import CardGrid from '$lib/components/CardGrid.svelte';

	let filter = $state<CardFilter>({});
	const visible = $derived(filterCards(CARDS, filter));
</script>

<svelte:head><title>The Deck · Moonlit Grimoire</title></svelte:head>

<section class="container">
	<p class="eyebrow">The Deck</p>
	<h1>Seventy-eight doorways</h1>
	<FilterBar bind:filter />
	<p class="count">{visible.length} cards</p>
	<CardGrid cards={visible} />
</section>

<style>
	.count {
		font-family: var(--font-ui);
		color: var(--moon-300);
		font-size: 0.8rem;
		margin: 0 0 var(--space-4);
	}
</style>
```

- [ ] **Step 5: Validate components with Svelte MCP**

Run `svelte-autofixer` on `CardThumb.svelte`, `CardGrid.svelte`, `FilterBar.svelte`, and `library/+page.svelte`; fix until clean.

- [ ] **Step 6: Verify in browser**

Run: `bun run dev`, load `/library`. Expected: grid of 78 cards; clicking Suit→Cups shows 14; typing "moon" narrows to The Moon; Clear restores all.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: library route with card grid, filters, and search"
```

---

### Task 8: Card detail panels — SymbolList, CorrespondencePanel, SourceList

**Files:**

- Create: `src/lib/components/SymbolList.svelte`, `src/lib/components/CorrespondencePanel.svelte`, `src/lib/components/SourceList.svelte`

**Interfaces:**

- Consumes: `CardContent` sub-objects.
- Produces: `<SymbolList symbols={SymbolNote[]} />`; `<CorrespondencePanel correspondences={Correspondences} />`; `<SourceList sources={Source[]} />`.

- [ ] **Step 1: Implement SymbolList.svelte**

```svelte
<script lang="ts">
	import type { SymbolNote } from '$lib/data';
	let { symbols }: { symbols: SymbolNote[] } = $props();
</script>

<ul class="symbols">
	{#each symbols as s}
		<li><span class="sym">{s.symbol}</span><span class="mean">{s.meaning}</span></li>
	{/each}
</ul>

<style>
	.symbols {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
	}
	li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		background: var(--veil);
		border-radius: var(--radius);
		border-left: 2px solid var(--candle-soft);
	}
	.sym {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--moon-100);
	}
	.mean {
		color: var(--moon-200);
		font-size: 0.95rem;
	}
</style>
```

- [ ] **Step 2: Implement CorrespondencePanel.svelte**

```svelte
<script lang="ts">
	import type { Correspondences, Element } from '$lib/data';
	import { ELEMENT_LABEL, ELEMENT_VAR } from '$lib/data/labels';
	let { correspondences: c }: { correspondences: Correspondences } = $props();

	const rows = $derived(
		[
			['Element', ELEMENT_LABEL[c.element]],
			['Planet', c.planet],
			['Zodiac', c.zodiac],
			['Decan', c.decan],
			[
				'Hebrew letter',
				c.hebrewLetter
					? `${c.hebrewLetter.letter} ${c.hebrewLetter.name} (${c.hebrewLetter.meaning})`
					: undefined
			],
			['Tree of Life', c.treePath],
			['Number', `${c.numerology.number} — ${c.numerology.meaning}`]
		].filter(([, v]) => v) as [string, string][]
	);
	const elColor = $derived(`var(${ELEMENT_VAR[c.element as Element]})`);
</script>

<dl class="corr" style="--accent:{elColor}">
	{#each rows as [k, v]}
		<dt>{k}</dt>
		<dd>{v}</dd>
	{/each}
</dl>

<style>
	.corr {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--space-2) var(--space-4);
		margin: 0;
	}
	dt {
		font-family: var(--font-ui);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 0.68rem;
		color: var(--accent);
		align-self: baseline;
	}
	dd {
		margin: 0;
		color: var(--moon-100);
	}
</style>
```

- [ ] **Step 3: Implement SourceList.svelte**

```svelte
<script lang="ts">
	import type { Source } from '$lib/data';
	let { sources }: { sources: Source[] } = $props();
</script>

<ul class="sources">
	{#each sources as s}
		<li>
			<a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>
			<p>{s.note}</p>
		</li>
	{/each}
</ul>

<style>
	.sources {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-4);
	}
	a {
		font-family: var(--font-ui);
		color: var(--candle);
		font-size: 0.9rem;
	}
	p {
		margin: var(--space-1) 0 0;
		color: var(--moon-300);
		font-size: 0.88rem;
	}
</style>
```

- [ ] **Step 4: Validate with Svelte MCP**

Run `svelte-autofixer` on all three; fix until clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: card-detail panels (symbols, correspondences, sources)"
```

---

### Task 9: Card detail route `/card/[id]`

**Files:**

- Create: `src/routes/card/[id]/+page.ts`
- Create: `src/routes/card/[id]/+page.svelte`

**Interfaces:**

- Consumes: `getCard`, `CARDS`, `TarotCard`, `SymbolList`, `CorrespondencePanel`, `SourceList`, progress store (marks card studied).
- Produces: prerendered page per card id; `entries()` enumerates all 78.

- [ ] **Step 1: Write the load + prerender entries**

Create `src/routes/card/[id]/+page.ts`:

```ts
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
```

- [ ] **Step 2: Implement the detail page**

Create `src/routes/card/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import TarotCard from '$lib/components/TarotCard.svelte';
	import SymbolList from '$lib/components/SymbolList.svelte';
	import CorrespondencePanel from '$lib/components/CorrespondencePanel.svelte';
	import SourceList from '$lib/components/SourceList.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const card = $derived(data.card);
	$effect(() => {
		progress.markStudied(card.id);
	});
</script>

<svelte:head><title>{card.name} · Moonlit Grimoire</title></svelte:head>

<article class="container detail">
	<header class="hero">
		<TarotCard {card} size="hero" flippable />
		<div class="intro">
			<p class="eyebrow">
				{card.arcana === 'major' ? `Major Arcana · ${card.number}` : `${card.suit}`}
			</p>
			<h1>{card.name}</h1>
			<p class="essence">{card.essence}</p>
			<ul class="keywords">
				{#each card.keywords as k}<li>{k}</li>{/each}
			</ul>
		</div>
	</header>

	<section>
		<h2>Symbolism</h2>
		<SymbolList symbols={card.symbolism} />
		<p class="prose">{card.symbolismProse}</p>
	</section>

	<section class="two">
		<div>
			<h2>Upright</h2>
			<p class="prose">{card.upright}</p>
		</div>
		<div>
			<h2>Reversed</h2>
			<p class="prose">{card.reversed}</p>
		</div>
	</section>

	<section>
		<h2>Correspondences</h2>
		<CorrespondencePanel correspondences={card.correspondences} />
	</section>

	<section>
		<h2>Archetype — {card.archetype.name}</h2>
		<p class="prose">{card.archetype.description}</p>
	</section>

	<section>
		<h2>Mythology</h2>
		<p class="prose">{card.mythology}</p>
	</section>

	<section>
		<h2>Nature</h2>
		<p class="prose">
			<strong>Herbs:</strong>
			{card.nature.herbs.join(', ')}<br />
			<strong>Crystals:</strong>
			{card.nature.crystals.join(', ')}{#if card.nature.season}<br /><strong>Season:</strong>
				{card.nature.season}{/if}
		</p>
		{#if card.nature.note}<p class="prose">{card.nature.note}</p>{/if}
	</section>

	<section class="lightshadow">
		<div>
			<h3>Light</h3>
			<p>{card.lightShadow.light}</p>
		</div>
		<div>
			<h3>Shadow</h3>
			<p>{card.lightShadow.shadow}</p>
		</div>
		<p class="affirm">“{card.lightShadow.affirmation}”</p>
	</section>

	{#if card.journey}<section>
			<h2>The Fool's Journey</h2>
			<p class="prose">{card.journey}</p>
		</section>{/if}

	<section>
		<h2>Sources & further reading</h2>
		<SourceList sources={card.sources} />
	</section>

	<nav class="pager">
		<a href="/card/{data.prev.id}">← {data.prev.name}</a>
		<a href="/library">All cards</a>
		<a href="/card/{data.next.id}">{data.next.name} →</a>
	</nav>
</article>

<style>
	.detail {
		display: grid;
		gap: var(--space-12);
	}
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 360px) 1fr;
		gap: var(--space-8);
		align-items: center;
	}
	.essence {
		font-size: 1.2rem;
		color: var(--moon-100);
		font-style: italic;
	}
	.keywords {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		padding: 0;
	}
	.keywords li {
		font-family: var(--font-ui);
		font-size: 0.74rem;
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-200);
	}
	.prose {
		max-width: 60ch;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
	}
	.lightshadow {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}
	.affirm {
		grid-column: 1 / -1;
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--candle);
		text-align: center;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		font-family: var(--font-ui);
		border-top: 1px solid var(--ink-600);
		padding-top: var(--space-6);
	}
	@media (max-width: 720px) {
		.hero,
		.two,
		.lightshadow {
			grid-template-columns: 1fr;
		}
	}
</style>
```

- [ ] **Step 3: Validate with Svelte MCP**

Run `svelte-autofixer` on `card/[id]/+page.svelte`; fix until clean.

- [ ] **Step 4: Verify build prerenders all 78**

Run: `bun run build`
Expected: `build/card/the-fool/index.html` … all 78 exist; no prerender errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: card detail route with full content and prev/next, prerendered per card"
```

---

### Task 10: Progress store (localStorage, SSR-safe, tested)

**Files:**

- Create: `src/lib/stores/progress.svelte.ts`
- Test: `src/lib/stores/progress.test.ts`

**Interfaces:**

- Produces: a singleton `progress` with reactive `studied: string[]`, `favorites: string[]`, `journeyIndex: number`, `lastCardId: string | null`; methods `markStudied(id)`, `toggleFavorite(id)`, `isStudied(id): boolean`, `isFavorite(id): boolean`, `setJourneyIndex(n)`, `reset()`. SSR-safe (no `window` access during prerender); persists to `localStorage` key `moonlit-grimoire`.

- [ ] **Step 1: Write the failing store test**

Create `src/lib/stores/progress.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createProgress } from './progress.svelte';

describe('progress store', () => {
	let p: ReturnType<typeof createProgress>;
	beforeEach(() => {
		localStorage.clear();
		p = createProgress();
	});

	it('marks a card studied idempotently', () => {
		p.markStudied('the-moon');
		p.markStudied('the-moon');
		expect(p.isStudied('the-moon')).toBe(true);
		expect(p.studied.filter((x) => x === 'the-moon').length).toBe(1);
	});
	it('toggles favorites', () => {
		p.toggleFavorite('the-star');
		expect(p.isFavorite('the-star')).toBe(true);
		p.toggleFavorite('the-star');
		expect(p.isFavorite('the-star')).toBe(false);
	});
	it('tracks last card and journey index', () => {
		p.markStudied('the-sun');
		expect(p.lastCardId).toBe('the-sun');
		p.setJourneyIndex(5);
		expect(p.journeyIndex).toBe(5);
	});
	it('persists across instances', () => {
		p.markStudied('death');
		const p2 = createProgress();
		expect(p2.isStudied('death')).toBe(true);
	});
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun run test:unit -- --run src/lib/stores/progress.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement progress.svelte.ts**

```ts
import { browser } from '$app/environment';

const KEY = 'moonlit-grimoire';

type State = {
	studied: string[];
	favorites: string[];
	journeyIndex: number;
	lastCardId: string | null;
};
const empty = (): State => ({ studied: [], favorites: [], journeyIndex: 0, lastCardId: null });

export function createProgress() {
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

	return {
		get studied() {
			return state.studied;
		},
		get favorites() {
			return state.favorites;
		},
		get journeyIndex() {
			return state.journeyIndex;
		},
		get lastCardId() {
			return state.lastCardId;
		},
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
		setJourneyIndex(n: number) {
			state.journeyIndex = n;
			persist();
		},
		reset() {
			state = empty();
			persist();
		}
	};
}

export const progress = createProgress();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test:unit -- --run src/lib/stores/progress.test.ts`
Expected: PASS. (Runs in the jsdom/browser test environment where `localStorage` exists.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: SSR-safe localStorage progress store with tests"
```

---

### Task 11: Fool's Journey route + ProgressTracker

**Files:**

- Create: `src/lib/components/ProgressTracker.svelte`
- Create: `src/routes/journey/+page.svelte`

**Interfaces:**

- Consumes: `MAJOR_ARCANA`, `progress`, `TarotCard`.
- Produces: `<ProgressTracker total studied />` (a studied-count bar); a guided walk through the 22 Majors in order, stepping via the store's `journeyIndex`, persisting position.

- [ ] **Step 1: Implement ProgressTracker.svelte**

```svelte
<script lang="ts">
	let { total, studied }: { total: number; studied: number } = $props();
	const pct = $derived(Math.round((studied / total) * 100));
</script>

<div
	class="track"
	role="progressbar"
	aria-valuenow={studied}
	aria-valuemin={0}
	aria-valuemax={total}
	aria-label="Cards studied"
>
	<div class="fill" style="width:{pct}%"></div>
	<span class="label">{studied} / {total} studied</span>
</div>

<style>
	.track {
		position: relative;
		height: 10px;
		background: var(--ink-600);
		border-radius: 999px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: linear-gradient(90deg, var(--amethyst), var(--candle));
		box-shadow: var(--glow-candle);
		transition: width 0.4s ease;
	}
	.label {
		position: absolute;
		right: 0;
		top: 14px;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		color: var(--moon-300);
	}
</style>
```

- [ ] **Step 2: Implement /journey route**

Create `src/routes/journey/+page.svelte`:

```svelte
<script lang="ts">
	import { MAJOR_ARCANA } from '$lib/data';
	import TarotCard from '$lib/components/TarotCard.svelte';
	import ProgressTracker from '$lib/components/ProgressTracker.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	const steps = MAJOR_ARCANA; // already in 0–21 order
	let i = $state(progress.journeyIndex);
	const card = $derived(steps[Math.min(i, steps.length - 1)]);

	function go(n: number) {
		i = Math.max(0, Math.min(steps.length - 1, n));
		progress.setJourneyIndex(i);
		progress.markStudied(steps[i].id);
	}
	$effect(() => {
		progress.markStudied(card.id);
	});
</script>

<svelte:head><title>The Fool's Journey · Moonlit Grimoire</title></svelte:head>

<section class="container journey">
	<p class="eyebrow">The Fool's Journey</p>
	<h1>Step {card.number} · {card.name}</h1>
	<ProgressTracker total={steps.length} studied={progress.studied.length} />

	<div class="stage">
		<TarotCard {card} size="hero" flippable />
		<div>
			<p class="essence">{card.essence}</p>
			{#if card.journey}<p class="prose">{card.journey}</p>{/if}
			<a class="more" href="/card/{card.id}">Study this card in full →</a>
		</div>
	</div>

	<nav class="steps">
		<button onclick={() => go(i - 1)} disabled={i === 0}>← Previous</button>
		<button onclick={() => go(i + 1)} disabled={i === steps.length - 1}>Next →</button>
	</nav>
</section>

<style>
	.journey {
		display: grid;
		gap: var(--space-8);
	}
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 320px) 1fr;
		gap: var(--space-8);
		align-items: center;
	}
	.essence {
		font-family: var(--font-display);
		font-size: 1.4rem;
		color: var(--moon-100);
	}
	.more {
		font-family: var(--font-ui);
		color: var(--candle);
	}
	.steps {
		display: flex;
		justify-content: space-between;
	}
	button {
		font-family: var(--font-ui);
		padding: var(--space-2) var(--space-4);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-100);
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	@media (max-width: 720px) {
		.stage {
			grid-template-columns: 1fr;
		}
	}
</style>
```

- [ ] **Step 3: Validate with Svelte MCP**

Run `svelte-autofixer` on `ProgressTracker.svelte` and `journey/+page.svelte`; fix until clean.

- [ ] **Step 4: Verify in browser**

Run: `bun run dev`, load `/journey`. Expected: starts at The Fool; Next advances through Majors; the progress bar grows; reloading resumes at the saved step.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Fool's Journey route with persistent progress tracking"
```

---

### Task 12: The Altar (home) and About pages

**Files:**

- Modify: `src/routes/+page.svelte`
- Create: `src/routes/about/+page.svelte`

**Interfaces:**

- Consumes: `getCard`, `progress`, `MoonPhase`.

- [ ] **Step 1: Implement the Altar home page**

Replace `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import MoonPhase from '$lib/components/MoonPhase.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { getCard } from '$lib/data';
	const last = $derived(progress.lastCardId ? getCard(progress.lastCardId) : undefined);
</script>

<svelte:head><title>Moonlit Grimoire · Learn the Tarot</title></svelte:head>

<section class="altar container">
	<MoonPhase size={140} />
	<h1>The Moonlit Grimoire</h1>
	<p class="lede">
		A sacred study of the seventy-eight cards — their symbols, numbers, stars, and the many
		traditions that illuminate them. One card at a time.
	</p>
	<div class="doors">
		<a class="door" href="/library"
			><span>Enter the Deck</span><small>Browse & filter all 78 cards</small></a
		>
		<a class="door" href="/journey"
			><span>Walk the Fool's Journey</span><small>The 22 Majors, in order</small></a
		>
		{#if last}<a class="door" href="/card/{last.id}"
				><span>Continue</span><small>{last.name}</small></a
			>{/if}
	</div>
	<a class="about-link" href="/about">About the sources & traditions</a>
</section>

<style>
	.altar {
		min-height: 90vh;
		display: grid;
		place-content: center;
		justify-items: center;
		text-align: center;
		gap: var(--space-6);
	}
	.lede {
		max-width: 48ch;
		color: var(--moon-200);
		font-size: 1.15rem;
	}
	.doors {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		justify-content: center;
		margin-top: var(--space-4);
	}
	.door {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-6) var(--space-8);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: var(--radius-lg);
		min-width: 220px;
		transition:
			box-shadow 0.3s,
			transform 0.3s;
	}
	.door:hover {
		box-shadow: var(--glow-moon);
		transform: translateY(-3px);
	}
	.door span {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--moon-100);
	}
	.door small {
		font-family: var(--font-ui);
		color: var(--moon-300);
	}
	.about-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--moon-300);
	}
</style>
```

- [ ] **Step 2: Implement About page**

Create `src/routes/about/+page.svelte`:

```svelte
<svelte:head><title>About · Moonlit Grimoire</title></svelte:head>

<section class="container about">
	<p class="eyebrow">About</p>
	<h1>Sources & traditions</h1>
	<p>
		The Moonlit Grimoire teaches the Rider–Waite–Smith tarot, illustrated by Pamela Colman Smith
		(1909, public domain). Card meanings draw primarily on the Rider–Waite–Smith / Hermetic Order of
		the Golden Dawn tradition, enriched with numerology, astrology, qabalah, mythology, and
		herbal/Wiccan correspondences.
	</p>
	<h2>Canonical references</h2>
	<ul>
		<li>
			<a
				href="https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"
				target="_blank"
				rel="noopener noreferrer">A.E. Waite — The Pictorial Key to the Tarot (1911)</a
			>
		</li>
		<li>
			<a href="https://www.learntarot.com/" target="_blank" rel="noopener noreferrer"
				>Joan Bunning — Learning the Tarot</a
			>
		</li>
		<li>
			<a
				href="https://en.wikipedia.org/wiki/Hermetic_Qabalah"
				target="_blank"
				rel="noopener noreferrer">Golden Dawn / Hermetic Qabalah correspondences</a
			>
		</li>
	</ul>
	<p class="note">
		These are <em>traditional attributions across many schools</em>, offered for study — not a
		single dogma. Every card links to its own sources for deeper reading.
	</p>
	<h2>Art</h2>
	<p>
		Card images: Rider–Waite–Smith deck, public domain, via <a
			href="https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck"
			target="_blank"
			rel="noopener noreferrer">Wikimedia Commons</a
		>.
	</p>
</section>

<style>
	.about {
		max-width: 56rem;
	}
	.about p,
	.about li {
		max-width: 65ch;
	}
	.note {
		color: var(--moon-300);
		font-style: italic;
	}
	a {
		color: var(--candle);
	}
</style>
```

- [ ] **Step 3: Validate with Svelte MCP**

Run `svelte-autofixer` on `+page.svelte` and `about/+page.svelte`; fix until clean.

- [ ] **Step 4: Verify build**

Run: `bun run build`
Expected: `/`, `/about`, `/library`, `/journey`, and all `/card/*` prerender with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Altar home with continue-where-left-off and About page"
```

---

### Task 13: End-to-end tests (Playwright)

**Files:**

- Create: `e2e/grimoire.test.ts`
- Modify: `playwright.config.ts` (ensure `webServer` builds & previews, or runs dev)

**Interfaces:**

- Consumes: the running app.

- [ ] **Step 1: Confirm Playwright webServer config**

Ensure `playwright.config.ts` boots the app, e.g.:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'bun run build && bun run preview', port: 4173 },
	testDir: 'e2e',
	use: { baseURL: 'http://localhost:4173' }
});
```

- [ ] **Step 2: Write the e2e spec**

Create `e2e/grimoire.test.ts`:

```ts
import { expect, test } from '@playwright/test';

test('library filters and opens a card', async ({ page }) => {
	await page.goto('/library');
	await expect(page.getByText('78 cards')).toBeVisible();
	await page.getByRole('button', { name: 'Cups' }).click();
	await expect(page.getByText('14 cards')).toBeVisible();
	await page
		.getByRole('link', { name: /Ace of Cups/ })
		.first()
		.click();
	await expect(page.getByRole('heading', { level: 1, name: 'Ace of Cups' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Sources & further reading/ })).toBeVisible();
});

test('a card can be flipped via keyboard', async ({ page }) => {
	await page.goto('/card/the-moon');
	const card = page.getByRole('button', { name: /The Moon — activate to flip/ });
	await card.focus();
	await page.keyboard.press('Enter');
	await expect(card).toHaveClass(/flipped/);
});

test('journey advances and persists across reload', async ({ page }) => {
	await page.goto('/journey');
	await expect(page.getByRole('heading', { level: 1, name: /Step 0 · The Fool/ })).toBeVisible();
	await page.getByRole('button', { name: 'Next →' }).click();
	await expect(
		page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })
	).toBeVisible();
	await page.reload();
	await expect(
		page.getByRole('heading', { level: 1, name: /Step 1 · The Magician/ })
	).toBeVisible();
});
```

- [ ] **Step 3: Run e2e**

Run: `bun run test:e2e`
Expected: all three tests PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: end-to-end coverage for library, card flip, and journey persistence"
```

---

### Task 14: Final verification & polish pass

**Files:** (cross-cutting; touch only what fails)

- [ ] **Step 1: Full check suite**

Run: `bun run lint && bun run check && bun run test:unit -- --run && bun run build`
Expected: lint clean, `svelte-check` 0 errors, all unit tests pass, build prerenders all routes.

- [ ] **Step 2: Reduced-motion smoke check**

In the browser devtools, enable "Emulate prefers-reduced-motion: reduce". Load `/card/the-moon`. Expected: no tilt/parallax/mist animation; flip still toggles (instant). Content fully readable.

- [ ] **Step 3: Mobile layout check**

At 390px width, verify `/library` grid reflows, `/card/[id]` hero stacks vertically, filters wrap. Fix any overflow with the existing `@media (max-width: 720px)` blocks.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "polish: lint/type/reduced-motion/responsive fixes"
```

---

## Self-Review

**Spec coverage:**

- Routes `/`, `/library`, `/card/[id]`, `/journey`, `/about` → Tasks 12, 7, 9, 11, 12. ✓
- All 78 cards + content + sources → existing data layer; guarded by Task 4. ✓
- Filtering (arcana/suit/element/planet) + search → Task 3 (logic) + Task 7 (UI). ✓
- 3D card (tilt/foil/flip/glow, reduced-motion, a11y) → Task 5. ✓
- Moonlit aesthetic (palette/Aktura/Sentient/mist/moon) → Tasks 2, 6. ✓
- Archetype + all lenses surfaced → Task 9. ✓
- Sources panel → Tasks 8, 9. ✓
- Local progress + Fool's Journey → Tasks 10, 11. ✓
- Prerendered static build → Tasks 1, 9. ✓
- Vitest (content/filter/store) + Playwright → Tasks 3, 4, 10, 13. ✓
- Accessibility & reduced-motion → Tasks 2, 5, 14. ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete code; the only deferred value is the exact downloaded font filenames (Task 2 Step 2 records them before they're referenced in Step 3). ✓

**Type consistency:** `CardFilter`, `filterCards`, `facetCounts` (Task 3) used identically in Task 7. `createProgress`/`progress` methods (`markStudied`, `toggleFavorite`, `isStudied`, `setJourneyIndex`) defined in Task 10 match usage in Tasks 9, 11, 12. `TarotCard` props (`card`, `size`, `flippable`) consistent across Tasks 5, 7, 9, 11. Data types (`CardContent`, `Source`, `SymbolNote`, `Correspondences`, `Element`, `Suit`) imported from `$lib/data` everywhere. ✓
