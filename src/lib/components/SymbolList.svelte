<script lang="ts">
	import type { SymbolNote } from '$lib/data';
	let { symbols }: { symbols: SymbolNote[] } = $props();
</script>

<ul class="symbols">
	{#each symbols as s (s.symbol)}
		<li>
			<span class="sym">{s.symbol}</span>
			<span class="mean">{s.meaning}</span>
		</li>
	{/each}
</ul>

<style>
	.symbols {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
	}
	li {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4) 0;
		border-top: 1px solid var(--ink-700);
	}
	li:first-child {
		border-top: 0;
		padding-top: 0;
	}
	.sym {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.2rem;
		color: var(--moon-100);
	}
	.mean {
		color: var(--moon-200);
		font-size: 0.98rem;
		max-width: 64ch;
	}
</style>
