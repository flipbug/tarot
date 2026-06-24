<script lang="ts">
	import type { CardContent } from '$lib/data';
	import TarotCard from './TarotCard.svelte';
	import AddToReading from './AddToReading.svelte';
	let { card }: { card: CardContent } = $props();
</script>

<div class="thumb-wrap">
	<a class="thumb" href="/card/{card.id}">
		<TarotCard {card} size="thumb" />
		<span class="name">{card.name}</span>
	</a>
	<div class="add-overlay"><AddToReading id={card.id} compact /></div>
</div>

<style>
	.thumb-wrap {
		position: relative;
		display: grid;
	}
	.thumb {
		display: grid;
		gap: var(--space-2);
		justify-items: center;
		transition: transform 0.2s;
		text-decoration: none;
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
	.add-overlay {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		opacity: 0;
		transition: opacity 0.18s ease;
	}
	.thumb-wrap:hover .add-overlay,
	.add-overlay:focus-within {
		opacity: 1;
	}
	@media (hover: none) {
		.add-overlay {
			opacity: 1;
		}
	}
</style>
