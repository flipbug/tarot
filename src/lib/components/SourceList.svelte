<script lang="ts">
	import type { Source } from '$lib/data';
	let { sources }: { sources: Source[] } = $props();
</script>

<ul class="sources">
	{#each sources as s (s.url)}
		<li>
			<a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>
			<p>{s.note}</p>
		</li>
	{/each}
</ul>

<style>
	.sources {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-4);
	}
	a {
		font-family: var(--font-ui);
		color: var(--candle);
		font-size: 0.9rem;
	}
	p {
		margin: var(--space-1) 0 0;
		color: var(--moon-300);
		font-size: 0.88rem;
	}
</style>
