# Design

Visual system for The Moonlit Grimoire. Tokens live in `src/lib/styles/tokens.css`; fonts in `src/lib/styles/fonts.css`; base/reset in `src/lib/styles/global.css`. This document reflects the **refined, quieter direction** (post first-iteration feedback).

## Theme

Nocturnal, near-black, editorial-occult. The page is the night; content is the only lit thing. Deep, calm, sophisticated — closer to an illuminated manuscript photographed in the dark than to a "mystical" theme. Dark mode is intrinsic (the product is used at night, in a contemplative mood); there is no light theme.

## Color

Strategy: **restrained** — a near-black ground, an ink/moonlight text ramp, and a single warm candle-gold accent (≤10% of surface). Color is carried by the card art itself, not the chrome.

- Ground: near-black, faintly cool (`--ink-900` ≈ `#08080d`). NOT a colored gradient.
- Surfaces/veils: barely-lifted near-black (`--ink-800/700/600`).
- Text ramp (moonlight): `--moon-100` (brightest, headings) → `--moon-200` (body) → `--moon-300` (muted labels). Body must hold ≥4.5:1 on the ground.
- Accent: `--candle` warm gold (links, active filters, affirmations, focus ring). Used sparingly.
- Elemental hues (`--el-fire/water/air/earth/spirit`): reserved for tiny correspondence accents only, never large fills.
- A faint silver (`--silver`) for hairline rules and the moon.

## Typography

Pair on a contrast axis: an elegant **display serif** + a readable **text serif** in distinct roles + a clean **sans** for micro-labels.

- Display / headings: **Cormorant Garamond** (calm, high-contrast, literary; replaces Aktura which was too distracting). Weights 500/600. `text-wrap: balance`, letter-spacing ≥ -0.02em, clamp max ≤ 4rem.
- Reading body: **Sentient** (self-hosted, 400/500). Prose capped at 65–75ch, `text-wrap: pretty`.
- Micro-labels / correspondence keys / chips: system sans (`--font-ui`), small, uppercase, tracked — used as sparse technical labels, not as an eyebrow on every section.

## Backdrop

A single fixed, `aria-hidden` **cosmic backdrop** (replaces the drifting colored mist): near-black + a very subtle dither/grain overlay + a sparse, faint starfield, optionally a barely-there central glow. Essentially static (no large motion); any shimmer is gated behind `prefers-reduced-motion`. Minimal — it must never compete with the content.

## Components

- **TarotCard**: pure-CSS 3D (cursor tilt + holographic foil + flip + glow); reduced-motion safe; keyboard-operable with `aria-pressed` when flippable. Unchanged structurally.
- **Card detail (`/card/[id]`)**: two-column — a **sticky left rail** (the card + its essence/summary + a section **outline** with anchor links and active-section highlighting) beside a scrolling content column whose sections carry ids. Collapses to a single column on narrow viewports.
- **Library**: responsive card grid + filter chips (active = candle-gold) + search.
- **Atmosphere**: MoonPhase motif (used sparingly on the Altar), the cosmic backdrop globally.

## Layout & Motion

- Container max ~72rem; generous, varied vertical rhythm via `--space-*`.
- Semantic z-index scale; backdrop sits at `z-index: -1`.
- Motion: gentle, exponential ease-out; the card tilt/flip and subtle reveals only. Global `@media (prefers-reduced-motion: reduce)` zeroes durations; smooth anchor scrolling is gated likewise.
