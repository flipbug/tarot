<script lang="ts">
	import { getCard } from '$lib/data';
	import PageNav from '$lib/components/PageNav.svelte';

	type Sephira = {
		key: string;
		name: string;
		hebrew: string;
		num: number;
		title: string;
		x: number;
		y: number;
		sphere: string;
		divineName: string;
		desc: string;
	};

	// The 10 Sephiroth in their traditional Tree-of-Life positions
	// (three pillars; x 0–100 left→right, y 0–100 top→bottom).
	const SEPHIROTH: Sephira[] = [
		{
			key: 'kether',
			name: 'Kether',
			hebrew: 'כתר',
			num: 1,
			title: 'The Crown',
			x: 50,
			y: 6,
			sphere: 'Primum Mobile',
			divineName: 'Eheieh',
			desc: 'The first emanation, pure being, the unutterable point of light from which all else unfolds. Unity before division, the white brilliance that crowns the Tree.'
		},
		{
			key: 'chokmah',
			name: 'Chokmah',
			hebrew: 'חכמה',
			num: 2,
			title: 'Wisdom',
			x: 79,
			y: 18,
			sphere: 'The Zodiac (Mazloth)',
			divineName: 'Yah',
			desc: 'The primal masculine force, dynamic, outpouring will, the first stirring of energy into wisdom. The great Father who fathers the worlds.'
		},
		{
			key: 'binah',
			name: 'Binah',
			hebrew: 'בינה',
			num: 3,
			title: 'Understanding',
			x: 21,
			y: 18,
			sphere: 'Saturn (Shabbathai)',
			divineName: 'YHVH Elohim',
			desc: 'The great Mother who gives form to force, receptive understanding, the dark sea where energy takes shape. Limitation, sorrow, and the womb of becoming.'
		},
		{
			key: 'chesed',
			name: 'Chesed',
			hebrew: 'חסד',
			num: 4,
			title: 'Mercy',
			x: 79,
			y: 40,
			sphere: 'Jupiter (Tzedek)',
			divineName: 'El',
			desc: 'Loving-kindness and expansion, the benevolent ruler, grace and abundance flowing outward. The architect’s mercy that builds and sustains.'
		},
		{
			key: 'geburah',
			name: 'Geburah',
			hebrew: 'גבורה',
			num: 5,
			title: 'Severity',
			x: 21,
			y: 40,
			sphere: 'Mars (Madim)',
			divineName: 'Elohim Gibor',
			desc: 'Strength, judgment, and restriction, the necessary fire that prunes and corrects. Power, justice, and the courage to end what must end.'
		},
		{
			key: 'tiphareth',
			name: 'Tiphareth',
			hebrew: 'תפארת',
			num: 6,
			title: 'Beauty',
			x: 50,
			y: 52,
			sphere: 'The Sun (Shemesh)',
			divineName: 'YHVH Eloah va-Daath',
			desc: 'The harmonizing heart of the Tree, beauty, balance, and the sacrificed god who reconciles the spheres. The seat of the higher self.'
		},
		{
			key: 'netzach',
			name: 'Netzach',
			hebrew: 'נצח',
			num: 7,
			title: 'Victory',
			x: 79,
			y: 72,
			sphere: 'Venus (Nogah)',
			divineName: 'YHVH Tzabaoth',
			desc: 'Desire, emotion, and the green fire of nature, the enduring force of feeling, art, and love that draws the soul onward.'
		},
		{
			key: 'hod',
			name: 'Hod',
			hebrew: 'הוד',
			num: 8,
			title: 'Splendor',
			x: 21,
			y: 72,
			sphere: 'Mercury (Kokab)',
			divineName: 'Elohim Tzabaoth',
			desc: 'Intellect, language, and form, the splendor of mind that names and measures. Reason, magic, and the patterns beneath appearances.'
		},
		{
			key: 'yesod',
			name: 'Yesod',
			hebrew: 'יסוד',
			num: 9,
			title: 'Foundation',
			x: 50,
			y: 83,
			sphere: 'The Moon (Levanah)',
			divineName: 'Shaddai El Chai',
			desc: 'The foundation, the astral treasure-house of images and dreams, the tides of the subconscious through which the worlds above reach the earth.'
		},
		{
			key: 'malkuth',
			name: 'Malkuth',
			hebrew: 'מלכות',
			num: 10,
			title: 'Kingdom',
			x: 50,
			y: 96,
			sphere: 'The Elements / Earth',
			divineName: 'Adonai ha-Aretz',
			desc: 'The kingdom, the manifest world, the body, the four elements. The throne where all the powers above come to rest, and where the ascent begins.'
		}
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

	let dialogEl: HTMLDialogElement;
	let selected = $state<Sephira | null>(null);

	function open(s: Sephira) {
		selected = s;
		dialogEl.showModal();
	}
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) dialogEl.close();
	}
</script>

<svelte:head><title>The Tree of Life · The Tarot</title></svelte:head>

