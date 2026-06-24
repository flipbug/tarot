<script lang="ts">
	import type { CardContent } from '$lib/data';
	import TarotCard from './TarotCard.svelte';
	let { card }: { card: CardContent } = $props();
</script>

<a class="thumb" href="/card/{card.id}">
	<TarotCard {card} size="thumb" />
	<span class="name">{card.name}</span>
</a>

<style>
	.thumb { display: grid; gap: var(--space-2); justify-items: center; transition: transform 0.2s; text-decoration: none; }
	.thumb:hover { transform: translateY(-4px); }
	.name { font-family: var(--font-ui); font-size: 0.8rem; letter-spacing: 0.04em; color: var(--moon-200); text-align: center; }
</style>
