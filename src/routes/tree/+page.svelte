<script lang="ts">
	import { getCard } from '$lib/data';

	// The 10 Sephiroth in their traditional Tree-of-Life positions
	// (three pillars; x 0–100 left→right, y 0–100 top→bottom).
	const SEPHIROTH = [
		{ key: 'kether', name: 'Kether', x: 50, y: 6 },
		{ key: 'chokmah', name: 'Chokmah', x: 79, y: 18 },
		{ key: 'binah', name: 'Binah', x: 21, y: 18 },
		{ key: 'chesed', name: 'Chesed', x: 79, y: 40 },
		{ key: 'geburah', name: 'Geburah', x: 21, y: 40 },
		{ key: 'tiphareth', name: 'Tiphareth', x: 50, y: 52 },
		{ key: 'netzach', name: 'Netzach', x: 79, y: 72 },
		{ key: 'hod', name: 'Hod', x: 21, y: 72 },
		{ key: 'yesod', name: 'Yesod', x: 50, y: 83 },
		{ key: 'malkuth', name: 'Malkuth', x: 50, y: 96 }
	];
	const S = Object.fromEntries(SEPHIROTH.map((s) => [s.key, s]));

	// The 22 paths (Golden Dawn order, paths 11–32) → the 22 Major Arcana.
	const PATHS: [string, string, string][] = [
		['kether', 'chokmah', 'the-fool'],
		['kether', 'binah', 'the-magician'],
		['kether', 'tiphareth', 'the-high-priestess'],
		['chokmah', 'binah', 'the-empress'],
		['chokmah', 'tiphareth', 'the-emperor'],
		['chokmah', 'chesed', 'the-hierophant'],
		['binah', 'tiphareth', 'the-lovers'],
		['binah', 'geburah', 'the-chariot'],
		['chesed', 'geburah', 'strength'],
		['chesed', 'tiphareth', 'the-hermit'],
		['chesed', 'netzach', 'wheel-of-fortune'],
		['geburah', 'tiphareth', 'justice'],
		['geburah', 'hod', 'the-hanged-man'],
		['tiphareth', 'netzach', 'death'],
		['tiphareth', 'yesod', 'temperance'],
		['tiphareth', 'hod', 'the-devil'],
		['netzach', 'hod', 'the-tower'],
		['netzach', 'yesod', 'the-star'],
		['netzach', 'malkuth', 'the-moon'],
		['hod', 'yesod', 'the-sun'],
		['hod', 'malkuth', 'judgement'],
		['yesod', 'malkuth', 'the-world']
	];

	const lines = PATHS.map(([f, t]) => ({ a: S[f], b: S[t] }));
	const placed = PATHS.map(([f, t, id]) => {
		const a = S[f];
		const b = S[t];
		return { card: getCard(id)!, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	});
</script>

<svelte:head><title>The Tree of Life · Moonlit Grimoire</title></svelte:head>

<section class="container intro">
	<p class="eyebrow">The Tree of Life</p>
	<h1>The Twenty-Two Paths</h1>
	<p class="lede">
		In the Hermetic Qabalah the Major Arcana are not the ten Sephiroth but the twenty-two
		<em>paths</em> that join them — the channels of descent from Kether to Malkuth. Each trump is laid
		upon its path. Follow any card to its full reading.
	</p>
</section>

<div class="tree-wrap">
	<div class="tree">
		<svg class="paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
			{#each lines as l (l.a.key + '-' + l.b.key)}
				<line x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} vector-effect="non-scaling-stroke" />
			{/each}
		</svg>

		{#each SEPHIROTH as s (s.key)}
			<div class="seph" style="left:{s.x}%; top:{s.y}%" title={s.name}>
				<span class="dot"></span>
				<span class="seph-label">{s.name}</span>
			</div>
		{/each}

		{#each placed as p (p.card.id)}
			<a class="tcard" style="left:{p.x}%; top:{p.y}%" href="/card/{p.card.id}">
				<img src={p.card.image} alt={p.card.name} loading="lazy" />
				<span class="tlabel">{p.card.name}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.intro {
		text-align: center;
		display: grid;
		gap: var(--space-3);
		justify-items: center;
		padding-bottom: var(--space-6);
	}
	.lede {
		max-width: 60ch;
		color: var(--moon-200);
	}
	.lede em {
		color: var(--moon-100);
		font-style: italic;
	}

	.tree-wrap {
		padding: 0 var(--space-6) var(--space-16);
	}
	.tree {
		position: relative;
		width: 100%;
		max-width: 620px;
		margin: 0 auto;
		aspect-ratio: 0.66;
	}
	.paths {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.paths line {
		stroke: var(--candle-soft);
		stroke-width: 1;
		opacity: 0.22;
	}

	.seph {
		position: absolute;
		transform: translate(-50%, -50%);
		display: grid;
		justify-items: center;
		gap: 2px;
		pointer-events: none;
	}
	.dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 35%, var(--moon-100), var(--moon-300));
		box-shadow: 0 0 14px rgba(201, 212, 232, 0.4);
	}
	.seph-label {
		font-family: var(--font-ui);
		font-size: 0.58rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--moon-300);
	}

	.tcard {
		position: absolute;
		width: 9.5%;
		transform: translate(-50%, -50%);
		border-radius: 4px;
		transition:
			transform 0.22s ease,
			filter 0.22s ease;
	}
	.tcard img {
		display: block;
		width: 100%;
		border-radius: 4px;
		box-shadow: 0 0 0 1px var(--edge-line);
	}
	.tlabel {
		position: absolute;
		left: 50%;
		bottom: -1.2rem;
		transform: translateX(-50%);
		white-space: nowrap;
		font-family: var(--font-ui);
		font-size: 0.62rem;
		letter-spacing: 0.04em;
		color: var(--moon-100);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}
	.tcard:hover,
	.tcard:focus-visible {
		transform: translate(-50%, -50%) scale(1.8);
		z-index: 5;
		filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.7));
		outline: none;
	}
	.tcard:hover .tlabel,
	.tcard:focus-visible .tlabel {
		opacity: 1;
	}

	@media (max-width: 560px) {
		.tree {
			max-width: 420px;
		}
		.seph-label {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tcard {
			transition: none;
		}
	}
</style>
