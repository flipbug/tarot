# Reading Stack — Design Spec

**Date:** 2026-06-24
**Status:** Approved (design phase complete)
**Stack:** SvelteKit (Svelte 5 runes), TypeScript, bun, static prerender, localStorage only

---

## 1. Goal

While doing a tarot reading, let the user collect specific cards into a single working **reading tray** for quick reference and easy back-and-forth navigation. Each entry can be marked reversed and given a short note or position label. The tray is a manual study aid, not a fortune-teller: no drawing, randomizing, or interpretation of spreads.

The tray is surfaced two ways: an always-present floating **dock/drawer** for quick access from any page, and a dedicated **`/reading` page** that lays the cards out as a full spread. Persistence is **localStorage only** (no backend, no accounts).

This replaces the dormant, unwired `favorites` concept, which doesn't fit a study/reading tool.

## 2. Goals & Non-Goals

### Goals (v1)
- A single ordered working tray of cards, each `{ id, reversed, note }`.
- Add/remove a card to/from the tray from the card detail page and from library grid thumbs.
- Floating dock (count badge) → drawer listing entries; jump to a card, remove, reorder, clear, open the full spread.
- `/reading` page: spread layout with reversed rotation, editable note/position, reversed toggle, remove, reorder, clear, links to detail; teaching empty state.
- "Reading" added to the header `PageNav`.
- localStorage persistence, SSR-safe; works offline; survives reload.
- Remove the `favorites` API from the progress store and its test.

### Non-Goals (v1 — deferred)
- Multiple named/saved readings (the store is shaped to allow this later).
- Drawing/shuffling/randomizing cards; spread templates (Celtic Cross, etc.).
- Sharing, export, print, or sync across devices.
- Changing the card detail page's content for reversed entries (it already shows Upright and Reversed).

## 3. Data Model & Store

New module `src/lib/stores/reading.svelte.ts`, mirroring the SSR-safe pattern of `progress.svelte.ts` (guards `localStorage` behind `browser` from `$app/env`; `try/catch` on read and write; module-level `$state`; reactive getters).

```ts
export type ReadingEntry = { id: string; reversed: boolean; note: string };
// internal state: { entries: ReadingEntry[] }   // ordered; each card id appears at most once
// localStorage key: 'moonlit-grimoire-reading'   (separate from progress's 'moonlit-grimoire')
```

Public API (`reading` singleton + `createReading()` factory for testing):
- `entries` — getter → `ReadingEntry[]`
- `count` — getter → number
- `has(id)` — boolean
- `add(id)` — append `{ id, reversed: false, note: '' }` if not already present; no-op if present
- `remove(id)`
- `toggle(id)` — add if absent, remove if present
- `toggleReversed(id)`
- `setNote(id, note)`
- `move(id, dir: -1 | 1)` — reorder one step, clamped at the ends
- `clear()`

Every mutation persists. `add` validates the id exists in the deck (`getCard(id)`), ignoring unknown ids. Future `saved: SavedReading[]` can be added to state without breaking this API.

## 4. Components

- **`AddToReading.svelte`** (`{ id: string }`) — a toggle button: "Add to reading" ↔ "In reading ✓" (calls `reading.toggle(id)`, reflects `reading.has(id)`). Keyboard-operable, `aria-pressed`. Placed in the card-detail rail and, as a compact icon-only `+`/`✓` variant, on each library `CardThumb` (a `compact` prop).
- **`ReadingDock.svelte`** — mounted in `+layout.svelte`, app-wide. A floating button (bottom corner) with a count badge; opens a drawer panel listing entries (thumbnail, name, reversed badge, note preview) with: jump-to-card link, reversed toggle, remove, reorder (up/down), "Clear reading," and "Open full spread" (→ `/reading`). The panel is a **fixed, non-modal slide-in** toggled by an open-state boolean (it never blocks the page); opening moves focus into the panel, and Escape or a close button dismisses it and returns focus to the trigger. The floating **trigger is always visible** (so the feature is discoverable); when the tray is empty, the opened panel shows a short hint instead of a list. Reduced-motion safe; sits on a defined z-index above page content.
- **`src/routes/reading/+page.svelte`** — the spread. Each entry: card image (rotated 180° when `reversed`), name, an editable note/position input (`setNote` on change/blur), a reversed toggle, reorder controls, remove, and a link to the full detail. A teaching empty state ("Your reading is empty — add cards from the deck or any card's page"). "Clear reading" action. `prerender = true`; the store hydrates client-side (empty during prerender, fills on mount).

## 5. Integration Points

- `+layout.svelte`: mount `<ReadingDock />` alongside the existing `<Backdrop />`.
- `PageNav.svelte`: add `{ href: '/reading', key: 'reading', label: 'Reading' }`; pages pass `current="reading"` where applicable.
- `CardThumb.svelte`: add a `compact` `AddToReading` control (does not navigate; sits over/under the thumb without hijacking the card link).
- `card/[id]/+page.svelte`: add `<AddToReading id={card.id} />` in the rail (near the pager).
- `progress.svelte.ts`: remove `favorites` from `State`, `empty()`, getters, and the `isFavorite`/`toggleFavorite` methods; remove the favorites test case in `progress.svelte.test.ts`.

## 6. Reversed Handling

`reversed` is captured per entry and reflected visually: the card image is rotated 180° in the dock and spread, with a small "reversed" badge. The card detail page is unchanged (it already presents both Upright and Reversed). Default on add is upright; the user toggles reversed in the dock or on `/reading`.

## 7. Accessibility & Aesthetic

Matches the moonlit/near-black system and design tokens. Dock trigger and drawer are keyboard-operable with visible focus; the drawer traps focus appropriately and closes on Escape; all motion respects `prefers-reduced-motion`. Card thumbnails carry descriptive `alt`. Tokens only, no raw hex.

## 8. Testing

- **Vitest (browser project, real localStorage):** `reading.svelte.test.ts` — add (idempotent, validates id), remove, toggle, toggleReversed, setNote, move (clamped), clear, and cross-instance persistence. Update `progress.svelte.test.ts` to drop the favorites case.
- **Playwright (e2e):** add a card from its detail page → dock badge shows 1 → open dock → jump to another card → open `/reading` → mark reversed and set a note → reload persists → clear empties it.

## 9. Files

```
src/lib/stores/reading.svelte.ts        # CREATE
src/lib/stores/reading.svelte.test.ts   # CREATE
src/lib/components/AddToReading.svelte   # CREATE
src/lib/components/ReadingDock.svelte    # CREATE
src/routes/reading/+page.svelte          # CREATE
src/lib/components/PageNav.svelte        # MODIFY (add Reading link)
src/lib/components/CardThumb.svelte      # MODIFY (compact AddToReading)
src/routes/+layout.svelte                # MODIFY (mount ReadingDock)
src/routes/card/[id]/+page.svelte        # MODIFY (AddToReading in rail)
src/lib/stores/progress.svelte.ts        # MODIFY (remove favorites)
src/lib/stores/progress.svelte.test.ts   # MODIFY (remove favorites test)
e2e/grimoire.test.ts                     # MODIFY (reading flow)
```
