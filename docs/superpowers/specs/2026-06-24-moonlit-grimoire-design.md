# The Moonlit Grimoire — Design Spec

**Date:** 2026-06-24
**Status:** Approved (design phase complete)
**Stack:** SvelteKit (Svelte 5 runes), TypeScript, bun, static prerender, Vitest + Playwright

---

## 1. Vision

An interactive web app for **deeply learning the tarot, one card at a time** — a "study grimoire." Each of the 78 cards is presented with a full, multi-tradition illumination of its meaning (symbolism, numerology, astrology, qabalah, mythology, the elements, nature/Wicca correspondences), rendered through a beautiful animated 3D card display inside a magical, mysterious "moonlit witch's altar" atmosphere.

The grimoire is **trustworthy**: every card's information is grounded in cited, verifiable sources that point the reader toward further study. The content is **immersive yet digestible** — layered and scannable, never a wall of text.

This is a learning tool first. Divination/readings are explicitly out of scope for v1.

---

## 2. Goals & Non-Goals

### Goals (v1)
- All **78 cards** (22 Major Arcana + 56 Minor Arcana) with rich, sourced content.
- A browsable **Library** with filtering (arcana, suit, element, planet/sign) and search.
- A **Card detail** view with an animated CSS-3D card and layered, digestible content.
- An optional guided **Fool's Journey** through the Majors, with local progress tracking.
- The full **moonlit-altar** aesthetic: palette, typography (Aktura headings), motion, texture.
- **Per-card sources** (verified link + descriptive note) grounding all information.
- Fully **prerendered static site**, works offline, no backend, no accounts.

### Non-Goals (v1 — explicitly deferred)
- Readings / spreads / interpretation of drawn cards.
- WebGL / Three.js immersive 3D scene.
- User accounts, cloud sync, multi-device.
- Audio / soundscapes.
- Custom/alternate decks.
- Reversal-specific card art or advanced animation beyond the core set.

---

## 3. Experience & Routes

All routes are prerendered.

| Route | Name | Purpose |
|---|---|---|
| `/` | **The Altar** | Atmospheric landing; moon-phase motif; enter Library or Journey; "continue where you left off." |
| `/library` | **The Deck** | All 78 cards as a luminous, floating grid. Filter by arcana / suit / element / planet-sign; text search by name & keyword. |
| `/card/[id]` | **The Card** | Centerpiece: large 3D card + layered multi-tradition reading + Sources panel. Prev/next within current context. |
| `/journey` | **The Fool's Journey** | Guided sequential path through the 22 Majors (then suit by suit), with progress and a gentle "next step." |
| `/about` | **About** | Canonical reference works, public-domain art attribution, statement that correspondences are traditional attributions across schools (not single dogma). |

---

## 4. Content Model — the soul

Every card is a typed object in `src/lib/data/cards/`. The schema is designed so the UI can present content **layered and scannable** rather than as a blob.

```ts
type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit';
type Arcana  = 'major' | 'minor';
type Suit    = 'wands' | 'cups' | 'swords' | 'pentacles';
type Rank    = 'ace' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven'
             | 'eight' | 'nine' | 'ten' | 'page' | 'knight' | 'queen' | 'king';

interface Source {
  title: string;   // e.g. "Waite — The Pictorial Key to the Tarot (1911)"
  url: string;     // stable, verified-resolvable link
  note: string;    // what the reader finds there / why it matters
}

interface SymbolNote {
  symbol: string;  // a discrete element in the image, e.g. "The white rose"
  meaning: string; // its short, specific significance
}

interface Correspondences {
  element: Element;
  zodiac?: string;                 // e.g. "Pisces"
  planet?: string;                 // e.g. "Moon"
  decan?: string;                  // minors: e.g. "3rd decan of Pisces (Mars)"
  hebrewLetter?: { letter: string; name: string; meaning: string };  // majors
  treePath?: string;               // majors: path between sephiroth; minors: sephira
  numerology: { number: number; meaning: string };
}

interface CardContent {
  // identity
  id: string;            // kebab e.g. "the-moon", "ace-of-cups", "queen-of-wands"
  name: string;
  arcana: Arcana;
  number: number;        // 0–21 majors; 1–10 / 11–14 court for minors
  suit?: Suit;           // minors only
  rank?: Rank;           // minors only
  image: string;         // "/cards/the-moon.jpg"

  // the heart — immersive but digestible
  essence: string;          // 1–2 evocative sentences capturing the card's core
  symbolism: SymbolNote[];  // 4–8 discrete, scannable image symbols
  symbolismProse: string;   // 2–3 SHORT paragraphs weaving the symbols together

  // meanings (kept short; 1–2 paragraphs each)
  keywords: string[];
  keywordsReversed: string[];
  upright: string;
  reversed: string;

  // the many traditions
  correspondences: Correspondences;
  mythology: string;        // deities, archetypes, myths — short
  nature: { herbs: string[]; crystals: string[]; season?: string; note?: string };
  lightShadow: { light: string; shadow: string; affirmation: string };
  journey?: string;         // Fool's Journey context (majors only)

  // trust
  sources: Source[];        // 2–4 verified sources
}
```

