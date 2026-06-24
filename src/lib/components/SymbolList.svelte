<script lang="ts">
	import type { SymbolNote } from '$lib/data';
	let { symbols }: { symbols: SymbolNote[] } = $props();
</script>

<ul class="symbols">
	{#each symbols as s (s.symbol)}
		<li><span class="sym">{s.symbol}</span><span class="mean">{s.meaning}</span></li>
	{/each}
</ul>

<style>
	.symbols {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
	}
	li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		background: var(--veil);
		border-radius: var(--radius);
		border-left: 2px solid var(--candle-soft);
	}
	.sym {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--moon-100);
	}
	.mean {
		color: var(--moon-200);
		font-size: 0.95rem;
	}
</style>
