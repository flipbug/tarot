<script lang="ts">
	import { reading } from '$lib/stores/reading.svelte';
	let { id, compact = false }: { id: string; compact?: boolean } = $props();
	const inReading = $derived(reading.has(id));
</script>

<button
	class="add"
	class:compact
	class:on={inReading}
	aria-pressed={inReading}
	title={inReading ? 'In reading — click to remove' : 'Add to reading'}
	onclick={() => reading.toggle(id)}
>
	{#if compact}
		<span aria-hidden="true">{inReading ? '✓' : '+'}</span>
		<span class="sr-only">{inReading ? 'In reading' : 'Add to reading'}</span>
	{:else}
		{inReading ? 'In reading ✓' : '＋ Add to reading'}
	{/if}
</button>

<style>
	.add {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		background: var(--veil);
		color: var(--moon-200);
		cursor: pointer;
		transition:
			color 0.18s ease,
			border-color 0.18s ease,
			background 0.18s ease;
	}
	.add:hover {
		color: var(--moon-100);
		border-color: var(--candle-soft);
	}
	.add.on {
		color: var(--candle);
		border-color: var(--candle);
	}
	.add.compact {
		padding: 0;
		width: 26px;
		height: 26px;
		display: grid;
		place-items: center;
		font-size: 1rem;
		border-radius: 50%;
		background: var(--veil);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
