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
				{#each card.keywords as k (k)}<li>{k}</li>{/each}
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
		<p class="affirm">"{card.lightShadow.affirmation}"</p>
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