<section class="container intro">
	<PageNav current="tree" />
	<h1>The Tree of Life</h1>
	<p class="lede">
		Trace the lightning-flash of creation: ten luminous spheres, the Sephiroth, strung along three
		pillars and bound by twenty-two paths. Each path carries one of the Major Arcana, a current
		running between two spheres. Tap a sphere for its lore, or follow any card to its reading.
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
			<button
				class="seph"
				style="left:{s.x}%; top:{s.y}%"
				onclick={() => open(s)}
				aria-label="{s.num}. {s.name}, {s.title}"
			>
				<span class="sphere"><span class="heb">{s.hebrew}</span></span>
				<span class="seph-label">{s.num} · {s.name}</span>
			</button>
		{/each}

		{#each placed as p (p.card.id)}
			<a class="tcard" style="left:{p.x}%; top:{p.y}%" href="/card/{p.card.id}">
				<img src={p.card.image} alt={p.card.name} loading="lazy" />
				<span class="tlabel">{p.card.name}</span>
			</a>
		{/each}
	</div>
</div>

<dialog
	bind:this={dialogEl}
	class="seph-modal"
	onclick={onDialogClick}
	onclose={() => (selected = null)}
>
	{#if selected}
		<article>
			<button class="close" onclick={() => dialogEl.close()} aria-label="Close">×</button>
			<p class="m-num">{selected.num}</p>
			<h2>{selected.name} <span class="m-heb">{selected.hebrew}</span></h2>
			<p class="m-title">{selected.title}</p>
			<p class="m-desc">{selected.desc}</p>
			<dl>
				<dt>Sphere</dt>
				<dd>{selected.sphere}</dd>
				<dt>Divine name</dt>
				<dd>{selected.divineName}</dd>
			</dl>
		</article>
	{/if}
</dialog>

<style>
	.intro {
		display: grid;
		gap: var(--space-4);
		padding-bottom: var(--space-8);
	}
	.lede {
		max-width: 66ch;
		color: var(--moon-200);
	}

	.tree-wrap {
		padding: 0 var(--space-6) var(--space-16);
	}
	.tree {
		position: relative;
		width: 100%;
		max-width: 820px;
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

	/* Sephiroth, clickable spheres with Hebrew inside */
	.seph {
		position: absolute;
		transform: translate(-50%, -50%);
		display: grid;
		justify-items: center;
		gap: var(--space-1);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		z-index: 2;
	}
	.sphere {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: radial-gradient(circle at 42% 36%, var(--ink-700), var(--ink-900));
		box-shadow:
			inset 0 0 0 1px var(--candle-soft),
			0 0 18px rgba(201, 212, 232, 0.18);
		transition:
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}
	.heb {
		font-family: serif;
		font-size: 1.4rem;
		color: var(--moon-100);
		line-height: 1;
	}
	.seph-label {
		font-family: var(--font-ui);
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--moon-300);
		white-space: nowrap;
	}
	.seph:hover .sphere,
	.seph:focus-visible .sphere {
		transform: scale(1.08);
		box-shadow:
			inset 0 0 0 1px var(--candle),
			var(--glow-candle);
	}

	/* Major Arcana laid on their paths */
	.tcard {
		position: absolute;
		width: 9%;
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

	/* Sephirah modal */
	.seph-modal {
		margin: auto;
		max-width: 30rem;
		width: calc(100% - var(--space-8));
		border: 1px solid var(--ink-600);
		border-radius: var(--radius-lg);
		background: var(--ink-800);
		color: var(--moon-200);
		padding: 0;
		box-shadow: var(--glow-moon);
	}
	.seph-modal::backdrop {
		background: rgba(4, 4, 8, 0.7);
		backdrop-filter: blur(3px);
	}
	.seph-modal article {
		position: relative;
		padding: var(--space-8);
		display: grid;
		gap: var(--space-3);
	}
	.close {
		position: absolute;
		top: var(--space-3);
		right: var(--space-4);
		background: none;
		border: 0;
		color: var(--moon-300);
		font-size: 1.6rem;
		line-height: 1;
		cursor: pointer;
	}
	.close:hover {
		color: var(--moon-100);
	}
	.m-num {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		color: var(--candle);
		margin: 0;
	}
	.seph-modal h2 {
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}
	.m-heb {
		font-family: serif;
		font-size: 1.4rem;
		color: var(--moon-300);
	}
	.m-title {
		font-family: var(--font-display);
		font-size: 1.2rem;
		color: var(--candle);
		margin: 0;
	}
	.m-desc {
		margin: 0;
		color: var(--moon-200);
	}
	.seph-modal dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--space-1) var(--space-4);
		margin: var(--space-2) 0 0;
		font-size: 0.9rem;
	}
	.seph-modal dt {
		font-family: var(--font-ui);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.62rem;
		color: var(--moon-300);
		align-self: center;
	}
	.seph-modal dd {
		margin: 0;
		color: var(--moon-100);
	}

	@media (max-width: 560px) {
		.tree {
			max-width: 440px;
		}
		.sphere {
			width: 52px;
			height: 52px;
		}
		.heb {
			font-size: 1.15rem;
		}
		.seph-label {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tcard,
		.sphere {
			transition: none;
		}
	}
</style>
