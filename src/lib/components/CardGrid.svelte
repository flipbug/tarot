<script lang="ts">
	import type { CardContent } from '$lib/data';
	import CardThumb from './CardThumb.svelte';
	let { cards }: { cards: CardContent[] } = $props();
</script>

{#if cards.length === 0}
	<p class="empty">No cards match this filter. Clear it to wander freely.</p>
{:else}
	<div class="grid">
		{#each cards as card (card.id)}
			<CardThumb {card} />
		{/each}
	</div>
{/if}

<style>
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-8) var(--space-6); }
	.empty { color: var(--moon-300); font-style: italic; text-align: center; padding: var(--space-16) 0; }
</style>
