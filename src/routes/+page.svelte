<script lang="ts">
	import CardBack from '$lib/components/CardBack.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { CARDS, getCard } from '$lib/data';
	import { goto } from '$app/navigation';
	const last = $derived(progress.lastCardId ? getCard(progress.lastCardId) : undefined);

	function draw() {
		const card = CARDS[Math.floor(Math.random() * CARDS.length)];
		goto(`/card/${card.id}`);
	}
</script>

<svelte:head><title>The Tarot · Learn the 78 cards</title></svelte:head>

<section class="altar container">
	<div class="motif-wrap">
		<button class="motif" onclick={draw} aria-label="Draw a random card">
			<CardBack />
		</button>
		<span class="draw-hint">Tap to draw a card</span>
	</div>
	<h1>The Tarot</h1>
	<p class="lede">
		A sacred study of the seventy-eight cards: their symbols, numbers, stars, and the many
		traditions that illuminate them. One card at a time.
	</p>
	<nav class="ways" aria-label="Enter the grimoire">
		<a class="way" href="/library">
			<span class="way-text">
				<span class="way-name">The Deck</span>
				<span class="way-desc">All seventy-eight cards, to browse and filter</span>
			</span>
			<span class="way-arrow" aria-hidden="true">→</span>
		</a>
		<a class="way" href="/journey">
			<span class="way-text">
				<span class="way-name">The Fool's Journey</span>
				<span class="way-desc">The twenty-two Major Arcana, walked in order</span>
			</span>
			<span class="way-arrow" aria-hidden="true">→</span>
		</a>
		<a class="way" href="/tree">
			<span class="way-text">
				<span class="way-name">The Tree of Life</span>
				<span class="way-desc">The Major Arcana on their twenty-two paths</span>
			</span>
			<span class="way-arrow" aria-hidden="true">→</span>
		</a>
	</nav>
	{#if last}
		<a class="resume" href="/card/{last.id}">
			Continue where you left off: <em>{last.name}</em> →
		</a>
	{/if}
	<a class="about-link" href="/about">About the sources &amp; traditions</a>
</section>

<style>
	.altar {
		min-height: 90vh;
		display: grid;
		place-content: center;
		justify-items: center;
		text-align: center;
	}
	.motif-wrap {
		display: grid;
		justify-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}
	.motif {
		display: block;
		width: 210px;
		padding: 0;
		border: 0;
		background: none;
		border-radius: var(--radius);
		cursor: pointer;
	}
	.motif:focus-visible {
		outline-offset: 6px;
	}
	.draw-hint {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--moon-300);
	}
	.lede {
		max-width: 46ch;
		margin: var(--space-3) 0 0;
		color: var(--moon-200);
		font-size: 1.15rem;
		line-height: 1.6;
		text-wrap: pretty;
	}

	/* Ways in — a grimoire's table of contents, not a card grid */
	.ways {
		width: 100%;
		max-width: 32rem;
		margin-top: var(--space-8);
		text-align: left;
		border-top: 1px solid var(--ink-700);
	}
	.way {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-2);
		border-bottom: 1px solid var(--ink-700);
	}
	.way-text {
		display: grid;
		gap: 3px;
		min-width: 0;
	}
	.way-name {
		font-family: var(--font-display);
		font-size: 1.5rem;
		line-height: 1.05;
		color: var(--moon-100);
		transition: color 0.3s var(--ease-out);
	}
	.way-desc {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.02em;
		color: var(--moon-300);
	}
	.way-arrow {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		color: var(--moon-300);
		transition:
			transform 0.3s var(--ease-out),
			color 0.3s var(--ease-out);
	}
	.way:hover .way-name,
	.way:focus-visible .way-name {
		color: var(--candle);
	}
	.way:hover .way-arrow,
	.way:focus-visible .way-arrow {
		transform: translateX(6px);
		color: var(--candle);
	}
	.resume {
		margin-top: var(--space-4);
		font-family: var(--font-ui);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: var(--moon-300);
	}
	.resume em {
		color: var(--candle);
		font-style: normal;
	}
	.resume:hover {
		color: var(--moon-100);
	}
	.about-link {
		margin-top: var(--space-8);
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
		color: var(--moon-300);
	}
</style>
