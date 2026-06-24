<script lang="ts">
	import type { CardFilter } from '$lib/data/filter';
	import type { Arcana, Suit, Element } from '$lib/data';
	import { SUIT_LABEL, ELEMENT_LABEL } from '$lib/data/labels';

	let { filter = $bindable() }: { filter: CardFilter } = $props();

	const arcana: Arcana[] = ['major', 'minor'];
	const suits: Suit[] = ['wands', 'cups', 'swords', 'pentacles'];
	const elements: Element[] = ['fire', 'water', 'air', 'earth', 'spirit'];

	function toggle<K extends keyof CardFilter>(key: K, value: CardFilter[K]) {
		filter = { ...filter, [key]: filter[key] === value ? undefined : value };
	}
	function clearAll() {
		filter = {};
	}
</script>

<div class="bar">
	<input
		class="search"
		type="search"
		placeholder="Search the deck…"
		value={filter.query ?? ''}
		oninput={(e) => (filter = { ...filter, query: e.currentTarget.value })}
		aria-label="Search cards by name or keyword"
	/>
	<div class="groups">
		<fieldset>
			<legend>Arcana</legend>
			{#each arcana as a (a)}
				<button class:on={filter.arcana === a} onclick={() => toggle('arcana', a)}>{a}</button>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Suit</legend>
			{#each suits as s (s)}
				<button class:on={filter.suit === s} onclick={() => toggle('suit', s)}
					>{SUIT_LABEL[s]}</button
				>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Element</legend>
			{#each elements as el (el)}
				<button class:on={filter.element === el} onclick={() => toggle('element', el)}
					>{ELEMENT_LABEL[el]}</button
				>
			{/each}
		</fieldset>
	</div>
	<button class="clear" onclick={clearAll}>Clear</button>
</div>

<style>
	.bar {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	.search {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: var(--radius);
		color: var(--moon-100);
		font-family: var(--font-ui);
	}
	.groups {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	legend {
		float: left;
		margin-right: var(--space-2);
		font-family: var(--font-ui);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.66rem;
		color: var(--moon-300);
	}
	button {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		padding: var(--space-1) var(--space-3);
		background: transparent;
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-200);
		cursor: pointer;
		text-transform: capitalize;
	}
	button.on {
		background: var(--candle);
		color: var(--ink-900);
		border-color: var(--candle);
		box-shadow: var(--glow-candle);
	}
	.clear {
		justify-self: start;
	}
</style>
