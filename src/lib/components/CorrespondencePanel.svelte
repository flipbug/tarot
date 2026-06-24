<script lang="ts">
	import type { Correspondences, Element } from '$lib/data';
	import { ELEMENT_LABEL, ELEMENT_VAR } from '$lib/data/labels';
	let { correspondences: c }: { correspondences: Correspondences } = $props();

	const rows = $derived(
		[
			['Element', ELEMENT_LABEL[c.element]],
			['Planet', c.planet],
			['Zodiac', c.zodiac],
			['Decan', c.decan],
			[
				'Hebrew letter',
				c.hebrewLetter
					? `${c.hebrewLetter.letter} ${c.hebrewLetter.name} (${c.hebrewLetter.meaning})`
					: undefined
			],
			['Tree of Life', c.treePath],
			['Number', `${c.numerology.number} · ${c.numerology.meaning}`]
		].filter(([, v]) => v) as [string, string][]
	);
	const elColor = $derived(`var(${ELEMENT_VAR[c.element as Element]})`);
</script>

<dl class="corr" style="--accent:{elColor}">
	{#each rows as [k, v] (k)}
		<dt>{k}</dt>
		<dd>{v}</dd>
	{/each}
</dl>

<style>
	.corr {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--space-2) var(--space-4);
		margin: 0;
	}
	dt {
		font-family: var(--font-ui);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 0.68rem;
		color: var(--accent);
		align-self: baseline;
	}
	dd {
		margin: 0;
		color: var(--moon-100);
	}
</style>
