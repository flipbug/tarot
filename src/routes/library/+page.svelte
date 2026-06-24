<script lang="ts">
	import { CARDS } from '$lib/data';
	import { filterCards, type CardFilter } from '$lib/data/filter';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import CardGrid from '$lib/components/CardGrid.svelte';

	let filter = $state<CardFilter>({});
	const visible = $derived(filterCards(CARDS, filter));
</script>

<svelte:head><title>The Deck · Moonlit Grimoire</title></svelte:head>

<section class="container">
	<p class="eyebrow">The Deck</p>
	<h1>Seventy-eight doorways</h1>
	<FilterBar bind:filter />
	<p class="count">{visible.length} cards</p>
	<CardGrid cards={visible} />
</section>

<style>
	.count { font-family: var(--font-ui); color: var(--moon-300); font-size: 0.8rem; margin: 0 0 var(--space-4); }
</style>
