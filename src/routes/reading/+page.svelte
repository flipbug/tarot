<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	import { CARDS, getCard, type CardContent } from '$lib/data';
	import PageNav from '$lib/components/PageNav.svelte';

	const entries = $derived(
		reading.entries
			.map((e) => ({ ...e, card: getCard(e.id) }))
			.filter((e): e is typeof e & { card: CardContent } => e.card !== undefined)
	);

	function drawRandom() {
		const pool = CARDS.filter((c) => !reading.has(c.id));
		if (pool.length === 0) return;
		reading.add(pool[Math.floor(Math.random() * pool.length)].id);
	}
</script>

<svelte:head><title>Reading · The Tarot</title></svelte:head>

<section class="container reading">
	<PageNav current="reading" />
	<h1>Your reading</h1>

	{#if entries.length === 0}
		<p class="empty">
			Your reading is empty. Draw a card, or add them from the deck or any card's page, and they
			gather here as a spread you can lay out, mark reversed, and annotate.
		</p>
		<button class="draw" onclick={drawRandom}>Draw a card</button>
	{:else}
		<div class="bar">
			<span class="count">{entries.length} {entries.length === 1 ? 'card' : 'cards'}</span>
			<div class="bar-actions">
				<button class="draw" onclick={drawRandom} disabled={entries.length >= CARDS.length}
					>Draw a card</button
				>
				<button class="clear" onclick={() => reading.clear()}>Clear reading</button>
			</div>
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
	.bar-actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}
	.clear {
		background: none;
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		padding: var(--space-1) var(--space-4);
		color: var(--moon-200);
		cursor: pointer;
	}
	.draw {
		justify-self: start;
		background: none;
		border: 1px solid var(--candle-soft);
		border-radius: 999px;
		padding: var(--space-1) var(--space-4);
		color: var(--candle);
		font-family: var(--font-ui);
		font-size: 0.8rem;
		cursor: pointer;
	}
	.draw:hover {
		color: var(--moon-100);
		border-color: var(--candle);
	}
	.draw:disabled {
		opacity: 0.4;
		cursor: default;
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
