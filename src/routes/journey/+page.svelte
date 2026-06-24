<script lang="ts">
	import { MAJOR_ARCANA } from '$lib/data';
	import TarotCard from '$lib/components/TarotCard.svelte';
	import ProgressTracker from '$lib/components/ProgressTracker.svelte';
	import PageNav from '$lib/components/PageNav.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	const steps = MAJOR_ARCANA; // already in 0–21 order
	let i = $state(progress.journeyIndex);
	const card = $derived(steps[Math.min(i, steps.length - 1)]);

	function go(n: number) {
		i = Math.max(0, Math.min(steps.length - 1, n));
		progress.setJourneyIndex(i);
		progress.markStudied(steps[i].id);
	}
	$effect(() => {
		progress.markStudied(card.id);
	});
</script>

<svelte:head><title>The Fool's Journey · Moonlit Grimoire</title></svelte:head>

<section class="container journey">
	<PageNav current="journey" />
	<h1>Step {card.number} · {card.name}</h1>
	<ProgressTracker
		total={steps.length}
		studied={steps.filter((c) => progress.isStudied(c.id)).length}
	/>

	<div class="stage">
		<TarotCard {card} size="hero" flippable />
		<div>
			<p class="essence">{card.essence}</p>
			{#if card.journey}<p class="prose">{card.journey}</p>{/if}
			<a class="more" href="/card/{card.id}">Study this card in full →</a>
		</div>
	</div>

	<nav class="steps">
		<button onclick={() => go(i - 1)} disabled={i === 0}>← Previous</button>
		<button onclick={() => go(i + 1)} disabled={i === steps.length - 1}>Next →</button>
	</nav>
</section>

<style>
	.journey {
		display: grid;
		gap: var(--space-8);
	}
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 320px) 1fr;
		gap: var(--space-8);
		align-items: center;
	}
	.essence {
		font-family: var(--font-display);
		font-size: 1.4rem;
		color: var(--moon-100);
	}
	.more {
		font-family: var(--font-ui);
		color: var(--candle);
	}
	.steps {
		display: flex;
		justify-content: space-between;
	}
	button {
		font-family: var(--font-ui);
		padding: var(--space-2) var(--space-4);
		background: var(--veil);
		border: 1px solid var(--ink-600);
		border-radius: 999px;
		color: var(--moon-100);
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	@media (max-width: 720px) {
		.stage {
			grid-template-columns: 1fr;
		}
	}
</style>