**Content authored for all 78 cards**, drawing primarily from the established **Rider–Waite–Smith / Golden Dawn** tradition (the standard, well-documented correspondence system) plus numerological, mythological, and herbal/nature lenses.

**Immersive & digestible** is a hard content rule:
- `essence` is the hook — one or two luminous sentences.
- `symbolism` is a list of discrete, scannable symbol→meaning notes (the UI can render these as an interactive list keyed to regions of the card).
- `symbolismProse` is limited to 2–3 short paragraphs.
- Each `upright`/`reversed`/`mythology` field is 1–2 short paragraphs.
- The UI sections/tabs these lenses so the reader never faces a wall of text.

---

## 5. Sourcing & Content Authoring Strategy

### 5.1 Sourcing principle — grounded in truth, never fabricated
Every card cites **2–4 real, verifiable sources**, prioritizing public-domain primary texts and stable encyclopedic references:

- **A.E. Waite — *The Pictorial Key to the Tarot* (1911)** (sacred-texts.com) — canonical RWS source, with a section per card. Bedrock for symbolism & divinatory meaning.
- **Wikipedia** — per-card / per-suit articles for historical and cross-tradition context.
- **Joan Bunning — *Learning the Tarot*** (learntarot.com, free) — per-card study pages.
- **Golden Dawn / Hermetic** material (*Book T*, Crowley's *777*) for astrology & qabalah attributions, where a stable public link exists.

The `note` on each source tells the reader exactly what it offers and points toward deeper study.

### 5.2 Authoring via research workflows
Per-card content is produced by **dynamic multi-agent workflows** (ultracode mode), not hand-typed from memory:

1. **Research stage** — one agent per card uses web search + fetch to gather from the canonical sources above, then emits structured `CardContent` JSON matching the schema. The agent **verifies each source URL resolves** (via fetch) before including it.
2. **Verification stage** — an adversarial checker validates:
   - Correspondences (element / planet / zodiac / decan / Hebrew letter / Tree path) against the Golden Dawn standard.
   - That cited sources actually support the stated content.
   - That prose is **digestible** (length caps respected) and **immersive**.
3. A **format-pilot** (≈5 representative cards: a Major with astrology+Hebrew, another Major, an Ace, a pip-with-decan, a Court) is produced and reviewed **before** the full 78-card fan-out, to lock the content shape and quality bar.

### 5.3 Integrity guardrails
- Only URLs verified to resolve are recorded — no guessed/fabricated links.
- `bun run check:sources` — optional script that pings every source URL to catch link rot.
- Vitest asserts every card has ≥2 sources, each with non-empty `title`/`url`/`note` and a well-formed URL.
- `/about` lists canonical reference works and the "traditional attributions, not dogma" statement.

---

## 6. Card Art Pipeline

- Use the **public-domain Rider–Waite–Smith scans** (Pamela Colman Smith, 1909; PD worldwide).
- Source from **Wikimedia Commons**; download all 78 into `static/cards/<id>.jpg`, named to match card ids.
- A script (`scripts/fetch-art.ts` or documented manual step) populates the folder; a Vitest test asserts all 78 image files exist and every card's `image` path resolves.
- Attribution recorded in `/about`.

---

## 7. The 3D Card Component (`<TarotCard>`)

Pure **CSS 3D transforms** — no WebGL. Layered effect:
- **Perspective tilt** tracking pointer / device-orientation, with subtle parallax on inner layers.
- **Holographic foil** — conic/linear gradient sheen that shifts with tilt angle.
- **Gilded glow** — soft silver/candlelight aura, intensifying on focus/hover.
- **Flip-to-reveal** — an ornate moon-and-stars card back flips to the face.
- Variants/sizes: grid thumb, detail hero.
- **Accessibility:** honors `prefers-reduced-motion` (tilt/flip downgrade to gentle fades), full keyboard focus & activation, descriptive `alt`, art `loading="lazy"`.

---

## 8. Aesthetic System — Moonlit Altar

- **Palette:** twilight indigo/violet base, silver-white moonlight, warm candle-amber accents, muted sage/herb green. Deep and glowing — never flat black. Centralized as CSS custom properties (design tokens) in `src/lib/styles/tokens.css`.
- **Typography:**
  - Display / headings: **Aktura** (Regular 400 only; hierarchy via size, tracking, luminosity — not weight). Self-hosted woff2 from Fontshare (free ITF license).
  - Reading body: a warm, readable serif (proposed Fontshare **Sentient**), self-hosted.
  - Micro-labels / correspondence chips: a clean sans, self-hosted.
- **Texture & motion:** drifting mist/particle haze, a persistent moon-phase element, gentle float/parallax, candle-flicker glows. Calm and ceremonial — nothing jittery. All motion respects `prefers-reduced-motion`.

---

## 9. State & Progress

- No backend, no accounts. **`localStorage`** holds: cards viewed/"studied," Journey position, last card visited, favorites ("sigils").
- A small typed store module (`src/lib/stores/progress.ts`) wraps storage, **SSR-safe** (guards `window`/`localStorage`), with sensible defaults. Everything works offline.

---

## 10. Architecture

```
src/lib/
  data/
    cards/            # 78 typed card files + index.ts (CardContent[])
    correspondences.ts# shared element/planet/zodiac/qabalah lookup tables & labels
    types.ts          # CardContent and related types
  components/
    TarotCard.svelte        # the 3D card
    CardGrid.svelte         # library grid
    FilterBar.svelte        # arcana/suit/element/planet filters + search
    CorrespondencePanel.svelte
    SymbolList.svelte       # scannable symbolism notes
    SourceList.svelte       # sources & further reading
    MoonPhase.svelte
    MistLayer.svelte        # ambient particle/mist background
    ProgressTracker.svelte
  stores/
    progress.ts       # localStorage-backed, SSR-safe
  styles/
    tokens.css        # moonlit design system tokens
    fonts.css         # @font-face (Aktura, Sentient, sans)
src/routes/           # /, /library, /card/[id], /journey, /about  (prerendered)
static/
  cards/              # 78 RWS images
  fonts/              # self-hosted woff2
scripts/
  fetch-art.ts        # populate static/cards
  check-sources.ts    # ping all source URLs
```

- **Static adapter**, `prerender = true` across routes (dynamic `[id]` enumerated from the card index via `entries`).
- Card data is plain TS — instant, type-safe filtering & search; no runtime data fetching.

---

## 11. Accessibility & Performance

- WCAG-minded: keyboard navigation throughout, focus-visible states, sufficient contrast on text over the dark atmosphere, semantic landmarks, `prefers-reduced-motion` everywhere motion appears.
- Performance: lazy-loaded card art, prerendered HTML, minimal JS, CSS-only 3D (GPU-friendly transforms), responsive layouts down to mobile.

---

## 12. Testing Strategy

- **Vitest (unit/content integrity):**
  - All 78 cards present; unique ids; required fields populated.
  - Correspondence enums valid (element/suit/rank within allowed sets).
  - Every card has ≥2 sources, each with non-empty `title`/`url`/`note` and well-formed URL.
  - Every `image` path corresponds to an existing file in `static/cards/`.
  - Content length caps respected (symbolismProse / meanings within digestible bounds).
  - Filter & search functions return correct subsets; progress store logic.
- **Playwright (e2e):**
  - Navigate to a card; flip it; Sources panel renders links.
  - Filter the Library by element/suit; search by name.
  - Journey advances and persists across reload.
  - Reduced-motion path renders without tilt/flip animation.

---

## 13. Build & Deploy

- `bun run dev`, `bun run build`, `bun run preview`.
- Static output (adapter-auto → static); deployable to any static host.
- Lint/format via existing prettier + eslint config; `bun run check` for svelte-check.

---

## 14. Open Questions / Future

- Body & label font final selection (Sentient proposed) — confirm during build.
- Possible future modes (deferred): readings/spreads, WebGL altar, audio, accounts/sync, daily-card ritual, reversal animations.
