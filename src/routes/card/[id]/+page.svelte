<script lang="ts">
	import TarotCard from '$lib/components/TarotCard.svelte';
	import SymbolList from '$lib/components/SymbolList.svelte';
	import CorrespondencePanel from '$lib/components/CorrespondencePanel.svelte';
	import SourceList from '$lib/components/SourceList.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const card = $derived(data.card);

	const sections = $derived([
		{ id: 'meaning', label: 'Meaning' },
		{ id: 'correspondences', label: 'Correspondences' },
		{ id: 'symbolism', label: 'Symbolism' },
		{ id: 'archetype', label: 'Archetype' },
		{ id: 'mythology', label: 'Mythology' },
		{ id: 'nature', label: 'Nature' },
		{ id: 'lightshadow', label: 'Light & Shadow' },
		...(card.journey ? [{ id: 'journey', label: "Fool's Journey" }] : []),
		{ id: 'sources', label: 'Sources' }
	]);

	let active = $state('meaning');

	$effect(() => {
		progress.markStudied(card.id);
	});

	// Scroll-spy: highlight the section currently in the reading band.
	// Reading `sections` (a $derived of the card) makes this re-run on navigation.
	// Client-only via $effect, so prerender never touches the DOM.
	$effect(() => {
		const els = sections
			.map((s) => document.getElementById(s.id))
			.filter((el): el is HTMLElement => el !== null);
		if (els.length === 0) return;
		const obs = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) active = e.target.id;
			},
			{ rootMargin: '-15% 0px -75% 0px' }
		);
		for (const el of els) obs.observe(el);
		return () => obs.disconnect();
	});
</script>

<svelte:head><title>{card.name} · The Tarot</title></svelte:head>

<article class="detail container">
	<aside class="rail">
		<div class="rail-sticky">
			<TarotCard {card} size="hero" flippable />
			<nav class="outline" aria-label="Card sections">
				<ul>
					{#each sections as s (s.id)}
						<li><a href="#{s.id}" class:active={active === s.id}>{s.label}</a></li>
					{/each}
				</ul>
			</nav>
			<nav class="rail-pager" aria-label="Browse cards">
				<a href="/card/{data.prev.id}" title={data.prev.name}>← Prev</a>
				<a class="all" href="/library">All</a>
				<a href="/card/{data.next.id}" title={data.next.name}>Next →</a>
			</nav>
		</div>
	</aside>

	<div class="content">
		<header class="lede">
			<p class="eyebrow">
				{card.arcana === 'major' ? `Major Arcana · ${card.number}` : `${card.suit}`}
			</p>
			<h1>{card.name}</h1>
			<p class="essence">{card.essence}</p>
			<ul class="keywords">
				{#each card.keywords as k (k)}<li>{k}</li>{/each}
			</ul>
		</header>

		<section id="meaning">
			<h2>Meaning</h2>
			<div class="two">
				<div>
					<h3>Upright</h3>
					<p class="prose">{card.upright}</p>
				</div>
				<div>
					<h3>Reversed</h3>
					<p class="prose">{card.reversed}</p>
				</div>
			</div>
		</section>

		<section id="correspondences">
			<h2>Correspondences</h2>
			<CorrespondencePanel correspondences={card.correspondences} />
		</section>

		<section id="symbolism">
			<h2>Symbolism</h2>
			<SymbolList symbols={card.symbolism} />
			<p class="prose">{card.symbolismProse}</p>
		</section>

		<section id="archetype">
			<h2>Archetype: {card.archetype.name}</h2>
			<p class="prose">{card.archetype.description}</p>
		</section>

		<section id="mythology">
			<h2>Mythology</h2>
			<p class="prose">{card.mythology}</p>
		</section>

		<section id="nature">
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

		<section id="lightshadow" class="lightshadow">
			<h2>Light &amp; Shadow</h2>
			<div class="ls-grid">
				<div>
					<h3>Light</h3>
					<p>{card.lightShadow.light}</p>
				</div>
				<div>
					<h3>Shadow</h3>
					<p>{card.lightShadow.shadow}</p>
				</div>
			</div>
			<p class="affirm">“{card.lightShadow.affirmation}”</p>
		</section>

		{#if card.journey}
			<section id="journey">
				<h2>The Fool's Journey</h2>
				<p class="prose">{card.journey}</p>
			</section>
		{/if}

		<section id="sources">
			<h2>Sources &amp; further reading</h2>
			<SourceList sources={card.sources} />
		</section>
	</div>
</article>

<style>
	.detail {
		display: grid;
		grid-template-columns: minmax(210px, 250px) minmax(0, 1fr);
		gap: var(--space-12);
		/* no align-items: start; the rail cell must stretch to full row height
		   so its sticky child can stay pinned through the whole scroll */
	}
	.rail-sticky {
		position: sticky;
		top: var(--space-6);
		max-height: calc(100dvh - var(--space-6) * 2);
		overflow-y: auto;
		overscroll-behavior: contain;
		display: grid;
		gap: var(--space-8);
		padding-right: var(--space-1);
		scrollbar-width: thin;
	}
	.outline {
		font-family: var(--font-ui);
		font-size: 0.78rem;
	}
	.outline ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.outline a {
		display: block;
		padding: var(--space-1) 0 var(--space-1) var(--space-4);
		position: relative;
		color: var(--moon-300);
		letter-spacing: 0.04em;
		transition: color 0.18s ease;
	}
	.outline a:hover {
		color: var(--moon-100);
	}
	.outline a.active {
		color: var(--candle);
	}
	.outline a.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--candle);
		transform: translateY(-50%);
		box-shadow: var(--glow-candle);
	}
	.rail-pager {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		font-family: var(--font-ui);
		font-size: 0.74rem;
		letter-spacing: 0.04em;
		border-top: 1px solid var(--ink-700);
		padding-top: var(--space-3);
	}
	.rail-pager a {
		color: var(--moon-300);
	}
	.rail-pager a:hover {
		color: var(--moon-100);
	}
	.rail-pager .all {
		color: var(--moon-200);
	}

	.content {
		display: grid;
		gap: var(--space-12);
		min-width: 0;
	}
	.content section {
		scroll-margin-top: var(--space-8);
	}
	.lede {
		display: grid;
		gap: var(--space-3);
	}
	.lede .eyebrow {
		text-transform: capitalize;
	}
	.lede h1 {
		margin: 0;
		font-size: clamp(2.2rem, 4.5vw, 3.2rem);
	}
	.essence {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: clamp(1.3rem, 2.4vw, 1.6rem);
		line-height: 1.4;
		color: var(--moon-100);
		margin: 0;
		max-width: 44ch;
		text-wrap: pretty;
	}
	.keywords {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		padding: 0;
		margin: var(--space-1) 0 0;
	}
	.keywords li {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		padding: 2px var(--space-3);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-200);
	}
	.prose {
		max-width: 68ch;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
	}
	.ls-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
		margin-bottom: var(--space-6);
	}
	.affirm {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--candle);
		text-align: center;
		margin: 0;
		text-wrap: balance;
	}

	@media (max-width: 920px) {
		.detail {
			grid-template-columns: 1fr;
			gap: var(--space-8);
		}
		.rail-sticky {
			position: static;
			max-height: none;
			overflow: visible;
		}
		.outline {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.two,
		.ls-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
